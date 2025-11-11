import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { body } from 'express-validator';
import {
  getUserProfile,
  updateUserProfile,
} from '../controllers/user.controller';

const router = Router();

/**
 * Update user profile validation rules
 */
const updateProfileValidation = [
  body('first_name')
    .optional()
    .isString()
    .withMessage('First name must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('last_name')
    .optional()
    .isString()
    .withMessage('Last name must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .isString()
    .withMessage('Phone must be a string')
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Phone must be a valid phone number'),
  
  body('language')
    .optional()
    .isIn(['en', 'km', 'zh'])
    .withMessage('Language must be en, km, or zh'),
  
  body('currency')
    .optional()
    .isIn(['USD', 'KHR'])
    .withMessage('Currency must be USD or KHR'),
];

/**
 * @route   GET /api/user/profile
 * @desc    Get authenticated user's profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticate,
  getUserProfile
);

/**
 * @route   PUT /api/user/profile
 * @desc    Update authenticated user's profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  updateProfileValidation,
  validate,
  updateUserProfile
);

export default router;
