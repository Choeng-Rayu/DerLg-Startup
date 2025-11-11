import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

/**
 * Validation middleware for registration
 */
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('first_name')
    .notEmpty()
    .withMessage('First name is required')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('last_name')
    .notEmpty()
    .withMessage('Last name is required')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Phone number must be in valid international format'),
  body('user_type')
    .optional()
    .isIn(['tourist'])
    .withMessage('Only tourist user type is allowed for registration'),
  body('language')
    .optional()
    .isIn(['en', 'km', 'zh'])
    .withMessage('Language must be one of: en, km, zh'),
  body('currency')
    .optional()
    .isIn(['USD', 'KHR'])
    .withMessage('Currency must be either USD or KHR'),
  validate,
];

/**
 * Validation middleware for login
 */
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  validate,
];

/**
 * Validation middleware for refresh token
 */
const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
  validate,
];

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', registerValidation, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
router.post('/login', loginValidation, authController.login);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh-token', refreshTokenValidation, authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (revoke refresh token)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify access token
 * @access  Private
 */
router.get('/verify', authenticate, authController.verifyToken);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * Validation middleware for Google OAuth
 */
const googleAuthValidation = [
  body('idToken')
    .optional()
    .isString()
    .withMessage('ID token must be a string'),
  body('code')
    .optional()
    .isString()
    .withMessage('Authorization code must be a string'),
  validate,
];

/**
 * @route   POST /api/auth/social/google
 * @desc    Authenticate with Google OAuth 2.0
 * @access  Public
 */
router.post('/social/google', googleAuthValidation, authController.googleAuth);

/**
 * Validation middleware for Facebook OAuth
 */
const facebookAuthValidation = [
  body('accessToken')
    .optional()
    .isString()
    .withMessage('Access token must be a string'),
  body('code')
    .optional()
    .isString()
    .withMessage('Authorization code must be a string'),
  body('redirectUri')
    .optional()
    .isString()
    .withMessage('Redirect URI must be a string'),
  validate,
];

/**
 * @route   POST /api/auth/social/facebook
 * @desc    Authenticate with Facebook Login API
 * @access  Public
 */
router.post('/social/facebook', facebookAuthValidation, authController.facebookAuth);

/**
 * Validation middleware for forgot password
 */
const forgotPasswordValidation = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Phone number must be in valid international format'),
  validate,
];

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset via email or SMS
 * @access  Public
 */
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);

/**
 * Validation middleware for reset password
 */
const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required')
    .isString()
    .withMessage('Token must be a string'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  validate,
];

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

export default router;
