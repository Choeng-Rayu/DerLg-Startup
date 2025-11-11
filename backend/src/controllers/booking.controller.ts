import { Request, Response } from 'express';
import Booking, { BookingStatus, PaymentStatus, EscrowStatus, PaymentType } from '../models/Booking';
import Room from '../models/Room';
import Hotel from '../models/Hotel';
import User from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../utils/logger';
import { Op } from 'sequelize';
import {
  getAllPaymentOptions,
  calculateAmountDue,
  validatePaymentType,
} from '../services/payment-options.service';
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../services/google-calendar.service';
import websocketService from '../services/websocket.service';

/**
 * Create a new booking
 * POST /api/bookings
 */
export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendError(res, 'AUTH_1003', 'User not authenticated', 401);
    }

    const {
      hotel_id,
      room_id,
      check_in,
      check_out,
      guests,
      guest_details,
      payment_method = 'paypal',
      payment_type = 'full',
    } = req.body;

    // Validate required fields
    if (!hotel_id || !room_id || !check_in || !check_out || !guests || !guest_details) {
      return sendError(
        res,
        'VAL_2002',
        'Missing required fields: hotel_id, room_id, check_in, check_out, guests, guest_details',
        400
      );
    }

    // Validate dates
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return sendError(
        res,
        'VAL_2003',
        'Check-in date cannot be in the past',
        400
      );
    }

    if (checkOutDate <= checkInDate) {
      return sendError(
        res,
        'VAL_2003',
        'Check-out date must be after check-in date',
        400
      );
    }

    // Validate guest count
    if (!guests.adults || guests.adults < 1) {
      return sendError(
        res,
        'VAL_2001',
        'At least 1 adult is required',
        400
      );
    }

    if (guests.children < 0) {
      return sendError(
        res,
        'VAL_2001',
        'Children count cannot be negative',
        400
      );
    }

    // Validate guest details
    if (!guest_details.name || !guest_details.email || !guest_details.phone) {
      return sendError(
        res,
        'VAL_2002',
        'Guest details must include name, email, and phone',
        400
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guest_details.email)) {
      return sendError(
        res,
        'VAL_2001',
        'Invalid email format',
        400
      );
    }

    // Check if hotel exists
    const hotel = await Hotel.findByPk(hotel_id);
    if (!hotel) {
      return sendError(
        res,
        'RES_3001',
        'Hotel not found',
        404
      );
    }

    // Check if hotel is active
    if (hotel.status !== 'active') {
      return sendError(
        res,
        'RES_3003',
        'Hotel is not available for booking',
        400
      );
    }

    // Check if room exists and belongs to the hotel
    const room = await Room.findOne({
      where: {
        id: room_id,
        hotel_id: hotel_id,
      },
    });

    if (!room) {
      return sendError(
        res,
        'RES_3001',
        'Room not found or does not belong to the specified hotel',
        404
      );
    }

    // Check if room is active
    if (!room.is_active) {
      return sendError(
        res,
        'RES_3003',
        'Room is not available for booking',
        400
      );
    }

    // Check room capacity
    const totalGuests = guests.adults + (guests.children || 0);
    if (totalGuests > room.capacity) {
      return sendError(
        res,
        'VAL_2001',
        `Room capacity exceeded. Maximum capacity is ${room.capacity} guests`,
        400
      );
    }

    // Check room availability for the date range
    const conflictingBookings = await Booking.count({
      where: {
        room_id: room_id,
        status: {
          [Op.in]: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
        [Op.or]: [
          {
            // New booking starts during existing booking
            check_in: {
              [Op.between]: [check_in, check_out],
            },
          },
          {
            // New booking ends during existing booking
            check_out: {
              [Op.between]: [check_in, check_out],
            },
          },
          {
            // New booking completely overlaps existing booking
            [Op.and]: [
              {
                check_in: {
                  [Op.lte]: check_in,
                },
              },
              {
                check_out: {
                  [Op.gte]: check_out,
                },
              },
            ],
          },
        ],
      },
    });

    if (conflictingBookings >= room.total_rooms) {
      return sendError(
        res,
        'BOOK_4001',
        'Room is not available for the selected dates',
        400
      );
    }

    // Calculate nights
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate pricing
    const roomRate = parseFloat(room.price_per_night.toString());
    const subtotal = roomRate * nights;
    
    // Apply room discount if available
    let discount = 0;
    if (room.discount_percentage > 0) {
      discount = (subtotal * room.discount_percentage) / 100;
    }

    // Check for student discount
    const user = await User.findByPk(userId);
    let studentDiscount = 0;
    if (user && user.is_student && user.student_discount_remaining > 0) {
      // Apply 10% student discount
      studentDiscount = (subtotal * 10) / 100;
    }

    // Calculate tax (10% VAT)
    const taxableAmount = subtotal - discount - studentDiscount;
    const tax = taxableAmount * 0.1;

    // Calculate total
    const total = taxableAmount + tax;

    // Validate payment type
    if (!validatePaymentType(payment_type)) {
      return sendError(
        res,
        'VAL_2001',
        'Invalid payment type. Must be deposit, milestone, or full',
        400
      );
    }

    // Calculate final total based on payment type
    let finalTotal = total;
    let paymentDiscount = 0;
    let bonusServices: string[] = [];

    if (payment_type === PaymentType.FULL) {
      // 5% discount for full payment
      paymentDiscount = Math.round((total * 0.05) * 100) / 100;
      finalTotal = Math.round((total - paymentDiscount) * 100) / 100;
      bonusServices = [
        'Free airport pickup',
        'Priority check-in',
        'Complimentary welcome drink',
      ];
    }

    // Create pricing object
    const pricing = {
      room_rate: roomRate,
      subtotal: subtotal,
      discount: discount,
      promo_code: null,
      student_discount: studentDiscount,
      tax: tax,
      total: Math.round(finalTotal * 100) / 100, // Round to 2 decimal places
    };

    // Calculate amount due based on payment type
    const amountDue = calculateAmountDue(payment_type as PaymentType, finalTotal);

    // Create payment object with payment schedule
    const payment = {
      method: payment_method,
      type: payment_type,
      status: PaymentStatus.PENDING,
      transactions: [],
      escrow_status: EscrowStatus.HELD,
    };

    // Create booking
    const booking = await Booking.create({
      user_id: userId,
      hotel_id: hotel_id,
      room_id: room_id,
      check_in: check_in,
      check_out: check_out,
      nights: nights,
      guests: guests,
      guest_details: {
        ...guest_details,
        special_requests: guest_details.special_requests || '',
      },
      pricing: pricing,
      payment: payment,
      status: BookingStatus.PENDING,
      cancellation: null,
      calendar_event_id: null,
    });

    // Update student discount remaining if used
    if (studentDiscount > 0 && user) {
      await user.update({
        student_discount_remaining: user.student_discount_remaining - 1,
      });
    }

    // TODO: Schedule automatic cancellation after 15 minutes if payment not completed
    // This will be implemented in the payment processing task

    logger.info(`Booking created: ${booking.booking_number} by user ${userId}`);

    // Fetch complete booking with associations
    const completeBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Hotel,
          as: 'hotel',
          attributes: ['id', 'name', 'location', 'contact', 'images'],
        },
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'room_type', 'capacity', 'price_per_night', 'images'],
        },
      ],
    });

    // Get payment options for the booking
    const paymentOptions = getAllPaymentOptions(finalTotal, checkInDate);

    return sendSuccess(
      res,
      {
        booking: completeBooking?.toSafeObject(),
        payment_info: {
          amount_due: amountDue,
          payment_type: payment_type,
          discount_applied: paymentDiscount,
          bonus_services: bonusServices,
          payment_options: paymentOptions,
        },
        message: 'Booking created successfully. Please complete payment within 15 minutes.',
      },
      'Booking created successfully',
      201
    );
  } catch (error: any) {
    logger.error('Error creating booking:', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return sendError(
        res,
        'VAL_2001',
        error.errors[0]?.message || 'Validation error',
        400
      );
    }

    return sendError(
      res,
      'SYS_9001',
      'Failed to create booking',
      500,
      error.message
    );
  }
};

