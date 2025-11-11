import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { body, param } from 'express-validator';
import {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistNote,
} from '../controllers/wishlist.controller';

const router = Router();

/**
 * Add to wishlist validation rules
 */
const addToWishlistValidation = [
  body('item_type')
    .notEmpty()
    .withMessage('Item type is required')
    .isIn(['hotel', 'tour', 'event'])
    .withMessage('Item type must be hotel, tour, or event'),
  
  body('item_id')
    .notEmpty()
    .withMessage('Item ID is required')
    .isUUID()
    .withMessage('Item ID must be a valid UUID'),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
];

/**
 * Update wishlist note validation rules
 */
const updateWishlistNoteValidation = [
  param('id')
    .notEmpty()
    .withMessage('Wishlist ID is required')
    .isUUID()
    .withMessage('Wishlist ID must be a valid UUID'),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
];

/**
 * Wishlist ID validation
 */
const wishlistIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Wishlist ID is required')
    .isUUID()
    .withMessage('Wishlist ID must be a valid UUID'),
];

/**
 * @route   GET /api/wishlist
 * @desc    Get all wishlist items for the authenticated user
 * @access  Private (Tourist)
 */
router.get(
  '/',
  authenticate,
  getUserWishlist
);

/**
 * @route   POST /api/wishlist
 * @desc    Add an item to wishlist
 * @access  Private (Tourist)
 */
router.post(
  '/',
  authenticate,
  addToWishlistValidation,
  validate,
  addToWishlist
);

/**
 * @route   PUT /api/wishlist/:id
 * @desc    Update wishlist item notes
 * @access  Private (Tourist)
 */
router.put(
  '/:id',
  authenticate,
  updateWishlistNoteValidation,
  validate,
  updateWishlistNote
);

/**
 * @route   DELETE /api/wishlist/:id
 * @desc    Remove an item from wishlist
 * @access  Private (Tourist)
 */
router.delete(
  '/:id',
  authenticate,
  wishlistIdValidation,
  validate,
  removeFromWishlist
);

export default router;
