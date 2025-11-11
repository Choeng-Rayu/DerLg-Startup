import { Router } from 'express';
import { 
  createBooking, 
  getPaymentOptions,
  getUserBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  applyPromoCode,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { body, param } from 'express-validator';

const router = Router();

/**
 * Booking creation validation rules
 */
const createBookingValidation = [
  body('hotel_id')
    .notEmpty()
    .withMessage('Hotel ID is required')
    .isUUID()
    .withMessage('Hotel ID must be a valid UUID'),
  
  body('room_id')
    .notEmpty()
    .withMessage('Room ID is required')
    .isUUID()
    .withMessage('Room ID must be a valid UUID'),
  
  body('check_in')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isDate()
    .withMessage('Check-in date must be a valid date (YYYY-MM-DD)'),
  
  body('check_out')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isDate()
    .withMessage('Check-out date must be a valid date (YYYY-MM-DD)'),
  
  body('guests')
    .notEmpty()
    .withMessage('Guest information is required')
    .isObject()
    .withMessage('Guests must be an object'),
  
  body('guests.adults')
    .notEmpty()
    .withMessage('Number of adults is required')
    .isInt({ min: 1 })
    .withMessage('At least 1 adult is required'),
  
  body('guests.children')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Children count must be 0 or greater'),
  
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
 * Payment options validation rules
 */
const paymentOptionsValidation = [
  body('room_id')
    .notEmpty()
    .withMessage('Room ID is required')
    .isUUID()
    .withMessage('Room ID must be a valid UUID'),
  
  body('check_in')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isDate()
    .withMessage('Check-in date must be a valid date (YYYY-MM-DD)'),
  
  body('check_out')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isDate()
    .withMessage('Check-out date must be a valid date (YYYY-MM-DD)'),
  
  body('guests')
    .notEmpty()
    .withMessage('Guest information is required')
    .isObject()
    .withMessage('Guests must be an object'),
  
  body('guests.adults')
    .notEmpty()
    .withMessage('Number of adults is required')
    .isInt({ min: 1 })
    .withMessage('At least 1 adult is required'),
  
  body('deposit_percentage')
    .optional()
    .isInt({ min: 50, max: 70 })
    .withMessage('Deposit percentage must be between 50 and 70'),
];

/**
 * Booking ID validation
 */
const bookingIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isUUID()
    .withMessage('Booking ID must be a valid UUID'),
];

/**
 * Update booking validation rules
 */
const updateBookingValidation = [
  param('id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isUUID()
    .withMessage('Booking ID must be a valid UUID'),
  
  body('check_in')
    .optional()
    .isDate()
    .withMessage('Check-in date must be a valid date (YYYY-MM-DD)'),
  
  body('check_out')
    .optional()
    .isDate()
    .withMessage('Check-out date must be a valid date (YYYY-MM-DD)'),
  
  body('guests')
    .optional()
    .isObject()
    .withMessage('Guests must be an object'),
  
  body('guests.adults')
    .optional()
    .isInt({ min: 1 })
    .withMessage('At least 1 adult is required'),
  
  body('guests.children')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Children count must be 0 or greater'),
  
  body('guest_details')
    .optional()
    .isObject()
    .withMessage('Guest details must be an object'),
  
  body('guest_details.name')
    .optional()
    .isString()
    .withMessage('Guest name must be a string')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Guest name must be between 2 and 100 characters'),
  
  body('guest_details.email')
    .optional()
    .isEmail()
    .withMessage('Guest email must be valid')
    .normalizeEmail(),
  
  body('guest_details.phone')
    .optional()
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
];

/**
 * Cancel booking validation rules
 */
const cancelBookingValidation = [
  param('id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isUUID()
    .withMessage('Booking ID must be a valid UUID'),
  
  body('reason')
    .optional()
    .isString()
    .withMessage('Cancellation reason must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason must not exceed 500 characters'),
];

/**
 * Apply promo code validation rules
 */
const applyPromoCodeValidation = [
  param('id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isUUID()
    .withMessage('Booking ID must be a valid UUID'),
  
  body('promo_code')
    .notEmpty()
    .withMessage('Promo code is required')
    .isString()
    .withMessage('Promo code must be a string')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Promo code must be between 3 and 50 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Promo code must contain only uppercase letters and numbers'),
];

/**
 * @route   POST /api/bookings/payment-options
 * @desc    Get payment options for a booking
 * @access  Public (can be used before authentication)
 */
router.post(
  '/payment-options',
  paymentOptionsValidation,
  validate,
  getPaymentOptions
);

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings for the authenticated user
 * @access  Private (Tourist)
 */
router.get(
  '/',
  authenticate,
  getUserBookings
);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get a specific booking by ID
 * @access  Private (Tourist)
 */
router.get(
  '/:id',
  authenticate,
  bookingIdValidation,
  validate,
  getBookingById
);

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update a booking (modify dates, guest details, etc.)
 * @access  Private (Tourist)
 */
router.put(
  '/:id',
  authenticate,
  updateBookingValidation,
  validate,
  updateBooking
);

/**
 * @route   DELETE /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private (Tourist)
 */
router.delete(
  '/:id/cancel',
  authenticate,
  cancelBookingValidation,
  validate,
  cancelBooking
);

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private (Tourist)
 */
router.post(
  '/',
  authenticate,
  createBookingValidation,
  validate,
  createBooking
);

/**
 * @route   POST /api/bookings/:id/promo-code
 * @desc    Apply promo code to a booking
 * @access  Private (Tourist)
 */
router.post(
  '/:id/promo-code',
  authenticate,
  applyPromoCodeValidation,
  validate,
  applyPromoCode
);

export default router;