/**
 * Get payment options for a booking
 * POST /api/bookings/payment-options
 */
export const getPaymentOptions = async (req: Request, res: Response) => {
  try {
    const {
      room_id,
      check_in,
      check_out,
      guests,
      deposit_percentage = 60,
    } = req.body;

    // Validate required fields
    if (!room_id || !check_in || !check_out || !guests) {
      return sendError(
        res,
        'VAL_2002',
        'Missing required fields: room_id, check_in, check_out, guests',
        400
      );
    }

    // Validate deposit percentage
    if (deposit_percentage < 50 || deposit_percentage > 70) {
      return sendError(
        res,
        'VAL_2001',
        'Deposit percentage must be between 50% and 70%',
        400
      );
    }

    // Validate dates
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return sendError(
        res,
        'VAL_2003',
        'Check-in date cannot be in the past',
        400
      );
    }

    if (checkOutDate <= checkInDate) {
      return sendError(
        res,
        'VAL_2003',
        'Check-out date must be after check-in date',
        400
      );
    }

    // Check if room exists
    const room = await Room.findByPk(room_id);
    if (!room) {
      return sendError(
        res,
        'RES_3001',
        'Room not found',
        404
      );
    }

    // Calculate nights
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate base pricing
    const roomRate = parseFloat(room.price_per_night.toString());
    const subtotal = roomRate * nights;
    
    // Apply room discount if available
    let discount = 0;
    if (room.discount_percentage > 0) {
      discount = (subtotal * room.discount_percentage) / 100;
    }

    // Check for student discount (if user is authenticated)
    const userId = (req as any).user?.id;
    let studentDiscount = 0;
    if (userId) {
      const user = await User.findByPk(userId);
      if (user && user.is_student && user.student_discount_remaining > 0) {
        studentDiscount = (subtotal * 10) / 100;
      }
    }

    // Calculate tax (10% VAT)
    const taxableAmount = subtotal - discount - studentDiscount;
    const tax = taxableAmount * 0.1;

    // Calculate total
    const total = Math.round((taxableAmount + tax) * 100) / 100;

    // Get all payment options
    const paymentOptions = getAllPaymentOptions(total, checkInDate, deposit_percentage);

    return sendSuccess(
      res,
      {
        pricing_breakdown: {
          room_rate: roomRate,
          nights: nights,
          subtotal: subtotal,
          room_discount: discount,
          student_discount: studentDiscount,
          tax: tax,
          total: total,
        },
        payment_options: paymentOptions,
      },
      'Payment options calculated successfully'
    );
  } catch (error: any) {
    logger.error('Error calculating payment options:', error);
    return sendError(
      res,
      'SYS_9001',
      'Failed to calculate payment options',
      500,
      error.message
    );
  }
};

