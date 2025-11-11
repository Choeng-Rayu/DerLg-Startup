import { Router } from 'express';
import hotelController from '../controllers/hotel.controller';
import { authenticate, authorize } from '../middleware/authenticate';
import { UserType } from '../models/User';

const router = Router();

/**
 * Hotel Admin Routes
 * Routes for hotel administrators to manage their hotel profile and room inventory
 * All routes require authentication and admin role
 */

// GET /api/hotel/profile - Get hotel profile for logged-in admin
router.get(
  '/profile',
  authenticate,
  authorize([UserType.ADMIN]),
  hotelController.getHotelProfile
);

// PUT /api/hotel/profile - Update hotel profile for logged-in admin
router.put(
  '/profile',
  authenticate,
  authorize([UserType.ADMIN]),
  hotelController.updateHotelProfile
);

export default router;
