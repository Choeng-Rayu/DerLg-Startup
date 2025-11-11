import { Router } from 'express';
import hotelController from '../controllers/hotel.controller';
import { authenticate, authorize } from '../middleware/authenticate';
import { UserType } from '../models/User';

const router = Router();

/**
 * Room Management Routes
 * Routes for hotel administrators to manage their room inventory
 * All routes require authentication and admin role
 */

// GET /api/rooms - Get all rooms for hotel admin
router.get(
  '/',
  authenticate,
  authorize([UserType.ADMIN]),
  hotelController.getRooms
);

// POST /api/rooms - Create a new room
router.post(
  '/',
  authenticate,
  authorize([UserType.ADMIN]),
  hotelController.createRoom
);

// PUT /api/rooms/:id - Update room details
router.put(
  '/:id',
  authenticate,
  authorize([UserType.ADMIN]),
  hotelController.updateRoom
);

// DELETE /api/rooms/:id - Delete a room
router.delete(
  '/:id',
  authenticate,
  authorize([UserType.ADMIN]),
  hotelController.deleteRoom
);

export default router;
