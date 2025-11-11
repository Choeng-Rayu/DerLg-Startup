/**
 * Test routes for demonstrating role-based authorization
 * 
 * These routes are for testing purposes only and demonstrate
 * how to use the authorize middleware with different user roles.
 */

import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/authenticate';
import { UserType } from '../models/User';

const router = Router();

/**
 * @route   GET /api/test/super-admin
 * @desc    Test route accessible only by super admins
 * @access  Private (super_admin only)
 */
router.get(
  '/super-admin',
  authenticate,
  authorize([UserType.SUPER_ADMIN]),
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Super admin access granted',
      data: {
        user: {
          id: req.user?.id,
          email: req.user?.email,
          user_type: req.user?.user_type,
        },
      },
    });
  }
);

/**
 * @route   GET /api/test/admin
 * @desc    Test route accessible only by admins
 * @access  Private (admin only)
 */
router.get(
  '/admin',
  authenticate,
  authorize([UserType.ADMIN]),
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Admin access granted',
      data: {
        user: {
          id: req.user?.id,
          email: req.user?.email,
          user_type: req.user?.user_type,
        },
      },
    });
  }
);

/**
 * @route   GET /api/test/tourist
 * @desc    Test route accessible only by tourists
 * @access  Private (tourist only)
 */
router.get(
  '/tourist',
  authenticate,
  authorize([UserType.TOURIST]),
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Tourist access granted',
      data: {
        user: {
          id: req.user?.id,
          email: req.user?.email,
          user_type: req.user?.user_type,
        },
      },
    });
  }
);

/**
 * @route   GET /api/test/admin-or-super
 * @desc    Test route accessible by both admins and super admins
 * @access  Private (admin or super_admin)
 */
router.get(
  '/admin-or-super',
  authenticate,
  authorize([UserType.ADMIN, UserType.SUPER_ADMIN]),
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Admin or super admin access granted',
      data: {
        user: {
          id: req.user?.id,
          email: req.user?.email,
          user_type: req.user?.user_type,
        },
      },
    });
  }
);

/**
 * @route   GET /api/test/all-authenticated
 * @desc    Test route accessible by all authenticated users
 * @access  Private (all user types)
 */
router.get(
  '/all-authenticated',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.ADMIN, UserType.TOURIST]),
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Authenticated user access granted',
      data: {
        user: {
          id: req.user?.id,
          email: req.user?.email,
          user_type: req.user?.user_type,
        },
      },
    });
  }
);

/**
 * @route   GET /api/test/public
 * @desc    Test route accessible by everyone (no authentication required)
 * @access  Public
 */
router.get('/public', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Public access granted',
    data: {
      authenticated: !!req.user,
    },
  });
});

export default router;
