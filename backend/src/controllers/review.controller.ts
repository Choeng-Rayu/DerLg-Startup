import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Review, Booking, Hotel, User, sequelize } from '../models';
import { BookingStatus } from '../models/Booking';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../utils/logger';

/**
 * Review Controller
 * Handles review submission and display operations
 */
class ReviewController {
  /**
   * Create a new review
   * POST /api/reviews
   * Requires authentication
   */
  async createReview(req: Request, res: Response): Promise<Response> {
    try {
      const {
        booking_id,
        ratings,
        comment,
        images = [],
      } = req.body;

      // Validate required fields
      if (!booking_id || !ratings || !comment) {
        return sendError(
          res,
          'MISSING_REQUIRED_FIELDS',
          'Booking ID, ratings, and comment are required',
          400
        );
      }

      // Validate ratings structure
      const requiredRatings = ['overall', 'cleanliness', 'service', 'location', 'value'];
      for (const field of requiredRatings) {
        if (!ratings[field] || typeof ratings[field] !== 'number') {
          return sendError(
            res,
            'INVALID_RATINGS',
            `Rating for ${field} is required and must be a number`,
            400
          );
        }
        if (ratings[field] < 1 || ratings[field] > 5) {
          return sendError(
            res,
            'INVALID_RATINGS',
            `Rating for ${field} must be between 1 and 5`,
            400
          );
        }
      }

      // Validate comment length
      if (comment.length < 10 || comment.length > 5000) {
        return sendError(
          res,
          'INVALID_COMMENT',
          'Comment must be between 10 and 5000 characters',
          400
        );
      }

      // Find the booking and verify it belongs to the user
      const booking = await Booking.findOne({
        where: {
          id: booking_id,
          user_id: req.user!.id,
        },
        include: [
          {
            model: Hotel,
            as: 'hotel',
            attributes: ['id', 'name'],
          },
        ],
      });

      if (!booking) {
        return sendError(
          res,
          'BOOKING_NOT_FOUND',
          'Booking not found or does not belong to you',
          404
        );
      }

      // Verify booking is completed
      if (booking.status !== BookingStatus.COMPLETED) {
        return sendError(
          res,
          'BOOKING_NOT_COMPLETED',
          'You can only review completed bookings',
          400
        );
      }

      // Check if review already exists for this booking
      const existingReview = await Review.findOne({
        where: {
          booking_id,
          user_id: req.user!.id,
        },
      });

      if (existingReview) {
        return sendError(
          res,
          'REVIEW_ALREADY_EXISTS',
          'You have already reviewed this booking',
          400
        );
      }

      // Create the review
      const review = await Review.create({
        user_id: req.user!.id,
        booking_id,
        hotel_id: booking.hotel_id,
        tour_id: null, // For now, only hotel reviews
        ratings,
        comment: comment.trim(),
        images: Array.isArray(images) ? images : [],
        is_verified: true, // Verified because it's from a confirmed booking
      });

      // Update hotel average rating
      await this.updateHotelAverageRating(booking.hotel_id);

      logger.info(`Review created: ${review.id} for booking: ${booking_id} by user: ${req.user!.id}`);

      return sendSuccess(
        res,
        {
          review: review.toSafeObject(),
        },
        'Review submitted successfully',
        201
      );
    } catch (error: any) {
      logger.error('Error creating review:', error);

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

      return sendError(res, 'REVIEW_CREATE_ERROR', 'Failed to create review', 500);
    }
  }

