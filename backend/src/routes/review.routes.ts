import { Router } from 'express';
import reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validate';
import { body, param, query } from 'express-validator';

const router = Router();

/**
 * Review Routes
 */

// Create a new review (requires authentication)
router.post(
  '/',
  authenticate,
  [
    body('booking_id')
      .notEmpty()
      .withMessage('Booking ID is required')
      .isUUID()
      .withMessage('Booking ID must be a valid UUID'),
    body('ratings')
      .notEmpty()
      .withMessage('Ratings are required')
      .isObject()
      .withMessage('Ratings must be an object'),
    body('ratings.overall')
      .isFloat({ min: 1, max: 5 })
      .withMessage('Overall rating must be between 1 and 5'),
    body('ratings.cleanliness')
      .isFloat({ min: 1, max: 5 })
      .withMessage('Cleanliness rating must be between 1 and 5'),
    body('ratings.service')
      .isFloat({ min: 1, max: 5 })
      .withMessage('Service rating must be between 1 and 5'),
    body('ratings.location')
      .isFloat({ min: 1, max: 5 })
      .withMessage('Location rating must be between 1 and 5'),
    body('ratings.value')
      .isFloat({ min: 1, max: 5 })
      .withMessage('Value rating must be between 1 and 5'),
    body('comment')
      .notEmpty()
      .withMessage('Comment is required')
      .isString()
      .withMessage('Comment must be a string')
      .isLength({ min: 10, max: 5000 })
      .withMessage('Comment must be between 10 and 5000 characters'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Images must be an array'),
  ],
  validateRequest,
  reviewController.createReview
);

// Get reviews for a hotel
router.get(
  '/hotel/:hotelId',
  [
    param('hotelId')
      .isUUID()
      .withMessage('Hotel ID must be a valid UUID'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sortBy')
      .optional()
      .isIn(['recent', 'helpful', 'rating_high', 'rating_low'])
      .withMessage('Sort by must be one of: recent, helpful, rating_high, rating_low'),
  ],
  validateRequest,
  reviewController.getHotelReviews
);

// Get user's own reviews (requires authentication)
router.get(
  '/my-reviews',
  authenticate,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  reviewController.getMyReviews
);

// Update a review (requires authentication)
router.put(
  '/:id',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('Review ID must be a valid UUID'),
    body('ratings')
      .optional()
      .isObject()
      .withMessage('Ratings must be an object'),
    body('ratings.overall')
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage('Overall rating must be between 1 and 5'),
    body('ratings.cleanliness')
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage('Cleanliness rating must be between 1 and 5'),
    body('ratings.service')
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage('Service rating must be between 1 and 5'),
    body('ratings.location')
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage('Location rating must be between 1 and 5'),
    body('ratings.value')
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage('Value rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isString()
      .withMessage('Comment must be a string')
      .isLength({ min: 10, max: 5000 })
      .withMessage('Comment must be between 10 and 5000 characters'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Images must be an array'),
  ],
  validateRequest,
  reviewController.updateReview
);

// Delete a review (requires authentication)
router.delete(
  '/:id',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('Review ID must be a valid UUID'),
  ],
  validateRequest,
  reviewController.deleteReview
);

// Mark review as helpful
router.post(
  '/:id/helpful',
  [
    param('id')
      .isUUID()
      .withMessage('Review ID must be a valid UUID'),
  ],
  validateRequest,
  reviewController.markAsHelpful
);

export default router;
