import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Tour from '../models/Tour';
import Booking from '../models/Booking';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

/**
 * Get all tours with optional search and filters
 * @route GET /api/tours
 */
export const getTours = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      destination,
      difficulty,
      category,
      min_price,
      max_price,
      min_days,
      max_days,
      group_size,
      guide_required,
      transportation_required,
      page = 1,
      limit = 20,
      sort_by = 'popularity',
    } = req.query;

    // Build where clause
    const where: any = {
      is_active: true,
    };

    // Destination filter
    if (destination) {
      where.destination = {
        [Op.like]: `%${destination}%`,
      };
    }

    // Difficulty filter
    if (difficulty) {
      where.difficulty = difficulty;
    }

    // Category filter (check if tour has the category in its array)
    if (category) {
      where.category = {
        [Op.contains]: [category],
      };
    }

    // Price range filter
    if (min_price || max_price) {
      where.price_per_person = {};
      if (min_price) {
        where.price_per_person[Op.gte] = parseFloat(min_price as string);
      }
      if (max_price) {
        where.price_per_person[Op.lte] = parseFloat(max_price as string);
      }
    }

    // Duration filter (days)
    if (min_days || max_days) {
      // For JSON fields, we need to use raw SQL or filter in memory
      // For now, we'll fetch all and filter in memory
    }

    // Guide required filter
    if (guide_required !== undefined) {
      where.guide_required = guide_required === 'true';
    }

    // Transportation required filter
    if (transportation_required !== undefined) {
      where.transportation_required = transportation_required === 'true';
    }

    // Sorting
    let order: any[] = [];
    switch (sort_by) {
      case 'price_asc':
        order = [['price_per_person', 'ASC']];
        break;
      case 'price_desc':
        order = [['price_per_person', 'DESC']];
        break;
      case 'rating':
        order = [['average_rating', 'DESC']];
        break;
      case 'popularity':
        order = [['total_bookings', 'DESC']];
        break;
      case 'duration':
        // For JSON fields, we can't sort directly in SQL easily
        // We'll sort by created_at as fallback
        order = [['created_at', 'DESC']];
        break;
      default:
        order = [['total_bookings', 'DESC']];
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Fetch tours
    const { count, rows: tours } = await Tour.findAndCountAll({
      where,
      order,
      limit: limitNum,
      offset,
    });

    // Filter by duration if specified (in-memory filter)
    let filteredTours = tours;
    if (min_days || max_days) {
      filteredTours = tours.filter((tour) => {
        const days = tour.duration.days;
        if (min_days && days < parseInt(min_days as string, 10)) return false;
        if (max_days && days > parseInt(max_days as string, 10)) return false;
        return true;
      });
    }

    // Filter by group size if specified
    if (group_size) {
      const groupSizeNum = parseInt(group_size as string, 10);
      filteredTours = filteredTours.filter((tour) => 
        tour.isAvailableForGroupSize(groupSizeNum)
      );
    }

    // Calculate total pages
    const totalPages = Math.ceil(count / limitNum);

    logger.info(`Retrieved ${filteredTours.length} tours (page ${pageNum}/${totalPages})`);

    return successResponse(res, {
      tours: filteredTours.map((tour) => tour.toSafeObject()),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages,
      },
      filters: {
        destination,
        difficulty,
        category,
        min_price,
        max_price,
        min_days,
        max_days,
        group_size,
        guide_required,
        transportation_required,
        sort_by,
      },
    }, 'Tours retrieved successfully');
  } catch (error: any) {
    logger.error('Error retrieving tours:', error);
    return errorResponse(res, 'Failed to retrieve tours', 500, 'TOUR_RETRIEVAL_ERROR');
  }
};

/**
 * Get a specific tour by ID with full details
 * @route GET /api/tours/:id
 */
