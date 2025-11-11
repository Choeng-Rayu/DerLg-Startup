import { Router } from 'express';
import {
  getEvents,
  getEventById,
  getEventsByDate,
} from '../controllers/event.controller';

const router = Router();

/**
 * @route   GET /api/events
 * @desc    Get all events with optional filters
 * @access  Public
 */
router.get('/', getEvents);

/**
 * @route   GET /api/events/date/:date
 * @desc    Get events by specific date
 * @access  Public
 * @note    This route must come before /:id to avoid conflicts
 */
router.get('/date/:date', getEventsByDate);

/**
 * @route   GET /api/events/:id
 * @desc    Get event details by ID
 * @access  Public
 */
router.get('/:id', getEventById);

export default router;
