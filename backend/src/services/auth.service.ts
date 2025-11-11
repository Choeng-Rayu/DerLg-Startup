import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import config from '../config/env';
import User from '../models/User';
import logger from '../utils/logger';

/**
 * JWT Payload interface
 */
export interface JWTPayload {
  userId: string;
  userType: string;
  email: string;
  type?: 'access' | 'refresh';
}

/**
 * Token pair interface
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * AuthService class
 * Handles JWT token generation, verification, and refresh logic
 */
class AuthService {
  /**
   * Generate access token (24-hour expiration)
   */
  generateAccessToken(payload: JWTPayload): string {
    try {
      const accessPayload = {
        ...payload,
        type: 'access' as const,
        jti: randomBytes(16).toString('hex') // Unique token ID
      };
      const token = jwt.sign(accessPayload, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN,
        issuer: 'derlg-api',
        audience: 'derlg-client',
      } as jwt.SignOptions);
      return token;
    } catch (error) {
      logger.error('Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate refresh token (30-day expiration)
   */
  generateRefreshToken(payload: JWTPayload): string {
    try {
      const refreshPayload = {
        ...payload,
        type: 'refresh' as const,
        jti: randomBytes(16).toString('hex') // Unique token ID
      };
      const token = jwt.sign(refreshPayload, config.JWT_REFRESH_SECRET, {
        expiresIn: config.JWT_REFRESH_EXPIRES_IN,
        issuer: 'derlg-api',
        audience: 'derlg-client',
      } as jwt.SignOptions);
      return token;
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokenPair(user: User): TokenPair {
    // Add timestamp to ensure tokens are unique even if generated quickly
    const payload: JWTPayload = {
      userId: user.id,
      userType: user.user_type,
      email: user.email,
    };

    const accessToken = this.generateAccessToken(payload);

    // Add a small delay to ensure different iat (issued at) timestamp
    // JWT uses seconds precision, so tokens generated in the same second would be identical
    const refreshToken = this.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET, {
        issuer: 'derlg-api',
        audience: 'derlg-client',
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        logger.error('Error verifying access token:', error);
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET, {
        issuer: 'derlg-api',
        audience: 'derlg-client',
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        logger.error('Error verifying refresh token:', error);
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Store refresh token in database
   */
  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      await User.update(
        { jwt_refresh_token: refreshToken },
        { where: { id: userId } }
      );
      logger.info(`Refresh token stored for user: ${userId}`);
    } catch (error) {
      logger.error('Error storing refresh token:', error);
      throw new Error('Failed to store refresh token');
    }
  }

  /**
   * Validate refresh token against database
   */
  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'jwt_refresh_token'],
      });

      if (!user) {
        return false;
      }

      return user.jwt_refresh_token === refreshToken;
    } catch (error) {
      logger.error('Error validating refresh token:', error);
      return false;
    }
  }

  /**
   * Refresh token rotation
   * Validates old refresh token and generates new token pair
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify the refresh token
      const decoded = this.verifyRefreshToken(refreshToken);

      // Validate token against database
      const isValid = await this.validateRefreshToken(decoded.userId, refreshToken);
      if (!isValid) {
        throw new Error('Invalid refresh token');
      }

      // Get user from database
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.is_active) {
        throw new Error('User account is inactive');
      }

      // Generate new token pair
      const newTokenPair = this.generateTokenPair(user);

      // Store new refresh token in database (rotation)
      await this.storeRefreshToken(user.id, newTokenPair.refreshToken);

      logger.info(`Tokens refreshed for user: ${user.id}`);

      return newTokenPair;
    } catch (error) {
      logger.error('Error refreshing tokens:', error);
      throw error;
    }
  }

  /**
   * Revoke refresh token (logout)
   */
  async revokeRefreshToken(userId: string): Promise<void> {
    try {
      await User.update(
        { jwt_refresh_token: null },
        { where: { id: userId } }
      );
      logger.info(`Refresh token revoked for user: ${userId}`);
    } catch (error) {
      logger.error('Error revoking refresh token:', error);
      throw new Error('Failed to revoke refresh token');
    }
  }

  /**
   * Revoke all refresh tokens for a user (e.g., password change)
   */
  async revokeAllTokens(userId: string): Promise<void> {
    try {
      await User.update(
        { jwt_refresh_token: null },
        { where: { id: userId } }
      );
      logger.info(`All tokens revoked for user: ${userId}`);
    } catch (error) {
      logger.error('Error revoking all tokens:', error);
      throw new Error('Failed to revoke all tokens');
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await User.update(
        { last_login: new Date() },
        { where: { id: userId } }
      );
    } catch (error) {
      logger.error('Error updating last login:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Generate password reset token
   * Returns a secure random token with 1-hour expiration
   */
  generatePasswordResetToken(): { token: string; expires: Date } {
    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiration
    return { token, expires };
  }

  /**
   * Store password reset token in database
   */
  async storePasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    try {
      await User.update(
        { 
          password_reset_token: token,
          password_reset_expires: expires
        },
        { where: { id: userId } }
      );
      logger.info(`Password reset token stored for user: ${userId}`);
    } catch (error) {
      logger.error('Error storing password reset token:', error);
      throw new Error('Failed to store password reset token');
    }
  }

  /**
   * Validate password reset token
   * Returns user if token is valid and not expired
   */
  async validatePasswordResetToken(token: string): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: {
          password_reset_token: token,
        },
      });

      if (!user) {
        return null;
      }

      // Check if token has expired
      if (!user.password_reset_expires || user.password_reset_expires < new Date()) {
        return null;
      }

      return user;
    } catch (error) {
      logger.error('Error validating password reset token:', error);
      return null;
    }
  }

  /**
   * Reset password using token
   * Validates token, updates password, and invalidates all tokens
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Validate token
      const user = await this.validatePasswordResetToken(token);
      if (!user) {
        return false;
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset token
      await User.update(
        {
          password_hash: hashedPassword,
          password_reset_token: null,
          password_reset_expires: null,
          jwt_refresh_token: null, // Invalidate all existing sessions
        },
        { where: { id: user.id } }
      );

      logger.info(`Password reset successful for user: ${user.id}`);
      return true;
    } catch (error) {
      logger.error('Error resetting password:', error);
      return false;
    }
  }

  /**
   * Clear password reset token
   */
  async clearPasswordResetToken(userId: string): Promise<void> {
    try {
      await User.update(
        {
          password_reset_token: null,
          password_reset_expires: null,
        },
        { where: { id: userId } }
      );
    } catch (error) {
      logger.error('Error clearing password reset token:', error);
      // Don't throw error, just log it
    }
  }
}

// Export singleton instance
export default new AuthService();