  /**
   * Get reviews for a hotel
   * GET /api/reviews/hotel/:hotelId
   */
  async getHotelReviews(req: Request, res: Response): Promise<Response> {
    try {
      const { hotelId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'recent'; // recent, helpful, rating_high, rating_low
      const offset = (page - 1) * limit;

      // Verify hotel exists
      const hotel = await Hotel.findByPk(hotelId, {
        attributes: ['id', 'name', 'average_rating', 'total_reviews'],
      });

      if (!hotel) {
        return sendError(res, 'HOTEL_NOT_FOUND', 'Hotel not found', 404);
      }

      // Determine sort order
      let order: any[] = [];
      switch (sortBy) {
        case 'helpful':
          order = [['helpful_count', 'DESC'], ['created_at', 'DESC']];
          break;
        case 'rating_high':
          order = [[sequelize.literal(`JSON_EXTRACT(ratings, '$.overall')`), 'DESC'], ['created_at', 'DESC']];
          break;
        case 'rating_low':
          order = [[sequelize.literal(`JSON_EXTRACT(ratings, '$.overall')`), 'ASC'], ['created_at', 'DESC']];
          break;
        case 'recent':
        default:
          order = [['created_at', 'DESC']];
          break;
      }

      // Get reviews with pagination
      const { count, rows: reviews } = await Review.findAndCountAll({
        where: {
          hotel_id: hotelId,
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'profile_image'],
          },
        ],
        limit,
        offset,
        order,
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
          'updated_at',
        ],
      });

      // Calculate rating distribution
      const ratingDistribution = await this.calculateRatingDistribution(hotelId);

      const totalPages = Math.ceil(count / limit);

