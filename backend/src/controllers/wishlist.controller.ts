import { Request, Response } from 'express';
import { Wishlist, Hotel, Tour, Event } from '../models';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

/**
 * Get all wishlist items for the authenticated user
 */
export const getUserWishlist = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'User not authenticated', 'AUTH_1003', 401);
    }

    // Get all wishlist items for the user
    const wishlistItems = await Wishlist.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });

    // Fetch the actual items (hotels, tours, events) based on item_type and item_id
    const itemsWithDetails = await Promise.all(
      wishlistItems.map(async (item) => {
        let itemDetails = null;

        if (item.item_type === 'hotel') {
          itemDetails = await Hotel.findByPk(item.item_id);
        } else if (item.item_type === 'tour') {
          itemDetails = await Tour.findByPk(item.item_id);
        } else if (item.item_type === 'event') {
          itemDetails = await Event.findByPk(item.item_id);
        }

        return {
          id: item.id,
          item_type: item.item_type,
          item_id: item.item_id,
          notes: item.notes,
          created_at: item.created_at,
          item: itemDetails,
        };
      })
    );

    // Filter out items where the actual item no longer exists
    const validItems = itemsWithDetails.filter(item => item.item !== null);

    logger.info(`Retrieved ${validItems.length} wishlist items for user ${userId}`);

    return successResponse(res, validItems, 'Wishlist retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving wishlist:', error);
    return errorResponse(res, 'Failed to retrieve wishlist', 'SYS_9001', 500);
  }
};

/**
 * Add an item to wishlist
 */
export const addToWishlist = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    const { item_type, item_id, notes } = req.body;

    if (!userId) {
      return errorResponse(res, 'User not authenticated', 'AUTH_1003', 401);
    }

    // Check if the item exists
    let itemExists = false;
    if (item_type === 'hotel') {
      const hotel = await Hotel.findByPk(item_id);
      itemExists = hotel !== null;
    } else if (item_type === 'tour') {
      const tour = await Tour.findByPk(item_id);
      itemExists = tour !== null;
    } else if (item_type === 'event') {
      const event = await Event.findByPk(item_id);
      itemExists = event !== null;
    }

    if (!itemExists) {
      return errorResponse(res, 'Item not found', 'RES_3001', 404);
    }

    // Check if the item is already in the wishlist
    const existingItem = await Wishlist.findOne({
      where: {
        user_id: userId,
        item_type,
        item_id,
      },
    });

    if (existingItem) {
      return errorResponse(res, 'Item already in wishlist', 'RES_3002', 400);
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.create({
      user_id: userId,
      item_type,
      item_id,
      notes: notes || null,
    });

    logger.info(`User ${userId} added ${item_type} ${item_id} to wishlist`);

    return successResponse(res, wishlistItem, 'Item added to wishlist successfully', 201);
  } catch (error) {
    logger.error('Error adding to wishlist:', error);
    return errorResponse(res, 'Failed to add item to wishlist', 'SYS_9001', 500);
  }
};

/**
 * Update wishlist item notes
 */
export const updateWishlistNote = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { notes } = req.body;

    if (!userId) {
      return errorResponse(res, 'User not authenticated', 'AUTH_1003', 401);
    }

    // Find the wishlist item
    const wishlistItem = await Wishlist.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!wishlistItem) {
      return errorResponse(res, 'Wishlist item not found', 'RES_3001', 404);
    }

    // Update notes
    wishlistItem.notes = notes || null;
    await wishlistItem.save();

    logger.info(`User ${userId} updated notes for wishlist item ${id}`);

    return successResponse(res, wishlistItem, 'Wishlist notes updated successfully');
  } catch (error) {
    logger.error('Error updating wishlist notes:', error);
    return errorResponse(res, 'Failed to update wishlist notes', 'SYS_9001', 500);
  }
};

/**
 * Remove an item from wishlist
 */
export const removeFromWishlist = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return errorResponse(res, 'User not authenticated', 'AUTH_1003', 401);
    }

    // Find and delete the wishlist item
    const wishlistItem = await Wishlist.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!wishlistItem) {
      return errorResponse(res, 'Wishlist item not found', 'RES_3001', 404);
    }

    await wishlistItem.destroy();

    logger.info(`User ${userId} removed wishlist item ${id}`);

    return successResponse(res, null, 'Item removed from wishlist successfully');
  } catch (error) {
    logger.error('Error removing from wishlist:', error);
    return errorResponse(res, 'Failed to remove item from wishlist', 'SYS_9001', 500);
  }
};
