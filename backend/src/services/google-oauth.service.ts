import { OAuth2Client } from 'google-auth-library';
import config from '../config/env';
import logger from '../utils/logger';

/**
 * Google user profile interface
 */
export interface GoogleUserProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

/**
 * GoogleOAuthService class
 * Handles Google OAuth 2.0 authentication
 */
class GoogleOAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      config.GOOGLE_CLIENT_ID,
      config.GOOGLE_CLIENT_SECRET,
      config.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Verify Google ID token and extract user information
   * @param idToken - Google ID token from client
   * @returns Google user profile
   */
  async verifyIdToken(idToken: string): Promise<GoogleUserProfile> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: config.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error('Invalid token payload');
      }

      if (!payload.email || !payload.sub) {
        throw new Error('Missing required user information');
      }

      const profile: GoogleUserProfile = {
        id: payload.sub,
        email: payload.email,
        verified_email: payload.email_verified || false,
        name: payload.name || '',
        given_name: payload.given_name || '',
        family_name: payload.family_name || '',
        picture: payload.picture || '',
        locale: payload.locale || 'en',
      };

      logger.info(`Google token verified for user: ${profile.email}`);

      return profile;
    } catch (error) {
      logger.error('Error verifying Google ID token:', error);
      throw new Error('Failed to verify Google token');
    }
  }

  /**
   * Exchange authorization code for access token and get user profile
   * @param code - Authorization code from Google OAuth flow
   * @returns Google user profile
   */
  async getTokensFromCode(code: string): Promise<GoogleUserProfile> {
    try {
      // Exchange authorization code for tokens
      const { tokens } = await this.client.getToken(code);
      
      if (!tokens.id_token) {
        throw new Error('No ID token received from Google');
      }

      // Verify and extract user profile from ID token
      const profile = await this.verifyIdToken(tokens.id_token);

      logger.info(`Google authorization code exchanged for user: ${profile.email}`);

      return profile;
    } catch (error) {
      logger.error('Error exchanging Google authorization code:', error);
      throw new Error('Failed to exchange authorization code');
    }
  }

  /**
   * Generate Google OAuth authorization URL
   * @returns Authorization URL
   */
  getAuthorizationUrl(): string {
    const url = this.client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'consent',
    });

    return url;
  }
}

// Export singleton instance
export default new GoogleOAuthService();