      return sendSuccess(res, {
        hotel: {
          id: hotel.id,
          name: hotel.name,
          average_rating: hotel.average_rating,
          total_reviews: hotel.total_reviews,
        },
        reviews: reviews.map((review) => review.toSafeObject()),
        ratingDistribution,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        sortBy,
      });
    } catch (error: any) {
      logger.error('Error fetching hotel reviews:', error);
      return sendError(res, 'REVIEW_FETCH_ERROR', 'Failed to fetch reviews', 500);
    }
  }

  /**
   * Update hotel average rating
   * Private helper method
   */
  private async updateHotelAverageRating(hotelId: string): Promise<void> {
    try {
      // Calculate average rating from all reviews
      const reviews = await Review.findAll({
        where: { hotel_id: hotelId },
        attributes: ['ratings'],
      });

      if (reviews.length === 0) {
        return;
      }

      // Calculate average of overall ratings
      const totalRating = reviews.reduce((sum, review) => {
        return sum + review.ratings.overall;
      }, 0);

      const averageRating = totalRating / reviews.length;

      // Update hotel
      await Hotel.update(
        {
          average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
          total_reviews: reviews.length,
        },
        {
          where: { id: hotelId },
        }
      );

      logger.info(`Updated hotel ${hotelId} average rating to ${averageRating.toFixed(1)}`);
    } catch (error: any) {
      logger.error('Error updating hotel average rating:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Calculate rating distribution for a hotel
   * Private helper method
   */
  private async calculateRatingDistribution(hotelId: string): Promise<any> {
    try {
      const reviews = await Review.findAll({
        where: { hotel_id: hotelId },
        attributes: ['ratings'],
      });

      const distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      reviews.forEach((review) => {
        const overallRating = Math.round(review.ratings.overall);
        if (overallRating >= 1 && overallRating <= 5) {
          distribution[overallRating as keyof typeof distribution]++;
        }
      });

      // Calculate percentages
      const total = reviews.length;
      const percentages = {
        5: total > 0 ? Math.round((distribution[5] / total) * 100) : 0,
        4: total > 0 ? Math.round((distribution[4] / total) * 100) : 0,
        3: total > 0 ? Math.round((distribution[3] / total) * 100) : 0,
        2: total > 0 ? Math.round((distribution[2] / total) * 100) : 0,
        1: total > 0 ? Math.round((distribution[1] / total) * 100) : 0,
      };

      return {
        counts: distribution,
        percentages,
        total,
      };
    } catch (error: any) {
      logger.error('Error calculating rating distribution:', error);
      return {
        counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        total: 0,
      };
    }
  }

  /**
   * Get user's reviews
   * GET /api/reviews/my-reviews
   * Requires authentication
   */
  async getMyReviews(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const { count, rows: reviews } = await Review.findAndCountAll({
        where: {
          user_id: req.user!.id,
        },
        include: [
          {
            model: Hotel,
            as: 'hotel',
            attributes: ['id', 'name', 'images', 'location'],
          },
          {
            model: Booking,
            as: 'booking',
            attributes: ['id', 'booking_number', 'check_in', 'check_out'],
          },
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']],
      });

      const totalPages = Math.ceil(count / limit);

      return sendSuccess(res, {
        reviews: reviews.map((review) => review.toSafeObject()),
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
      logger.error('Error fetching user reviews:', error);
      return sendError(res, 'REVIEW_FETCH_ERROR', 'Failed to fetch reviews', 500);
    }
  }

  /**
   * Update a review
   * PUT /api/reviews/:id
   * Requires authentication
   */
  async updateReview(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { ratings, comment, images } = req.body;

      // Find review and verify ownership
      const review = await Review.findOne({
        where: {
          id,
          user_id: req.user!.id,
        },
      });

      if (!review) {
        return sendError(
          res,
          'REVIEW_NOT_FOUND',
          'Review not found or does not belong to you',
          404
        );
      }

      // Update ratings if provided
      if (ratings) {
        const requiredRatings = ['overall', 'cleanliness', 'service', 'location', 'value'];
        for (const field of requiredRatings) {
          if (!ratings[field] || typeof ratings[field] !== 'number') {
            return sendError(
              res,
              'INVALID_RATINGS',
              `Rating for ${field} is required and must be a number`,
              400
            );
          }
          if (ratings[field] < 1 || ratings[field] > 5) {
            return sendError(
              res,
              'INVALID_RATINGS',
              `Rating for ${field} must be between 1 and 5`,
              400
            );
          }
        }
        review.ratings = ratings;
      }

      // Update comment if provided
      if (comment !== undefined) {
        if (comment.length < 10 || comment.length > 5000) {
          return sendError(
            res,
            'INVALID_COMMENT',
            'Comment must be between 10 and 5000 characters',
            400
          );
        }
        review.comment = comment.trim();
      }

      // Update images if provided
      if (images !== undefined) {
        if (!Array.isArray(images)) {
          return sendError(
            res,
            'INVALID_IMAGES',
            'Images must be an array',
            400
          );
        }
        review.images = images;
      }

      // Save updated review
      await review.save();

      // Update hotel average rating if ratings changed
      if (ratings && review.hotel_id) {
        await this.updateHotelAverageRating(review.hotel_id);
      }

      logger.info(`Review updated: ${review.id} by user: ${req.user!.id}`);

      return sendSuccess(res, {
        review: review.toSafeObject(),
      }, 'Review updated successfully');
    } catch (error: any) {
      logger.error('Error updating review:', error);

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

      return sendError(res, 'REVIEW_UPDATE_ERROR', 'Failed to update review', 500);
    }
  }

  /**
   * Delete a review
   * DELETE /api/reviews/:id
   * Requires authentication
   */
  async deleteReview(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      // Find review and verify ownership
      const review = await Review.findOne({
        where: {
          id,
          user_id: req.user!.id,
        },
      });

      if (!review) {
        return sendError(
          res,
          'REVIEW_NOT_FOUND',
          'Review not found or does not belong to you',
          404
        );
      }

      const hotelId = review.hotel_id;

      // Delete the review
      await review.destroy();

      // Update hotel average rating
      if (hotelId) {
        await this.updateHotelAverageRating(hotelId);
      }

      logger.info(`Review deleted: ${id} by user: ${req.user!.id}`);

      return sendSuccess(res, null, 'Review deleted successfully');
    } catch (error: any) {
      logger.error('Error deleting review:', error);
      return sendError(res, 'REVIEW_DELETE_ERROR', 'Failed to delete review', 500);
    }
  }

  /**
   * Mark review as helpful
   * POST /api/reviews/:id/helpful
   */
  async markAsHelpful(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const review = await Review.findByPk(id);

      if (!review) {
        return sendError(res, 'REVIEW_NOT_FOUND', 'Review not found', 404);
      }

      await review.markAsHelpful();

      return sendSuccess(res, {
        helpful_count: review.helpful_count,
      }, 'Review marked as helpful');
    } catch (error: any) {
      logger.error('Error marking review as helpful:', error);
      return sendError(res, 'REVIEW_UPDATE_ERROR', 'Failed to mark review as helpful', 500);
    }
  }
}

export default new ReviewController();
