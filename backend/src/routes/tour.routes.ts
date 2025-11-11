import { Router } from 'express';
import { 
  getTours, 
  getTourById,
  createTourBooking,
} from '../controllers/tour.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { body, param, query } from 'express-validator';

const router = Router();

/**
 * Tour search/filter validation rules
 */
const tourSearchValidation = [
  query('destination')
    .optional()
    .isString()
    .withMessage('Destination must be a string')
    .trim(),
  
  query('difficulty')
    .optional()
    .isIn(['easy', 'moderate', 'challenging'])
    .withMessage('Difficulty must be easy, moderate, or challenging'),
  
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string')
    .trim(),
  
  query('min_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('max_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('min_days')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum days must be at least 1'),
  
  query('max_days')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum days must be at least 1'),
  
  query('group_size')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Group size must be at least 1'),
  
  query('guide_required')
    .optional()
    .isBoolean()
    .withMessage('Guide required must be a boolean'),
  
  query('transportation_required')
    .optional()
    .isBoolean()
    .withMessage('Transportation required must be a boolean'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be at least 1'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort_by')
    .optional()
    .isIn(['price_asc', 'price_desc', 'rating', 'popularity', 'duration'])
    .withMessage('Sort by must be price_asc, price_desc, rating, popularity, or duration'),
];

/**
 * Tour ID validation
 */
const tourIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Tour ID is required')
    .isUUID()
    .withMessage('Tour ID must be a valid UUID'),
];

/**
 * Tour booking validation rules
 */
const tourBookingValidation = [
  body('tour_id')
    .notEmpty()
    .withMessage('Tour ID is required')
    .isUUID()
    .withMessage('Tour ID must be a valid UUID'),
  
  body('tour_date')
    .notEmpty()
    .withMessage('Tour date is required')
    .isDate()
    .withMessage('Tour date must be a valid date (YYYY-MM-DD)'),
  
  body('participants')
    .notEmpty()
    .withMessage('Number of participants is required')
    .isInt({ min: 1 })
    .withMessage('At least 1 participant is required'),
  
  body('guest_details')
    .notEmpty()
    .withMessage('Guest details are required')
    .isObject()
    .withMessage('Guest details must be an object'),
  
  body('guest_details.name')
    .notEmpty()
    .withMessage('Guest name is required')
    .isString()
    .withMessage('Guest name must be a string')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Guest name must be between 2 and 100 characters'),
  
  body('guest_details.email')
    .notEmpty()
    .withMessage('Guest email is required')
    .isEmail()
    .withMessage('Guest email must be valid')
    .normalizeEmail(),
  
  body('guest_details.phone')
    .notEmpty()
    .withMessage('Guest phone is required')
    .isString()
    .withMessage('Guest phone must be a string')
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Guest phone must be a valid phone number'),
  
  body('guest_details.special_requests')
    .optional()
    .isString()
    .withMessage('Special requests must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requests must not exceed 500 characters'),
  
  body('payment_method')
    .optional()
    .isIn(['paypal', 'bakong', 'stripe'])
    .withMessage('Payment method must be paypal, bakong, or stripe'),
  
  body('payment_type')
    .optional()
    .isIn(['deposit', 'milestone', 'full'])
    .withMessage('Payment type must be deposit, milestone, or full'),
];

/**
 * @route   GET /api/tours
 * @desc    Get all tours with optional search and filters
 * @access  Public
 */
router.get(
  '/',
  tourSearchValidation,
  validate,
  getTours
);

/**
 * @route   GET /api/tours/:id
 * @desc    Get a specific tour by ID with full details
 * @access  Public
 */
router.get(
  '/:id',
  tourIdValidation,
  validate,
  getTourById
);

/**
 * @route   POST /api/bookings/tours
 * @desc    Create a new tour booking
 * @access  Private (Tourist)
 */
router.post(
  '/bookings',
  authenticate,
  tourBookingValidation,
  validate,
  createTourBooking
);

export default router;
