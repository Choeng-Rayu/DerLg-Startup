import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Event from '../models/Event';
import Tour from '../models/Tour';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

/**
 * Get all events with optional filters
 * @route GET /api/events
 */
export const getEvents = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      event_type,
      city,
      province,
      start_date,
      end_date,
      min_price,
      max_price,
      available_only,
      page = 1,
      limit = 20,
      sort_by = 'start_date',
    } = req.query;

    // Build where clause
    const where: any = {
      is_active: true,
    };

    // Event type filter
    if (event_type) {
      where.event_type = event_type;
    }

    // Location filters (JSON field)
    if (city) {
      where['$location.city$'] = {
        [Op.like]: `%${city}%`,
      };
    }

    if (province) {
      where['$location.province$'] = {
        [Op.like]: `%${province}%`,
      };
    }

    // Date range filters
    if (start_date) {
      where.start_date = {
        [Op.gte]: new Date(start_date as string),
      };
    }

    if (end_date) {
      where.end_date = {
        [Op.lte]: new Date(end_date as string),
      };
    }

    // Price range filter (JSON field - we'll filter in memory)
    const priceFilter = {
      min: min_price ? parseFloat(min_price as string) : null,
      max: max_price ? parseFloat(max_price as string) : null,
    };

    // Sorting
    let order: any[] = [];
    switch (sort_by) {
      case 'start_date':
        order = [['start_date', 'ASC']];
        break;
      case 'end_date':
        order = [['end_date', 'ASC']];
        break;
      case 'name':
        order = [['name', 'ASC']];
        break;
      case 'popularity':
        order = [['bookings_count', 'DESC']];
        break;
      default:
        order = [['start_date', 'ASC']];
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Fetch events
    const { count, rows: events } = await Event.findAndCountAll({
      where,
      order,
      limit: limitNum,
      offset,
    });

    // Filter by price if specified (in-memory filter)
    let filteredEvents = events;
    if (priceFilter.min !== null || priceFilter.max !== null) {
      filteredEvents = events.filter((event) => {
        const basePrice = event.pricing.base_price;
        if (priceFilter.min !== null && basePrice < priceFilter.min) return false;
        if (priceFilter.max !== null && basePrice > priceFilter.max) return false;
        return true;
      });
    }

    // Filter by availability if specified
    if (available_only === 'true') {
      filteredEvents = filteredEvents.filter((event) => event.hasAvailableCapacity());
    }

    // Calculate total pages
    const totalPages = Math.ceil(count / limitNum);

    logger.info(`Retrieved ${filteredEvents.length} events (page ${pageNum}/${totalPages})`);

    return successResponse(res, {
      events: filteredEvents.map((event) => event.toSafeObject()),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages,
      },
      filters: {
        event_type,
        city,
        province,
        start_date,
        end_date,
        min_price,
        max_price,
        available_only,
        sort_by,
      },
    }, 'Events retrieved successfully');
  } catch (error: any) {
    logger.error('Error retrieving events:', error);
    return errorResponse(res, 'Failed to retrieve events', 500, 'EVENT_RETRIEVAL_ERROR');
  }
};

/**
 * Get a specific event by ID with full details including related tours
 * @route GET /api/events/:id
 */
export const getEventById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Find event
    const event = await Event.findByPk(id);

    if (!event) {
      return errorResponse(res, 'Event not found', 404, 'EVENT_NOT_FOUND');
    }

    if (!event.is_active) {
      return errorResponse(res, 'Event is not available', 404, 'EVENT_NOT_AVAILABLE');
    }

    // Fetch related tours if they exist
    let relatedTours: any[] = [];
    if (event.related_tours && event.related_tours.length > 0) {
      const tours = await Tour.findAll({
        where: {
          id: {
            [Op.in]: event.related_tours,
          },
          is_active: true,
        },
      });

      relatedTours = tours.map((tour) => ({
        id: tour.id,
        name: tour.name,
        description: tour.description,
        destination: tour.destination,
        duration: tour.duration,
        difficulty: tour.difficulty,
        price_per_person: tour.price_per_person,
        average_rating: tour.average_rating,
        images: tour.images.slice(0, 1), // Only include first image
      }));
    }

    logger.info(`Retrieved event details for event ID: ${id}`);

    return successResponse(res, {
      event: {
        ...event.toSafeObject(),
        related_tours: relatedTours,
      },
    }, 'Event details retrieved successfully');
  } catch (error: any) {
    logger.error('Error retrieving event details:', error);
    return errorResponse(res, 'Failed to retrieve event details', 500, 'EVENT_DETAIL_ERROR');
  }
};

/**
 * Get events by specific date
 * @route GET /api/events/date/:date
 */
export const getEventsByDate = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { date } = req.params;

    // Validate date format
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      return errorResponse(res, 'Invalid date format. Use YYYY-MM-DD', 400, 'INVALID_DATE_FORMAT');
    }

    // Find events that are active on the specified date
    const events = await Event.findAll({
      where: {
        is_active: true,
        start_date: {
          [Op.lte]: queryDate,
        },
        end_date: {
          [Op.gte]: queryDate,
        },
      },
      order: [['start_date', 'ASC']],
    });

    // Fetch related tours for each event
    const eventsWithTours = await Promise.all(
      events.map(async (event) => {
        let relatedTours: any[] = [];
        
        if (event.related_tours && event.related_tours.length > 0) {
          const tours = await Tour.findAll({
            where: {
              id: {
                [Op.in]: event.related_tours,
              },
              is_active: true,
            },
          });

          relatedTours = tours.map((tour) => ({
            id: tour.id,
            name: tour.name,
            destination: tour.destination,
            duration: tour.duration,
            price_per_person: tour.price_per_person,
            average_rating: tour.average_rating,
          }));
        }

        return {
          ...event.toSafeObject(),
          related_tours: relatedTours,
        };
      })
    );

    logger.info(`Retrieved ${events.length} events for date: ${date}`);

    return successResponse(res, {
      date: date,
      events: eventsWithTours,
      count: events.length,
    }, `Events for ${date} retrieved successfully`);
  } catch (error: any) {
    logger.error('Error retrieving events by date:', error);
    return errorResponse(res, 'Failed to retrieve events by date', 500, 'EVENT_DATE_QUERY_ERROR');
  }
};