/**
 * Get all bookings for the authenticated user
 * GET /api/bookings
 */
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendError(res, 'AUTH_1003', 'User not authenticated', 401);
    }

    // Get query parameters for filtering
    const { status, category } = req.query;

    // Build where clause
    const whereClause: any = { user_id: userId };

    // Filter by status if provided
    if (status && typeof status === 'string') {
      const validStatuses = Object.values(BookingStatus);
      if (validStatuses.includes(status as BookingStatus)) {
        whereClause.status = status;
      } else {
        return sendError(
          res,
          'VAL_2001',
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          400
        );
      }
    }

    // Fetch bookings with associations
    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        {
          model: Hotel,
          as: 'hotel',
          attributes: ['id', 'name', 'location', 'contact', 'images', 'average_rating'],
        },
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'room_type', 'capacity', 'price_per_night', 'images'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Categorize bookings if category filter is provided
    let categorizedBookings: any = {};
    
    if (category === 'all' || !category) {
      // Categorize into upcoming, active, and past
      categorizedBookings = {
        upcoming: bookings.filter(b => b.isUpcoming()).map(b => b.toSafeObject()),
        active: bookings.filter(b => b.isActive()).map(b => b.toSafeObject()),
        past: bookings.filter(b => b.isPast()).map(b => b.toSafeObject()),
      };
    } else if (category === 'upcoming') {
      categorizedBookings = bookings.filter(b => b.isUpcoming()).map(b => b.toSafeObject());
    } else if (category === 'active') {
      categorizedBookings = bookings.filter(b => b.isActive()).map(b => b.toSafeObject());
    } else if (category === 'past') {
      categorizedBookings = bookings.filter(b => b.isPast()).map(b => b.toSafeObject());
    } else {
      return sendError(
        res,
        'VAL_2001',
        'Invalid category. Must be one of: upcoming, active, past, all',
        400
      );
    }

    logger.info(`Retrieved ${bookings.length} bookings for user ${userId}`);

    return sendSuccess(
      res,
      {
        bookings: category === 'all' || !category ? categorizedBookings : categorizedBookings,
        total: bookings.length,
      },
      'Bookings retrieved successfully'
    );
  } catch (error: any) {
    logger.error('Error retrieving bookings:', error);
    return sendError(
      res,
      'SYS_9001',
      'Failed to retrieve bookings',
      500,
      error.message
    );
  }
};

