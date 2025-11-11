import { Router } from 'express';
import hotelController from '../controllers/hotel.controller';

const router = Router();

/**
 * Hotel Routes
 * Public routes for browsing hotels
 */

// Public routes (no authentication required)

// GET /api/hotels - Get all hotels with pagination
router.get('/', hotelController.getHotels);

// GET /api/hotels/search - Search hotels with filters
router.get('/search', hotelController.searchHotels);

// GET /api/hotels/:id/availability - Check room availability for date range
router.get('/:id/availability', hotelController.checkAvailability);

// GET /api/hotels/:id - Get hotel by ID
router.get('/:id', hotelController.getHotelById);

export default router;
