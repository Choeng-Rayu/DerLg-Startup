import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Hotel, Room, sequelize } from '../models';
import { HotelStatus } from '../models/Hotel';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../utils/logger';
import cloudinaryService from '../services/cloudinary.service';

/**
 * Hotel Controller
 * Handles hotel search, listing, detail operations, and hotel admin profile management
 */
class HotelController {
  /**
   * Get all hotels with pagination
   * GET /api/hotels
   */
  async getHotels(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // Only show active hotels
      const { count, rows: hotels } = await Hotel.findAndCountAll({
        where: {
          status: HotelStatus.ACTIVE,
        },
        limit,
        offset,
        order: [['average_rating', 'DESC'], ['created_at', 'DESC']],
        attributes: {
          exclude: ['admin_id'],
        },
      });

      const totalPages = Math.ceil(count / limit);

      return sendSuccess(res, {
        hotels,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching hotels:', error);
      return sendError(res, 'HOTEL_FETCH_ERROR', 'Failed to fetch hotels', 500);
    }
  }

  /**
   * Search hotels with advanced filters
   * GET /api/hotels/search
   */
  async searchHotels(req: Request, res: Response): Promise<Response> {
    try {
      const {
        destination,
        checkIn,
        checkOut,
        guests,
        minPrice,
        maxPrice,
        amenities,
        starRating,
        minRating,
        sortBy = 'relevance',
      } = req.query;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // Build where clause
      const whereClause: any = {
        status: HotelStatus.ACTIVE,
      };

      // Filter by destination (city or province)
      // Note: MySQL JSON path syntax requires using JSON_EXTRACT
      if (destination) {
        whereClause[Op.or] = [
          sequelize.where(
            sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(location, '$.city'))`),
            { [Op.like]: `%${destination}%` }
          ),
          sequelize.where(
            sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(location, '$.province'))`),
            { [Op.like]: `%${destination}%` }
          ),
        ];
      }

      // Filter by star rating
      if (starRating) {
        whereClause.star_rating = parseInt(starRating as string);
      }

      // Filter by minimum rating
      if (minRating) {
        whereClause.average_rating = {
          [Op.gte]: parseFloat(minRating as string),
        };
      }

      // Filter by amenities
      // MySQL JSON array filtering using JSON_CONTAINS
      if (amenities) {
        const amenitiesList = Array.isArray(amenities) ? amenities : [amenities];
        // Check if hotel has all requested amenities
        const amenityConditions = amenitiesList.map((amenity) =>
          sequelize.literal(`JSON_CONTAINS(\`Hotel\`.\`amenities\`, '"${amenity}"')`)
        );
        if (!whereClause[Op.and]) {
          whereClause[Op.and] = [];
        }
        whereClause[Op.and].push(...amenityConditions);
      }

      // Build room filters for price and capacity
      const roomWhereClause: any = {
        is_active: true,
      };

      if (guests) {
        roomWhereClause.capacity = {
          [Op.gte]: parseInt(guests as string),
        };
      }

      if (minPrice || maxPrice) {
        roomWhereClause.price_per_night = {};
        if (minPrice) {
          roomWhereClause.price_per_night[Op.gte] = parseFloat(minPrice as string);
        }
        if (maxPrice) {
          roomWhereClause.price_per_night[Op.lte] = parseFloat(maxPrice as string);
        }
      }

      // Determine sort order
      let order: any[] = [];
      switch (sortBy) {
        case 'price_low':
          order = [[{ model: Room, as: 'rooms' }, 'price_per_night', 'ASC']];
          break;
        case 'price_high':
          order = [[{ model: Room, as: 'rooms' }, 'price_per_night', 'DESC']];
          break;
        case 'rating':
          order = [['average_rating', 'DESC']];
          break;
        case 'relevance':
        default:
          order = [['average_rating', 'DESC'], ['total_reviews', 'DESC']];
          break;
      }

      // Execute search query
      const { count, rows: hotels } = await Hotel.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Room,
            as: 'rooms',
            where: roomWhereClause,
            required: Object.keys(roomWhereClause).length > 1, // Only require rooms if filtering
            attributes: ['id', 'room_type', 'price_per_night', 'capacity', 'discount_percentage'],
          },
        ],
        limit,
        offset,
        order,
        distinct: true,
        attributes: {
          exclude: ['admin_id'],
        },
      });

      // Calculate minimum price for each hotel
      const hotelsWithMinPrice = hotels.map((hotel) => {
        const hotelData = hotel.toJSON() as any;
        if (hotelData.rooms && hotelData.rooms.length > 0) {
          const minPrice = Math.min(...hotelData.rooms.map((r: any) => parseFloat(r.price_per_night)));
          hotelData.starting_price = minPrice;
        } else {
          hotelData.starting_price = null;
        }
        return hotelData;
      });

      const totalPages = Math.ceil(count / limit);

      return sendSuccess(res, {
        hotels: hotelsWithMinPrice,
        filters: {
          destination,
          checkIn,
          checkOut,
          guests,
          minPrice,
          maxPrice,
          amenities,
          starRating,
          minRating,
          sortBy,
        },
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error: any) {
      logger.error('Error searching hotels:', error);
      return sendError(res, 'HOTEL_SEARCH_ERROR', 'Failed to search hotels', 500);
    }
  }

  /**
   * Get hotel by ID with full details
   * GET /api/hotels/:id
   */
  async getHotelById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      // Import Review and User models dynamically to avoid circular dependency
      const { Review, User } = await import('../models');

      const hotel = await Hotel.findOne({
        where: {
          id,
          status: HotelStatus.ACTIVE,
        },
        include: [
          {
            model: Room,
            as: 'rooms',
            where: { is_active: true },
            required: false,
            attributes: [
              'id',
              'room_type',
              'description',
              'capacity',
              'bed_type',
              'size_sqm',
              'price_per_night',
              'discount_percentage',
              'amenities',
              'images',
              'total_rooms',
            ],
          },
          {
            model: Review,
            as: 'reviews',
            required: false,
            limit: 10, // Get latest 10 reviews
            order: [['created_at', 'DESC']],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'profile_image'],
              },
            ],
            attributes: [
              'id',
              'ratings',
              'comment',
              'sentiment',
              'images',
              'helpful_count',
              'is_verified',
              'admin_response',
              'created_at',
            ],
          },
        ],
        attributes: {
          exclude: ['admin_id'],
        },
      });

      if (!hotel) {
        return sendError(res, 'HOTEL_NOT_FOUND', 'Hotel not found', 404);
      }

      // Calculate room pricing with discounts
      const hotelData = hotel.toJSON() as any;
      if (hotelData.rooms && hotelData.rooms.length > 0) {
        hotelData.rooms = hotelData.rooms.map((room: any) => {
          const basePrice = parseFloat(room.price_per_night);
          const discountAmount = (basePrice * room.discount_percentage) / 100;
          const finalPrice = basePrice - discountAmount;
          
          return {
            ...room,
            pricing: {
              base_price: basePrice,
              discount_amount: discountAmount,
              final_price: finalPrice,
            },
          };
        });

        // Calculate starting price
        const minPrice = Math.min(...hotelData.rooms.map((r: any) => r.pricing.final_price));
        hotelData.starting_price = minPrice;
      }

      return sendSuccess(res, { hotel: hotelData });
    } catch (error: any) {
      logger.error('Error fetching hotel by ID:', error);
      return sendError(res, 'HOTEL_FETCH_ERROR', 'Failed to fetch hotel', 500);
    }
  }

  /**
   * Check hotel room availability for date range
   * GET /api/hotels/:id/availability
   */
  async checkAvailability(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { checkIn, checkOut, guests } = req.query;

      // Validate required parameters
      if (!checkIn || !checkOut) {
        return sendError(
          res,
          'MISSING_PARAMETERS',
          'Check-in and check-out dates are required',
          400
        );
      }

      // Validate date format and logic
      const checkInDate = new Date(checkIn as string);
      const checkOutDate = new Date(checkOut as string);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        return sendError(res, 'INVALID_DATE', 'Invalid date format', 400);
      }

      if (checkInDate < today) {
        return sendError(
          res,
          'INVALID_DATE',
          'Check-in date cannot be in the past',
          400
        );
      }

      if (checkOutDate <= checkInDate) {
        return sendError(
          res,
          'INVALID_DATE',
          'Check-out date must be after check-in date',
          400
        );
      }

      // Verify hotel exists and is active
      const hotel = await Hotel.findOne({
        where: {
          id,
          status: HotelStatus.ACTIVE,
        },
        attributes: ['id', 'name'],
      });

      if (!hotel) {
        return sendError(res, 'HOTEL_NOT_FOUND', 'Hotel not found', 404);
      }

      // Get all active rooms for this hotel
      const rooms = await Room.findAll({
        where: {
          hotel_id: id,
          is_active: true,
          ...(guests && { capacity: { [Op.gte]: parseInt(guests as string) } }),
        },
        attributes: [
          'id',
          'room_type',
          'description',
          'capacity',
          'bed_type',
          'size_sqm',
          'price_per_night',
          'discount_percentage',
          'amenities',
          'images',
          'total_rooms',
        ],
      });

      if (rooms.length === 0) {
        return sendSuccess(res, {
          hotel: {
            id: hotel.id,
            name: hotel.name,
          },
          checkIn,
          checkOut,
          guests: guests ? parseInt(guests as string) : null,
          availableRooms: [],
          message: guests
            ? 'No rooms available for the specified guest count'
            : 'No active rooms available',
        });
      }

      // Import Booking model dynamically to avoid circular dependency
      const { Booking } = await import('../models');

      // For each room type, calculate availability
      const availabilityPromises = rooms.map(async (room) => {
        // Count existing bookings that overlap with requested dates
        const overlappingBookings = await Booking.count({
          where: {
            room_id: room.id,
            status: {
              [Op.in]: ['pending', 'confirmed'],
            },
            [Op.or]: [
              {
                // Booking starts during requested period
                check_in: {
                  [Op.between]: [checkInDate, checkOutDate],
                },
              },
              {
                // Booking ends during requested period
                check_out: {
                  [Op.between]: [checkInDate, checkOutDate],
                },
              },
              {
                // Booking spans entire requested period
                [Op.and]: [
                  { check_in: { [Op.lte]: checkInDate } },
                  { check_out: { [Op.gte]: checkOutDate } },
                ],
              },
            ],
          },
        });

        const roomData = room.toJSON() as any;
        const availableCount = Math.max(0, roomData.total_rooms - overlappingBookings);

        // Calculate final price with discount
        const basePrice = parseFloat(roomData.price_per_night);
        const discountAmount = (basePrice * roomData.discount_percentage) / 100;
        const finalPrice = basePrice - discountAmount;

        // Calculate nights
        const nights = Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          ...roomData,
          available_count: Math.max(0, availableCount),
          is_available: availableCount > 0,
          pricing: {
            base_price: basePrice,
            discount_amount: discountAmount,
            final_price: finalPrice,
            nights,
            total: finalPrice * nights,
          },
        };
      });

      const availableRooms = await Promise.all(availabilityPromises);

      // Filter to only show available rooms
      const roomsWithAvailability = availableRooms.filter((room) => room.is_available);

      return sendSuccess(res, {
        hotel: {
          id: hotel.id,
          name: hotel.name,
        },
        checkIn,
        checkOut,
        guests: guests ? parseInt(guests as string) : null,
        nights: Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
        ),
        availableRooms: roomsWithAvailability,
        totalRoomsChecked: rooms.length,
        availableRoomsCount: roomsWithAvailability.length,
      });
    } catch (error: any) {
      logger.error('Error checking hotel availability:', error);
      return sendError(
        res,
        'AVAILABILITY_CHECK_ERROR',
        'Failed to check availability',
        500
      );
    }
  }

  /**
   * Get hotel profile for hotel admin
   * GET /api/hotel/profile
   * Requires authentication and admin role
   */
  async getHotelProfile(req: Request, res: Response): Promise<Response> {
    try {
      // Get hotel admin's hotel
      const hotel = await Hotel.findOne({
        where: {
          admin_id: req.user!.id,
        },
        include: [
          {
            model: Room,
            as: 'rooms',
            attributes: [
              'id',
              'room_type',
              'description',
              'capacity',
              'bed_type',
              'size_sqm',
              'price_per_night',
              'discount_percentage',
              'amenities',
              'images',
              'total_rooms',
              'is_active',
            ],
          },
        ],
      });

      if (!hotel) {
        return sendError(
          res,
          'HOTEL_NOT_FOUND',
          'No hotel found for this admin account',
          404
        );
      }

      return sendSuccess(res, { hotel: hotel.toJSON() });
    } catch (error: any) {
      logger.error('Error fetching hotel profile:', error);
      return sendError(res, 'HOTEL_FETCH_ERROR', 'Failed to fetch hotel profile', 500);
    }
  }

  /**
   * Get all rooms for hotel admin
   * GET /api/rooms
   * Requires authentication and admin role
   */
  async getRooms(req: Request, res: Response): Promise<Response> {
    try {
      // Get hotel admin's hotel
      const hotel = await Hotel.findOne({
        where: {
          admin_id: req.user!.id,
        },
        attributes: ['id'],
      });

      if (!hotel) {
        return sendError(
          res,
          'HOTEL_NOT_FOUND',
          'No hotel found for this admin account',
          404
        );
      }

      // Get all rooms for this hotel
      const rooms = await Room.findAll({
        where: {
          hotel_id: hotel.id,
        },
        order: [['created_at', 'DESC']],
      });

      return sendSuccess(res, {
        rooms: rooms.map((room) => room.toSafeObject()),
      });
    } catch (error: any) {
      logger.error('Error fetching rooms:', error);
      return sendError(res, 'ROOM_FETCH_ERROR', 'Failed to fetch rooms', 500);
    }
  }

  /**
   * Create a new room for hotel admin
   * POST /api/rooms
   * Requires authentication and admin role
   */
  async createRoom(req: Request, res: Response): Promise<Response> {
    try {
      const {
        room_type,
        description,
        capacity,
        bed_type,
        size_sqm,
        price_per_night,
        discount_percentage,
        amenities,
        images,
        total_rooms,
      } = req.body;

      // Get hotel admin's hotel
      const hotel = await Hotel.findOne({
        where: {
          admin_id: req.user!.id,
        },
        attributes: ['id'],
      });

      if (!hotel) {
        return sendError(
          res,
          'HOTEL_NOT_FOUND',
          'No hotel found for this admin account',
          404
        );
      }

      // Validate required fields
      if (!room_type || !description || !capacity || !bed_type || !price_per_night) {
        return sendError(
          res,
          'MISSING_REQUIRED_FIELDS',
          'Room type, description, capacity, bed type, and price per night are required',
          400
        );
      }

      // Validate capacity (1-20 guests)
      const capacityNum = parseInt(capacity);
      if (isNaN(capacityNum) || capacityNum < 1 || capacityNum > 20) {
        return sendError(
          res,
          'INVALID_CAPACITY',
          'Room capacity must be between 1 and 20 guests',
          400
        );
      }

      // Validate positive pricing
      const priceNum = parseFloat(price_per_night);
      if (isNaN(priceNum) || priceNum <= 0) {
        return sendError(
          res,
          'INVALID_PRICE',
          'Price per night must be a positive number',
          400
        );
      }

      // Validate discount percentage if provided
      let discountNum = 0;
      if (discount_percentage !== undefined) {
        discountNum = parseFloat(discount_percentage);
        if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
          return sendError(
            res,
            'INVALID_DISCOUNT',
            'Discount percentage must be between 0 and 100',
            400
          );
        }
      }

      // Validate total rooms if provided
      let totalRoomsNum = 1;
      if (total_rooms !== undefined) {
        totalRoomsNum = parseInt(total_rooms);
        if (isNaN(totalRoomsNum) || totalRoomsNum < 1) {
          return sendError(
            res,
            'INVALID_TOTAL_ROOMS',
            'Total rooms must be at least 1',
            400
          );
        }
      }

      // Validate amenities array
      const amenitiesArray = amenities || [];
      if (!Array.isArray(amenitiesArray)) {
        return sendError(
          res,
          'INVALID_AMENITIES',
          'Amenities must be an array',
          400
        );
      }

      // Handle image uploads if base64 strings are provided
      const uploadedImages: string[] = [];
      if (images && Array.isArray(images)) {
        for (const image of images) {
          if (typeof image === 'string') {
            // Check if it's a base64 string
            if (image.startsWith('data:image')) {
              try {
                const result = await cloudinaryService.uploadBase64Image(image, 'rooms');
                uploadedImages.push(result.url);
              } catch (error: any) {
                logger.error('Image upload error:', error);
                return sendError(
                  res,
                  'IMAGE_UPLOAD_ERROR',
                  `Failed to upload image: ${error.message}`,
                  500
                );
              }
            } else {
              // Assume it's already a URL
              uploadedImages.push(image);
            }
          }
        }
      }

      // Create room
      const room = await Room.create({
        hotel_id: hotel.id,
        room_type: room_type.trim(),
        description: description.trim(),
        capacity: capacityNum,
        bed_type,
        size_sqm: size_sqm ? parseFloat(size_sqm) : null,
        price_per_night: priceNum,
        discount_percentage: discountNum,
        amenities: amenitiesArray,
        images: uploadedImages,
        total_rooms: totalRoomsNum,
      });

      logger.info(`Room created: ${room.id} for hotel: ${hotel.id} by admin: ${req.user!.id}`);

      return sendSuccess(
        res,
        {
          room: room.toSafeObject(),
        },
        'Room created successfully',
        201
      );
    } catch (error: any) {
      logger.error('Error creating room:', error);
      
      // Handle validation errors
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map((err: any) => err.message);
        return sendError(
          res,
          'VALIDATION_ERROR',
          validationErrors.join(', '),
          400
        );
      }

      return sendError(res, 'ROOM_CREATE_ERROR', 'Failed to create room', 500);
    }
  }

  /**
   * Update room details for hotel admin
   * PUT /api/rooms/:id
   * Requires authentication and admin role
   */
  async updateRoom(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const {
        room_type,
        description,
        capacity,
        bed_type,
        size_sqm,
        price_per_night,
        discount_percentage,
        amenities,
        images,
        total_rooms,
        is_active,
      } = req.body;

      // Get hotel admin's hotel
      const hotel = await Hotel.findOne({
        where: {
          admin_id: req.user!.id,
        },
        attributes: ['id'],
      });

      if (!hotel) {
        return sendError(
          res,
          'HOTEL_NOT_FOUND',
          'No hotel found for this admin account',
          404
        );
      }

      // Find room and verify it belongs to this hotel
      const room = await Room.findOne({
        where: {
          id,
          hotel_id: hotel.id,
        },
      });

      if (!room) {
        return sendError(
          res,
          'ROOM_NOT_FOUND',
          'Room not found or does not belong to your hotel',
          404
        );
      }

      // Update fields if provided
      if (room_type !== undefined) {
        if (typeof room_type !== 'string' || room_type.trim().length < 2) {
          return sendError(
            res,
            'INVALID_ROOM_TYPE',
            'Room type must be at least 2 characters',
            400
          );
        }
        room.room_type = room_type.trim();
      }

      if (description !== undefined) {
        if (typeof description !== 'string' || description.trim().length === 0) {
          return sendError(
            res,
            'INVALID_DESCRIPTION',
            'Description is required',
            400
          );
        }
        room.description = description.trim();
      }

      if (capacity !== undefined) {
        const capacityNum = parseInt(capacity);
        if (isNaN(capacityNum) || capacityNum < 1 || capacityNum > 20) {
          return sendError(
            res,
            'INVALID_CAPACITY',
            'Room capacity must be between 1 and 20 guests',
            400
          );
        }
        room.capacity = capacityNum;
      }

      if (bed_type !== undefined) {
        const validBedTypes = ['single', 'double', 'queen', 'king', 'twin', 'bunk'];
        if (!validBedTypes.includes(bed_type)) {
          return sendError(
            res,
            'INVALID_BED_TYPE',
            `Bed type must be one of: ${validBedTypes.join(', ')}`,
            400
          );
        }
        room.bed_type = bed_type;
      }

      if (size_sqm !== undefined) {
        if (size_sqm !== null) {
          const sizeNum = parseFloat(size_sqm);
          if (isNaN(sizeNum) || sizeNum < 1) {
            return sendError(
              res,
              'INVALID_SIZE',
              'Room size must be at least 1 square meter',
              400
            );
          }
          room.size_sqm = sizeNum;
        } else {
          room.size_sqm = null;
        }
      }

      if (price_per_night !== undefined) {
        const priceNum = parseFloat(price_per_night);
        if (isNaN(priceNum) || priceNum <= 0) {
          return sendError(
            res,
            'INVALID_PRICE',
            'Price per night must be a positive number',
            400
          );
        }
        room.price_per_night = priceNum;
      }

      if (discount_percentage !== undefined) {
        const discountNum = parseFloat(discount_percentage);
        if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
          return sendError(
            res,
            'INVALID_DISCOUNT',
            'Discount percentage must be between 0 and 100',
            400
          );
        }
        room.discount_percentage = discountNum;
      }

      if (amenities !== undefined) {
        if (!Array.isArray(amenities)) {
          return sendError(
            res,
            'INVALID_AMENITIES',
            'Amenities must be an array',
            400
          );
        }
        room.amenities = amenities;
      }

      if (images !== undefined) {
        if (!Array.isArray(images)) {
          return sendError(
            res,
            'INVALID_IMAGES',
            'Images must be an array',
            400
          );
        }

        // Handle image uploads if base64 strings are provided
        const uploadedImages: string[] = [];
        for (const image of images) {
          if (typeof image === 'string') {
            // Check if it's a base64 string
            if (image.startsWith('data:image')) {
              try {
                const result = await cloudinaryService.uploadBase64Image(image, 'rooms');
                uploadedImages.push(result.url);
              } catch (error: any) {
                logger.error('Image upload error:', error);
                return sendError(
                  res,
                  'IMAGE_UPLOAD_ERROR',
                  `Failed to upload image: ${error.message}`,
                  500
                );
              }
            } else {
              // Assume it's already a URL
              uploadedImages.push(image);
            }
          }
        }

        room.images = uploadedImages;
      }

      if (total_rooms !== undefined) {
        const totalRoomsNum = parseInt(total_rooms);
        if (isNaN(totalRoomsNum) || totalRoomsNum < 1) {
          return sendError(
            res,
            'INVALID_TOTAL_ROOMS',
            'Total rooms must be at least 1',
            400
          );
        }
        room.total_rooms = totalRoomsNum;
      }

      if (is_active !== undefined) {
        room.is_active = Boolean(is_active);
      }

      // Save updated room
      await room.save();

      logger.info(`Room updated: ${room.id} for hotel: ${hotel.id} by admin: ${req.user!.id}`);

      return sendSuccess(res, {
        message: 'Room updated successfully',
        room: room.toSafeObject(),
      });
    } catch (error: any) {
      logger.error('Error updating room:', error);

      // Handle validation errors
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map((err: any) => err.message);
        return sendError(
          res,
          'VALIDATION_ERROR',
          validationErrors.join(', '),
          400
        );
      }

      return sendError(res, 'ROOM_UPDATE_ERROR', 'Failed to update room', 500);
    }
  }

  /**
   * Delete room for hotel admin
   * DELETE /api/rooms/:id
   * Requires authentication and admin role
   */
  async deleteRoom(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      // Get hotel admin's hotel
      const hotel = await Hotel.findOne({
        where: {
          admin_id: req.user!.id,
        },
        attributes: ['id'],
      });

      if (!hotel) {
        return sendError(
          res,
          'HOTEL_NOT_FOUND',
          'No hotel found for this admin account',
          404
        );
      }

      // Find room and verify it belongs to this hotel
      const room = await Room.findOne({
        where: {
          id,
          hotel_id: hotel.id,
        },
      });

      if (!room) {
        return sendError(
          res,
          'ROOM_NOT_FOUND',
          'Room not found or does not belong to your hotel',
          404
        );
      }

      // Import Booking model to check for active bookings
      const { Booking } = await import('../models');

      // Check if there are any active bookings for this room
      const activeBookings = await Booking.count({
        where: {
          room_id: id,
          status: {
            [Op.in]: ['pending', 'confirmed'],
          },
        },
      });

      if (activeBookings > 0) {
        return sendError(
          res,
          'ROOM_HAS_ACTIVE_BOOKINGS',
          'Cannot delete room with active bookings. Please cancel or complete all bookings first.',
          400
        );
      }

      // Delete the room
      await room.destroy();

      logger.info(`Room deleted: ${id} from hotel: ${hotel.id} by admin: ${req.user!.id}`);

      return sendSuccess(res, {
        message: 'Room deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting room:', error);
      return sendError(res, 'ROOM_DELETE_ERROR', 'Failed to delete room', 500);
    }
  }

  /**
   * Update hotel profile for hotel admin
   * PUT /api/hotel/profile
   * Requires authentication and admin role
   */
  async updateHotelProfile(req: Request, res: Response): Promise<Response> {
    try {
      const {
        name,
        description,
        location,
        contact,
        amenities,
        images,
        logo,
        star_rating,
      } = req.body;

      // Get hotel admin's hotel
      const hotel = await Hotel.findOne({
        where: {
          admin_id: req.user!.id,
        },
      });

      if (!hotel) {
        return sendError(
          res,
          'HOTEL_NOT_FOUND',
          'No hotel found for this admin account',
          404
        );
      }

      // Validate hotel data
      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 255) {
          return sendError(
            res,
            'INVALID_INPUT',
            'Hotel name must be between 2 and 255 characters',
            400
          );
        }
        hotel.name = name.trim();
      }

      if (description !== undefined) {
        if (typeof description !== 'string' || description.trim().length === 0) {
          return sendError(
            res,
            'INVALID_INPUT',
            'Hotel description is required',
            400
          );
        }
        hotel.description = description.trim();
      }

      if (location !== undefined) {
        // Validate location object
        if (!location || typeof location !== 'object') {
          return sendError(
            res,
            'INVALID_INPUT',
            'Location must be a valid object',
            400
          );
        }

        const requiredLocationFields = ['address', 'city', 'province', 'country', 'latitude', 'longitude'];
        for (const field of requiredLocationFields) {
          if (!location[field]) {
            return sendError(
              res,
              'INVALID_INPUT',
              `Location.${field} is required`,
              400
            );
          }
        }

        if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
          return sendError(
            res,
            'INVALID_INPUT',
            'Latitude and longitude must be numbers',
            400
          );
        }

        if (location.latitude < -90 || location.latitude > 90) {
          return sendError(
            res,
            'INVALID_INPUT',
            'Latitude must be between -90 and 90',
            400
          );
        }

        if (location.longitude < -180 || location.longitude > 180) {
          return sendError(
            res,
            'INVALID_INPUT',
            'Longitude must be between -180 and 180',
            400
          );
        }

        hotel.location = location;
      }

      if (contact !== undefined) {
        // Validate contact object
        if (!contact || typeof contact !== 'object') {
          return sendError(
            res,
            'INVALID_INPUT',
            'Contact must be a valid object',
            400
          );
        }

        if (!contact.phone || !contact.email) {
          return sendError(
            res,
            'INVALID_INPUT',
            'Contact phone and email are required',
            400
          );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact.email)) {
          return sendError(
            res,
            'INVALID_INPUT',
            'Contact email must be valid',
            400
          );
        }

        hotel.contact = contact;
      }

      if (amenities !== undefined) {
        if (!Array.isArray(amenities)) {
          return sendError(
            res,
            'INVALID_INPUT',
            'Amenities must be an array',
            400
          );
        }
        hotel.amenities = amenities;
      }

      if (images !== undefined) {
        if (!Array.isArray(images)) {
          return sendError(
            res,
            'INVALID_INPUT',
            'Images must be an array',
            400
          );
        }

        // Handle image uploads if base64 strings are provided
        const uploadedImages: string[] = [];
        for (const image of images) {
          if (typeof image === 'string') {
            // Check if it's a base64 string
            if (image.startsWith('data:image')) {
              try {
                const result = await cloudinaryService.uploadBase64Image(image, 'hotels');
                uploadedImages.push(result.url);
              } catch (error: any) {
                logger.error('Image upload error:', error);
                return sendError(
                  res,
                  'IMAGE_UPLOAD_ERROR',
                  `Failed to upload image: ${error.message}`,
                  500
                );
              }
            } else {
              // Assume it's already a URL
              uploadedImages.push(image);
            }
          }
        }

        hotel.images = uploadedImages;
      }

      if (logo !== undefined) {
        if (typeof logo === 'string') {
          // Check if it's a base64 string
          if (logo.startsWith('data:image')) {
            try {
              const result = await cloudinaryService.uploadBase64Image(logo, 'hotels/logos');
              hotel.logo = result.url;
            } catch (error: any) {
              logger.error('Logo upload error:', error);
              return sendError(
                res,
                'IMAGE_UPLOAD_ERROR',
                `Failed to upload logo: ${error.message}`,
                500
              );
            }
          } else {
            // Assume it's already a URL
            hotel.logo = logo;
          }
        } else if (logo === null) {
          hotel.logo = null;
        }
      }

      if (star_rating !== undefined) {
        const rating = parseInt(star_rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          return sendError(
            res,
            'INVALID_INPUT',
            'Star rating must be between 1 and 5',
            400
          );
        }
        hotel.star_rating = rating;
      }

      // Save updated hotel
      await hotel.save();

      logger.info(`Hotel profile updated: ${hotel.id} by admin: ${req.user!.id}`);

      // Fetch updated hotel with rooms
      const updatedHotel = await Hotel.findOne({
        where: { id: hotel.id },
        include: [
          {
            model: Room,
            as: 'rooms',
            attributes: [
              'id',
              'room_type',
              'description',
              'capacity',
              'bed_type',
              'size_sqm',
              'price_per_night',
              'discount_percentage',
              'amenities',
              'images',
              'total_rooms',
              'is_active',
            ],
          },
        ],
      });

      return sendSuccess(res, {
        message: 'Hotel profile updated successfully',
        hotel: updatedHotel?.toJSON(),
      });
    } catch (error: any) {
      logger.error('Error updating hotel profile:', error);
      return sendError(
        res,
        'HOTEL_UPDATE_ERROR',
        'Failed to update hotel profile',
        500
      );
    }
  }
}

export default new HotelController();
