import { Request, Response } from 'express';
import { User } from '../models';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

/**
 * Get authenticated user's profile
 */
export const getUserProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'User not authenticated', 'AUTH_1003', 401);
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(res, 'User not found', 'RES_3001', 404);
    }

    // Return safe user object (without sensitive data)
    const safeUser = user.toSafeObject();

    logger.info(`Retrieved profile for user ${userId}`);

    return successResponse(res, safeUser, 'User profile retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving user profile:', error);
    return errorResponse(res, 'Failed to retrieve user profile', 'SYS_9001', 500);
  }
};

/**
 * Update authenticated user's profile
 */
export const updateUserProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    const { first_name, last_name, phone, language, currency } = req.body;

    if (!userId) {
      return errorResponse(res, 'User not authenticated', 'AUTH_1003', 401);
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(res, 'User not found', 'RES_3001', 404);
    }

    // Update user fields
    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (phone !== undefined) user.phone = phone;
    if (language !== undefined) user.language = language;
    if (currency !== undefined) user.currency = currency;

    await user.save();

    // Return safe user object
    const safeUser = user.toSafeObject();

    logger.info(`Updated profile for user ${userId}`);

    return successResponse(res, safeUser, 'User profile updated successfully');
  } catch (error) {
    logger.error('Error updating user profile:', error);
    return errorResponse(res, 'Failed to update user profile', 'SYS_9001', 500);
  }
};