/**
 * Get a specific booking by ID
 * GET /api/bookings/:id
 */
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 'AUTH_1003', 'User not authenticated', 401);
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return sendError(res, 'VAL_2001', 'Invalid booking ID format', 400);
    }

    // Fetch booking with associations
    const booking = await Booking.findOne({
      where: {
        id: id,
        user_id: userId, // Ensure user can only access their own bookings
      },
      include: [
        {
          model: Hotel,
          as: 'hotel',
          attributes: ['id', 'name', 'description', 'location', 'contact', 'amenities', 'images', 'average_rating', 'star_rating'],
        },
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'room_type', 'description', 'capacity', 'bed_type', 'size_sqm', 'price_per_night', 'amenities', 'images'],
        },
      ],
    });

    if (!booking) {
      return sendError(
        res,
        'RES_3001',
        'Booking not found or you do not have permission to access it',
        404
      );
    }

    logger.info(`Retrieved booking ${id} for user ${userId}`);

    return sendSuccess(
      res,
      {
        booking: booking.toSafeObject(),
      },
      'Booking retrieved successfully'
    );
  } catch (error: any) {
    logger.error('Error retrieving booking:', error);
    return sendError(
      res,
      'SYS_9001',
      'Failed to retrieve booking',
      500,
      error.message
    );
  }
};

