import { Router } from 'express';
import authRoutes from './auth.routes';
import testRoutes from './test.routes';
import hotelRoutes from './hotel.routes';
import hotelAdminRoutes from './hotel-admin.routes';
import roomRoutes from './room.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
import tourRoutes from './tour.routes';
import eventRoutes from './event.routes';
import reviewRoutes from './review.routes';
import telegramRoutes from './telegram.routes';
import wishlistRoutes from './wishlist.routes';
import userRoutes from './user.routes';
import messageRoutes from './message.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'DerLg Tourism Platform API is running',
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
router.use('/auth', authRoutes);

// Test routes (for demonstrating authorization)
router.use('/test', testRoutes);

// Hotel routes (public)
router.use('/hotels', hotelRoutes);

// Hotel admin routes (protected)
router.use('/hotel', hotelAdminRoutes);

// Room management routes (protected - hotel admins only)
router.use('/rooms', roomRoutes);

// Booking routes (protected - tourists)
router.use('/bookings', bookingRoutes);

// Payment routes (protected and webhook)
router.use('/payments', paymentRoutes);

// Tour routes (public and protected)
// router.use('/tours', tourRoutes);

// Event routes (public)
// router.use('/events', eventRoutes);

// Review routes (public and protected)
// router.use('/reviews', reviewRoutes);

// Telegram webhook routes (public - for Telegram bot webhooks)
// router.use('/webhook/telegram', telegramRoutes);

// Wishlist routes (protected - tourists)
// router.use('/wishlist', wishlistRoutes);

// User profile routes (protected)
// router.use('/user', userRoutes);

// Message routes (protected - real-time messaging)
// router.use('/messages', messageRoutes);

export default router;
