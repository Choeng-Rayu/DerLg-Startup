import { Request, Response } from 'express';
import authService from '../services/auth.service';
import googleOAuthService from '../services/google-oauth.service';
import facebookOAuthService from '../services/facebook-oauth.service';
import emailService from '../services/email.service';
import smsService from '../services/sms.service';
import User, { UserType, Language, Currency } from '../models/User';
import logger from '../utils/logger';

/**
 * AuthController class
 * Handles authentication-related operations
 */
class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const {
        email,
        password,
        phone,
        first_name,
        last_name,
        user_type = 'tourist',
        language = 'en',
        currency = 'USD',
      } = req.body;

      // Validate required fields
      if (!email || !password || !first_name || !last_name) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VAL_2002',
            message: 'Email, password, first name, and last name are required',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        where: { email: email.toLowerCase().trim() },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          error: {
            code: 'RES_3002',
            message: 'User with this email already exists',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Check if phone number is provided and already exists
      if (phone) {
        const existingPhone = await User.findOne({
          where: { phone: phone.trim() },
        });

        if (existingPhone) {
          res.status(409).json({
            success: false,
            error: {
              code: 'RES_3002',
              message: 'User with this phone number already exists',
              timestamp: new Date(),
            },
          });
          return;
        }
      }

      // Validate user_type (only tourists can register via this endpoint)
      if (user_type !== 'tourist') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VAL_2001',
            message: 'Only tourists can register through this endpoint',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Create new user (password will be hashed by the model hook)
      const newUser = await User.create({
        email: email.toLowerCase().trim(),
        password_hash: password, // Will be hashed by beforeCreate hook
        phone: phone?.trim() || null,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        user_type: user_type as UserType,
        language,
        currency,
        is_active: true,
        email_verified: false,
        phone_verified: false,
      });

      // Generate token pair
      const { accessToken, refreshToken } = authService.generateTokenPair(newUser);

      // Store refresh token in database
      await authService.storeRefreshToken(newUser.id, refreshToken);

      // Update last login
      await authService.updateLastLogin(newUser.id);

      logger.info(`New user registered: ${newUser.id} (${newUser.email})`);

      res.status(201).json({
        success: true,
        data: {
          user: newUser.toSafeObject(),
          accessToken,
          refreshToken,
          expiresIn: '24h',
        },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SYS_9001',
          message: 'Internal server error during registration',
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * Login user with email and password
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VAL_2002',
            message: 'Email and password are required',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Find user by email
      const user = await User.findOne({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_1001',
            message: 'Invalid credentials',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Check if user is active
      if (!user.is_active) {
        res.status(403).json({
          success: false,
          error: {
            code: 'AUTH_1004',
            message: 'Account is inactive',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_1001',
            message: 'Invalid credentials',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Generate token pair
      const { accessToken, refreshToken } = authService.generateTokenPair(user);

      // Store refresh token in database
      await authService.storeRefreshToken(user.id, refreshToken);

      // Update last login
      await authService.updateLastLogin(user.id);

      logger.info(`User logged in: ${user.id} (${user.email})`);

      res.status(200).json({
        success: true,
        data: {
          user: user.toSafeObject(),
          accessToken,
          refreshToken,
          expiresIn: '24h',
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SYS_9001',
          message: 'Internal server error during login',
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * Refresh access token using refresh token
   * POST /api/auth/refresh-token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VAL_2002',
            message: 'Refresh token is required',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Refresh tokens (includes rotation)
      const newTokenPair = await authService.refreshTokens(refreshToken);

      logger.info('Tokens refreshed successfully');

      res.status(200).json({
        success: true,
        data: {
          accessToken: newTokenPair.accessToken,
          refreshToken: newTokenPair.refreshToken,
          expiresIn: '24h',
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      
      logger.error('Refresh token error:', error);

      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_1002',
          message: errorMessage,
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * Logout user (revoke refresh token)
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // User should be authenticated via middleware
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_1003',
            message: 'Unauthorized',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Revoke refresh token
      await authService.revokeRefreshToken(req.user.id);

      logger.info(`User logged out: ${req.user.id}`);

      res.status(200).json({
        success: true,
        data: {
          message: 'Logged out successfully',
        },
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SYS_9001',
          message: 'Internal server error during logout',
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * Verify access token
   * GET /api/auth/verify
   */
  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      // User should be authenticated via middleware
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_1003',
            message: 'Unauthorized',
            timestamp: new Date(),
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: req.user.toSafeObject(),
          valid: true,
        },
      });
    } catch (error) {
      logger.error('Token verification error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SYS_9001',
          message: 'Internal server error during token verification',
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_1003',
            message: 'Unauthorized',
            timestamp: new Date(),
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: req.user.toSafeObject(),
        },
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SYS_9001',
          message: 'Internal server error',
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * Google OAuth 2.0 authentication
   * POST /api/auth/social/google
   * 
   * Accepts either:
   * - idToken: Google ID token from client-side OAuth flow
   * - code: Authorization code from server-side OAuth flow
   */
  async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      const { idToken, code } = req.body;

      // Validate that either idToken or code is provided
      if (!idToken && !code) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VAL_2002',
            message: 'Either idToken or authorization code is required',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Get Google user profile
      let googleProfile;
      try {
        if (idToken) {
          // Verify ID token (client-side flow)
          googleProfile = await googleOAuthService.verifyIdToken(idToken);
        } else {
          // Exchange authorization code (server-side flow)
          googleProfile = await googleOAuthService.getTokensFromCode(code);
        }
      } catch (error) {
        logger.error('Google OAuth error:', error);
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_1001',
            message: 'Failed to authenticate with Google',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Check if user exists with this Google ID
      let user = await User.findOne({
        where: { google_id: googleProfile.id },
      });

      // If not found by Google ID, check by email
      if (!user) {
        user = await User.findOne({
          where: { email: googleProfile.email.toLowerCase().trim() },
        });

        // If user exists with email but no Google ID, link the account
        if (user) {
          await user.update({
            google_id: googleProfile.id,
            email_verified: googleProfile.verified_email,
            profile_image: googleProfile.picture || user.profile_image,
          });
          logger.info(`Google account linked to existing user: ${user.id}`);
        }
      }

      // If user doesn't exist, create new user
      if (!user) {
        // Determine language from Google locale
        let userLanguage: Language = Language.ENGLISH;
        if (googleProfile.locale?.startsWith('km')) {
          userLanguage = Language.KHMER;
        } else if (googleProfile.locale?.startsWith('zh')) {
          userLanguage = Language.CHINESE;
        }

        user = await User.create({
          email: googleProfile.email.toLowerCase().trim(),
          google_id: googleProfile.id,
          first_name: googleProfile.given_name || googleProfile.name.split(' ')[0] || 'User',
          last_name: googleProfile.family_name || googleProfile.name.split(' ').slice(1).join(' ') || '',
          profile_image: googleProfile.picture || null,
          user_type: UserType.TOURIST,
          language: userLanguage,
          currency: Currency.USD,
          email_verified: googleProfile.verified_email,
          is_active: true,
          password_hash: null, // No password for OAuth users
        });

        logger.info(`New user created via Google OAuth: ${user.id} (${user.email})`);
      } else {
        // Check if user is active
        if (!user.is_active) {
          res.status(403).json({
            success: false,
            error: {
              code: 'AUTH_1004',
              message: 'Account is inactive',
              timestamp: new Date(),
            },
          });
          return;
        }

        logger.info(`User logged in via Google OAuth: ${user.id} (${user.email})`);
      }

      // Generate token pair
      const { accessToken, refreshToken } = authService.generateTokenPair(user);

      // Store refresh token in database
      await authService.storeRefreshToken(user.id, refreshToken);

      // Update last login
      await authService.updateLastLogin(user.id);

      res.status(200).json({
        success: true,
        data: {
          user: user.toSafeObject(),
          accessToken,
          refreshToken,
          expiresIn: '24h',
          isNewUser: !user.last_login,
        },
      });
    } catch (error) {
      logger.error('Google OAuth authentication error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SYS_9001',
          message: 'Internal server error during Google authentication',
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * Facebook Login authentication
   * POST /api/auth/social/facebook
   * 
   * Accepts either:
   * - accessToken: Facebook access token from client-side OAuth flow
   * - code: Authorization code from server-side OAuth flow (requires redirectUri)
   */
  async facebookAuth(req: Request, res: Response): Promise<void> {
    try {
      const { accessToken, code, redirectUri } = req.body;

      // Validate that either accessToken or code is provided
      if (!accessToken && !code) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VAL_2002',
            message: 'Either accessToken or authorization code is required',
            timestamp: new Date(),
          },
        });
        return;
      }

      // If code is provided, redirectUri is required
      if (code && !redirectUri) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VAL_2002',
            message: 'redirectUri is required when using authorization code',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Get Facebook user profile
      let facebookProfile;
      try {
        if (accessToken) {
          // Verify access token (client-side flow)
          facebookProfile = await facebookOAuthService.verifyAccessToken(accessToken);
        } else {
          // Exchange authorization code (server-side flow)
          facebookProfile = await facebookOAuthService.getTokenFromCode(code, redirectUri);
        }
      } catch (error) {
        logger.error('Facebook OAuth error:', error);
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_1001',
            message: 'Failed to authenticate with Facebook',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Check if user exists with this Facebook ID
      let user = await User.findOne({
        where: { facebook_id: facebookProfile.id },
      });

      // If not found by Facebook ID, check by email
      if (!user) {
        user = await User.findOne({
          where: { email: facebookProfile.email.toLowerCase().trim() },
        });

        // If user exists with email but no Facebook ID, link the account
        if (user) {
          await user.update({
            facebook_id: facebookProfile.id,
            email_verified: true, // Facebook provides verified emails
            profile_image: facebookProfile.picture?.data?.url || user.profile_image,
          });
          logger.info(`Facebook account linked to existing user: ${user.id}`);
        }
      }

      // If user doesn't exist, create new user
      if (!user) {
        user = await User.create({
          email: facebookProfile.email.toLowerCase().trim(),
          facebook_id: facebookProfile.id,
          first_name: facebookProfile.first_name || facebookProfile.name.split(' ')[0] || 'User',
          last_name: facebookProfile.last_name || facebookProfile.name.split(' ').slice(1).join(' ') || '',
          profile_image: facebookProfile.picture?.data?.url || null,
          user_type: UserType.TOURIST,
          language: Language.ENGLISH, // Default to English for Facebook users
          currency: Currency.USD,
          email_verified: true, // Facebook provides verified emails
          is_active: true,
          password_hash: null, // No password for OAuth users
        });

        logger.info(`New user created via Facebook OAuth: ${user.id} (${user.email})`);
      } else {
        // Check if user is active
        if (!user.is_active) {
          res.status(403).json({
            success: false,
            error: {
              code: 'AUTH_1004',
              message: 'Account is inactive',
              timestamp: new Date(),
            },
          });
          return;
        }

        logger.info(`User logged in via Facebook OAuth: ${user.id} (${user.email})`);
      }

      // Generate token pair
      const { accessToken: jwtAccessToken, refreshToken: jwtRefreshToken } = 
        authService.generateTokenPair(user);

      // Store refresh token in database
      await authService.storeRefreshToken(user.id, jwtRefreshToken);

      // Update last login
      await authService.updateLastLogin(user.id);

      res.status(200).json({
        success: true,
        data: {
          user: user.toSafeObject(),
          accessToken: jwtAccessToken,
          refreshToken: jwtRefreshToken,
          expiresIn: '24h',
          isNewUser: !user.last_login,
        },
      });
    } catch (error) {
      logger.error('Facebook OAuth authentication error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SYS_9001',
          message: 'Internal server error during Facebook authentication',
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * Forgot password - send reset link via email or SMS
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, phone } = req.body;

      // Validate that either email or phone is provided
      if (!email && !phone) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VAL_2002',
            message: 'Either email or phone number is required',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Find user by email or phone
      let user: User | null = null;
      if (email) {
        user = await User.findOne({
          where: { email: email.toLowerCase().trim() },
        });
      } else if (phone) {
        user = await User.findOne({
          where: { phone: phone.trim() },
        });
      }

      // Always return success to prevent user enumeration
      // But only send reset link if user exists
      if (user) {
        // Check if user is active
        if (!user.is_active) {
          res.status(403).json({
            success: false,
            error: {
              code: 'AUTH_1004',
              message: 'Account is inactive',
              timestamp: new Date(),
            },
          });
          return;
        }

        // Check if user has a password (OAuth users don't have passwords)
        if (!user.password_hash) {
          res.status(400).json({
            success: false,
            error: {
              code: 'VAL_2001',
              message: 'This account uses social login. Please login with Google or Facebook.',
              timestamp: new Date(),
            },
          });
          return;
        }

        // Generate reset token
        const { token, expires } = authService.generatePasswordResetToken();

        // Store token in database
        await authService.storePasswordResetToken(user.id, token, expires);

        // Send reset link via email or SMS
        if (email && user.email) {
          await emailService.sendPasswordResetEmail(
            user.email,
            token,
            user.getFullName()
          );
          logger.info(`Password reset email sent to: ${user.email}`);
        } else if (phone && user.phone) {
          await smsService.sendPasswordResetSMS(
            user.phone,
            token,
            user.getFullName()
          );
          logger.info(`Password reset SMS sent to: ${user.phone}`);
        }
      }

      // Always return success message
      res.status(200).json({
        success: true,
        data: {
          message: email
            ? 'If an account exists with this email, a password reset link has been sent.'
            : 'If an account exists with this phone number, a password reset link has been sent.',
        },
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SYS_9001',
          message: 'Internal server error during password reset request',
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * Reset password using token
   * POST /api/auth/reset-password
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      // Validate input
      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VAL_2002',
            message: 'Token and new password are required',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Validate password requirements
      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VAL_2001',
            message: 'Password must be at least 8 characters long',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Validate password complexity
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);

      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VAL_2001',
            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            timestamp: new Date(),
          },
        });
        return;
      }

      // Reset password
      const success = await authService.resetPassword(token, newPassword);

      if (!success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'AUTH_1001',
            message: 'Invalid or expired reset token',
            timestamp: new Date(),
          },
        });
        return;
      }

      logger.info('Password reset successful');

      res.status(200).json({
        success: true,
        data: {
          message: 'Password reset successful. Please login with your new password.',
        },
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SYS_9001',
          message: 'Internal server error during password reset',
          timestamp: new Date(),
        },
      });
    }
  }
}

export default new AuthController();