/**
 * Update a booking (modify dates, guest details, etc.)
 * PUT /api/bookings/:id
 */
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { check_in, check_out, guests, guest_details } = req.body;

    if (!userId) {
      return sendError(res, 'AUTH_1003', 'User not authenticated', 401);
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return sendError(res, 'VAL_2001', 'Invalid booking ID format', 400);
    }

    // Fetch booking
    const booking = await Booking.findOne({
      where: {
        id: id,
        user_id: userId,
      },
      include: [
        {
          model: Room,
          as: 'room',
        },
      ],
    });

    if (!booking) {
      return sendError(
        res,
        'RES_3001',
        'Booking not found or you do not have permission to modify it',
        404
      );
    }

    // Check if booking can be modified (only pending or confirmed bookings at least 48 hours before check-in)
    if (![BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)) {
      return sendError(
        res,
        'BOOK_4004',
        'Only pending or confirmed bookings can be modified',
        400
      );
    }

    const now = new Date();
    const checkInDate = new Date(booking.check_in);
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 48) {
      return sendError(
        res,
        'BOOK_4004',
        'Bookings can only be modified at least 48 hours before check-in',
        400
      );
    }

    // Prepare update data
    const updateData: any = {};
    let needsPriceRecalculation = false;

    // Update check-in date if provided
    if (check_in) {
      const newCheckIn = new Date(check_in);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (newCheckIn < today) {
        return sendError(
          res,
          'VAL_2003',
          'Check-in date cannot be in the past',
          400
        );
      }

      updateData.check_in = check_in;
      needsPriceRecalculation = true;
    }

    // Update check-out date if provided
    if (check_out) {
      const newCheckOut = new Date(check_out);
      const checkInForValidation = new Date(check_in || booking.check_in);

      if (newCheckOut <= checkInForValidation) {
        return sendError(
          res,
          'VAL_2003',
          'Check-out date must be after check-in date',
          400
        );
      }

      updateData.check_out = check_out;
      needsPriceRecalculation = true;
    }

    // Check room availability for new dates if dates are being changed
    if (needsPriceRecalculation) {
      const newCheckIn = check_in || booking.check_in;
      const newCheckOut = check_out || booking.check_out;

      const conflictingBookings = await Booking.count({
        where: {
          room_id: booking.room_id,
          id: { [Op.ne]: booking.id }, // Exclude current booking
          status: {
            [Op.in]: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
          [Op.or]: [
            {
              check_in: {
                [Op.between]: [newCheckIn, newCheckOut],
              },
            },
            {
              check_out: {
                [Op.between]: [newCheckIn, newCheckOut],
              },
            },
            {
              [Op.and]: [
                {
                  check_in: {
                    [Op.lte]: newCheckIn,
                  },
                },
                {
                  check_out: {
                    [Op.gte]: newCheckOut,
                  },
                },
              ],
            },
          ],
        },
      });

      const room = booking.room as any;
      if (conflictingBookings >= room.total_rooms) {
        return sendError(
          res,
          'BOOK_4001',
          'Room is not available for the new dates',
          400
        );
      }
    }

    // Update guests if provided
    if (guests) {
      if (!guests.adults || guests.adults < 1) {
        return sendError(
          res,
          'VAL_2001',
          'At least 1 adult is required',
          400
        );
      }

      if (guests.children < 0) {
        return sendError(
          res,
          'VAL_2001',
          'Children count cannot be negative',
          400
        );
      }

      const room = booking.room as any;
      const totalGuests = guests.adults + (guests.children || 0);
      if (totalGuests > room.capacity) {
        return sendError(
          res,
          'VAL_2001',
          `Room capacity exceeded. Maximum capacity is ${room.capacity} guests`,
          400
        );
      }

      updateData.guests = guests;
    }

    // Update guest details if provided
    if (guest_details) {
      if (guest_details.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guest_details.email)) {
          return sendError(
            res,
            'VAL_2001',
            'Invalid email format',
            400
          );
        }
      }

      updateData.guest_details = {
        ...booking.guest_details,
        ...guest_details,
      };
    }

    // Recalculate pricing if dates changed
    if (needsPriceRecalculation) {
      const newCheckIn = new Date(check_in || booking.check_in);
      const newCheckOut = new Date(check_out || booking.check_out);
      const nights = Math.ceil(
        (newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      const room = booking.room as any;
      const roomRate = parseFloat(room.price_per_night.toString());
      const subtotal = roomRate * nights;
      
      let discount = 0;
      if (room.discount_percentage > 0) {
        discount = (subtotal * room.discount_percentage) / 100;
      }

      const taxableAmount = subtotal - discount - booking.pricing.student_discount;
      const tax = taxableAmount * 0.1;
      const newTotal = Math.round((taxableAmount + tax) * 100) / 100;

      updateData.pricing = {
        ...booking.pricing,
        room_rate: roomRate,
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        total: newTotal,
      };

      updateData.nights = nights;

      // Calculate price difference
      const priceDifference = newTotal - booking.pricing.total;

      // Store price difference for response
      (updateData as any).price_difference = priceDifference;
    }

    // Update booking
    await booking.update(updateData);

    // Fetch updated booking with associations
    const updatedBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Hotel,
          as: 'hotel',
          attributes: ['id', 'name', 'location', 'contact', 'images'],
        },
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'room_type', 'capacity', 'price_per_night', 'images'],
        },
      ],
    });

    // Update Google Calendar event if booking is confirmed and dates/details changed
    if (
      updatedBooking &&
      updatedBooking.status === BookingStatus.CONFIRMED &&
      updatedBooking.calendar_event_id &&
      (check_in || check_out || guest_details)
    ) {
      const hotel = (updatedBooking as any).hotel;
      const room = (updatedBooking as any).room;

      await updateCalendarEvent(updatedBooking.calendar_event_id, {
        booking_number: updatedBooking.booking_number,
        hotel_name: hotel.name,
        hotel_address: hotel.location.address,
        hotel_phone: hotel.contact.phone,
        hotel_location: {
          latitude: hotel.location.latitude,
          longitude: hotel.location.longitude,
        },
        room_type: room.room_type,
        check_in: updatedBooking.check_in,
        check_out: updatedBooking.check_out,
        guest_name: updatedBooking.guest_details.name,
        guest_email: updatedBooking.guest_details.email,
        guest_phone: updatedBooking.guest_details.phone,
        special_requests: updatedBooking.guest_details.special_requests,
      });

      logger.info(`Calendar event updated for booking ${id}`);
    }

    logger.info(`Booking ${id} updated by user ${userId}`);

    const response: any = {
      booking: updatedBooking?.toSafeObject(),
      message: 'Booking updated successfully',
    };

    // Add price difference information if applicable
    if ((updateData as any).price_difference) {
      const priceDiff = (updateData as any).price_difference;
      response.price_change = {
        difference: priceDiff,
        action_required: priceDiff > 0 ? 'additional_payment' : priceDiff < 0 ? 'refund' : 'none',
        amount: Math.abs(priceDiff),
      };
    }

    return sendSuccess(res, response, 'Booking updated successfully');
  } catch (error: any) {
    logger.error('Error updating booking:', error);

    if (error.name === 'SequelizeValidationError') {
      return sendError(
        res,
        'VAL_2001',
        error.errors[0]?.message || 'Validation error',
        400
      );
    }

    return sendError(
      res,
      'SYS_9001',
      'Failed to update booking',
      500,
      error.message
    );
  }
};