export const getTourById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Find tour
    const tour = await Tour.findByPk(id);

    if (!tour) {
      return errorResponse(res, 'Tour not found', 404, 'TOUR_NOT_FOUND');
    }

    if (!tour.is_active) {
      return errorResponse(res, 'Tour is not available', 404, 'TOUR_NOT_AVAILABLE');
    }

    logger.info(`Retrieved tour details for tour ID: ${id}`);

    return successResponse(res, {
      tour: tour.toSafeObject(),
    }, 'Tour details retrieved successfully');
  } catch (error: any) {
    logger.error('Error retrieving tour details:', error);
    return errorResponse(res, 'Failed to retrieve tour details', 500, 'TOUR_DETAIL_ERROR');
  }
};

/**
 * Create a new tour booking
 * @route POST /api/bookings/tours
 */
export const createTourBooking = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user?.userId;
    const {
      tour_id,
      tour_date,
      participants,
      guest_details,
      payment_method = 'paypal',
      payment_type = 'deposit',
    } = req.body;

    // Validate tour exists and is active
    const tour = await Tour.findByPk(tour_id);
    if (!tour) {
      return errorResponse(res, 'Tour not found', 404, 'TOUR_NOT_FOUND');
    }

    if (!tour.is_active) {
      return errorResponse(res, 'Tour is not available for booking', 400, 'TOUR_NOT_AVAILABLE');
    }

    // Validate group size
    if (!tour.isAvailableForGroupSize(participants)) {
      return errorResponse(
        res,
        `Group size must be between ${tour.group_size.min} and ${tour.group_size.max} participants`,
        400,
        'INVALID_GROUP_SIZE'
      );
    }

    // Validate tour date is in the future
    const tourDateObj = new Date(tour_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tourDateObj < today) {
      return errorResponse(res, 'Tour date cannot be in the past', 400, 'INVALID_TOUR_DATE');
    }

    // Calculate pricing
    const subtotal = tour.calculateGroupPrice(participants);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    // Generate unique booking number
    const bookingNumber = `TB-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create booking
    const booking = await Booking.create({
      booking_number: bookingNumber,
      user_id: userId,
      hotel_id: null, // Tour bookings don't have hotel_id
      room_id: null, // Tour bookings don't have room_id
      check_in: tourDateObj, // Using tour_date as check_in
      check_out: new Date(tourDateObj.getTime() + tour.duration.days * 24 * 60 * 60 * 1000), // Calculate end date
      nights: tour.duration.days,
      guests: {
        adults: participants,
        children: 0,
      },
      guest_details: {
        name: guest_details.name,
        email: guest_details.email,
        phone: guest_details.phone,
        special_requests: guest_details.special_requests || '',
      },
      pricing: {
        room_rate: tour.price_per_person,
        subtotal,
        discount: 0,
        promo_code: null,
        student_discount: 0,
        tax,
        total,
      },
      payment: {
        method: payment_method,
        type: payment_type,
        status: 'pending',
        transactions: [],
        escrow_status: 'held',
      },
      status: 'pending',
      cancellation: null,
      calendar_event_id: null,
    } as any);

    // Update tour booking count
    await tour.increment('total_bookings');

    logger.info(`Tour booking created: ${bookingNumber} for tour ${tour.name}`);

    return successResponse(res, {
      booking: {
        id: booking.id,
        booking_number: booking.booking_number,
        tour: {
          id: tour.id,
          name: tour.name,
          destination: tour.destination,
          duration: tour.duration,
          meeting_point: tour.meeting_point,
          itinerary: tour.itinerary,
          inclusions: tour.inclusions,
          exclusions: tour.exclusions,
        },
        tour_date: tourDateObj,
        participants,
        guest_details: booking.guest_details,
        pricing: booking.pricing,
        payment: {
          method: booking.payment.method,
          type: booking.payment.type,
          status: booking.payment.status,
        },
        status: booking.status,
        created_at: booking.created_at,
      },
    }, 'Tour booking created successfully. Please complete payment to confirm your booking.', 201);
  } catch (error: any) {
    logger.error('Error creating tour booking:', error);
    return errorResponse(res, 'Failed to create tour booking', 500, 'TOUR_BOOKING_ERROR');
  }
};