/**
 * Cancel a booking
 * DELETE /api/bookings/:id/cancel
 */
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { reason } = req.body;

    if (!userId) {
      return sendError(res, 'AUTH_1003', 'User not authenticated', 401);
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return sendError(res, 'VAL_2001', 'Invalid booking ID format', 400);
    }

    // Fetch booking
    const booking = await Booking.findOne({
      where: {
        id: id,
        user_id: userId,
      },
    });

    if (!booking) {
      return sendError(
        res,
        'RES_3001',
        'Booking not found or you do not have permission to cancel it',
        404
      );
    }

    // Check if booking can be cancelled
    if (![BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)) {
      return sendError(
        res,
        'BOOK_4004',
        'Only pending or confirmed bookings can be cancelled',
        400
      );
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return sendError(
        res,
        'BOOK_4002',
        'Booking is already cancelled',
        400
      );
    }

    // Calculate refund amount based on cancellation policy
    const refundAmount = booking.calculateRefundAmount();
    
    // Determine refund status based on payment status
    let refundStatus = 'pending';
    if (booking.payment.status === PaymentStatus.PENDING) {
      refundStatus = 'not_applicable'; // No payment made yet
    } else if (refundAmount === 0) {
      refundStatus = 'no_refund';
    }

    // Calculate days until check-in for policy information
    const now = new Date();
    const checkIn = new Date(booking.check_in);
    const daysUntilCheckIn = Math.ceil(
      (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine cancellation policy applied
    let policyApplied = '';
    if (daysUntilCheckIn >= 30) {
      policyApplied = 'Full refund (minus processing fees)';
    } else if (daysUntilCheckIn >= 7) {
      policyApplied = '50% refund';
    } else {
      if (booking.payment.type === PaymentType.DEPOSIT) {
        policyApplied = 'Deposit retained, no refund';
      } else {
        policyApplied = '50% refund';
      }
    }

    // Update booking status and cancellation details
    const oldStatus = booking.status;
    await booking.update({
      status: BookingStatus.CANCELLED,
      cancellation: {
        cancelled_at: new Date(),
        reason: reason || 'User requested cancellation',
        refund_amount: refundAmount,
        refund_status: refundStatus,
      },
    });

    // Delete Google Calendar event if it exists
    if (booking.calendar_event_id) {
      await deleteCalendarEvent(booking.calendar_event_id);
      logger.info(`Calendar event deleted for cancelled booking ${id}`);
    }

    // Broadcast booking status change via WebSocket
    websocketService.broadcastBookingStatusChange({
      booking_id: booking.id,
      user_id: userId,
      hotel_id: booking.hotel_id,
      old_status: oldStatus,
      new_status: BookingStatus.CANCELLED,
      timestamp: new Date(),
    });

    logger.info(`Booking ${id} cancelled by user ${userId}. Refund amount: ${refundAmount}`);

    return sendSuccess(
      res,
      {
        booking: booking.toSafeObject(),
        cancellation_details: {
          refund_amount: refundAmount,
          refund_status: refundStatus,
          policy_applied: policyApplied,
          days_until_checkin: daysUntilCheckIn,
          processing_time: refundAmount > 0 ? '5-10 business days' : 'N/A',
        },
        message: refundAmount > 0 
          ? `Booking cancelled successfully. Refund of $${refundAmount.toFixed(2)} will be processed within 5-10 business days.`
          : 'Booking cancelled successfully. No refund applicable based on cancellation policy.',
      },
      'Booking cancelled successfully'
    );
  } catch (error: any) {
    logger.error('Error cancelling booking:', error);
    return sendError(
      res,
      'SYS_9001',
      'Failed to cancel booking',
      500,
      error.message
    );
  }
};

/**
 * Apply promo code to a booking
 * POST /api/bookings/:id/promo-code
 */
export const applyPromoCode = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { promo_code } = req.body;

    if (!userId) {
      return sendError(res, 'AUTH_1003', 'User not authenticated', 401);
    }

    // Validate promo code input
    if (!promo_code || typeof promo_code !== 'string') {
      return sendError(
        res,
        'VAL_2002',
        'Promo code is required',
        400
      );
    }

    // Validate UUID format for booking ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return sendError(res, 'VAL_2001', 'Invalid booking ID format', 400);
    }

    // Fetch booking
    const booking = await Booking.findOne({
      where: {
        id: id,
        user_id: userId,
      },
      include: [
        {
          model: Hotel,
          as: 'hotel',
        },
      ],
    });

    if (!booking) {
      return sendError(
        res,
        'RES_3001',
        'Booking not found or you do not have permission to modify it',
        404
      );
    }

    // Check if booking is in a state where promo code can be applied
    if (booking.status !== BookingStatus.PENDING) {
      return sendError(
        res,
        'BOOK_4004',
        'Promo codes can only be applied to pending bookings',
        400
      );
    }

    // Check if a promo code is already applied
    if (booking.pricing.promo_code) {
      return sendError(
        res,
        'VAL_2001',
        `A promo code (${booking.pricing.promo_code}) is already applied to this booking. Please remove it first.`,
        400
      );
    }

    // Find promo code (case-insensitive search)
    const PromoCode = (await import('../models/PromoCode')).default;
    const promoCode = await PromoCode.findOne({
      where: {
        code: promo_code.toUpperCase().trim(),
      },
    });

    if (!promoCode) {
      return sendError(
        res,
        'VAL_2004',
        'Invalid promo code',
        400
      );
    }

    // Validate promo code is active and valid
    if (!promoCode.isValid()) {
      let reason = 'Promo code is not valid';
      
      if (!promoCode.is_active) {
        reason = 'Promo code is inactive';
      } else if (new Date() < promoCode.valid_from) {
        reason = 'Promo code is not yet valid';
      } else if (new Date() > promoCode.valid_until) {
        reason = 'Promo code has expired';
      } else if (promoCode.hasReachedLimit()) {
        reason = 'Promo code usage limit has been reached';
      }

      return sendError(
        res,
        'VAL_2004',
        reason,
        400
      );
    }

    // Check if promo code can be applied to hotels
    if (!promoCode.canApplyTo('hotels', booking.hotel_id)) {
      return sendError(
        res,
        'VAL_2004',
        'This promo code is not applicable to the selected hotel',
        400
      );
    }

    // Check minimum booking amount
    const currentSubtotal = booking.pricing.subtotal - booking.pricing.discount - booking.pricing.student_discount;
    if (currentSubtotal < promoCode.min_booking_amount) {
      return sendError(
        res,
        'VAL_2004',
        `Minimum booking amount of ${promoCode.min_booking_amount.toFixed(2)} is required to use this promo code`,
        400
      );
    }

    // Check user type eligibility
    const user = await User.findByPk(userId);
    if (user) {
      const { PromoUserType } = await import('../models/PromoCode');
      
      if (promoCode.user_type === PromoUserType.NEW) {
        // Check if user has any completed bookings
        const completedBookings = await Booking.count({
          where: {
            user_id: userId,
            status: BookingStatus.COMPLETED,
          },
        });

        if (completedBookings > 0) {
          return sendError(
            res,
            'VAL_2004',
            'This promo code is only available for new users',
            400
          );
        }
      } else if (promoCode.user_type === PromoUserType.RETURNING) {
        // Check if user has at least one completed booking
        const completedBookings = await Booking.count({
          where: {
            user_id: userId,
            status: BookingStatus.COMPLETED,
          },
        });

        if (completedBookings === 0) {
          return sendError(
            res,
            'VAL_2004',
            'This promo code is only available for returning users',
            400
          );
        }
      }
    }

    // Calculate discount amount
    const discountAmount = promoCode.calculateDiscount(currentSubtotal);

    if (discountAmount === 0) {
      return sendError(
        res,
        'VAL_2004',
        'Promo code discount could not be applied',
        400
      );
    }

    // Recalculate pricing with promo code discount
    const newTaxableAmount = currentSubtotal - discountAmount;
    const newTax = Math.round((newTaxableAmount * 0.1) * 100) / 100;
    const newTotal = Math.round((newTaxableAmount + newTax) * 100) / 100;

    // Calculate savings
    const oldTotal = booking.pricing.total;
    const savings = Math.round((oldTotal - newTotal) * 100) / 100;

    // Update booking pricing
    const updatedPricing = {
      ...booking.pricing,
      promo_code: promoCode.code,
      promo_discount: discountAmount,
      tax: newTax,
      total: newTotal,
    };

    await booking.update({
      pricing: updatedPricing,
    });

    // Increment promo code usage count
    await promoCode.incrementUsage();

    logger.info(`Promo code ${promoCode.code} applied to booking ${id}. Discount: ${discountAmount}, Savings: ${savings}`);

    // Fetch updated booking with associations
    const updatedBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Hotel,
          as: 'hotel',
          attributes: ['id', 'name', 'location', 'contact', 'images'],
        },
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'room_type', 'capacity', 'price_per_night', 'images'],
        },
      ],
    });

    return sendSuccess(
      res,
      {
        booking: updatedBooking?.toSafeObject(),
        promo_code_details: {
          code: promoCode.code,
          description: promoCode.description,
          discount_applied: discountAmount,
          savings: savings,
          new_total: newTotal,
          old_total: oldTotal,
        },
        message: `Promo code applied successfully! You saved ${savings.toFixed(2)}.`,
      },
      'Promo code applied successfully'
    );
  } catch (error: any) {
    logger.error('Error applying promo code:', error);

    if (error.name === 'SequelizeValidationError') {
      return sendError(
        res,
        'VAL_2001',
        error.errors[0]?.message || 'Validation error',
        400
      );
    }

    return sendError(
      res,
      'SYS_9001',
      'Failed to apply promo code',
      500,
      error.message
    );
  }
};
