import axios from 'axios';
import config from '../config/env';
import logger from '../utils/logger';

/**
 * Facebook user profile interface
 */
export interface FacebookUserProfile {
  id: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

/**
 * FacebookOAuthService class
 * Handles Facebook Login API authentication
 */
class FacebookOAuthService {
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly graphApiUrl = 'https://graph.facebook.com/v18.0';

  constructor() {
    this.appId = config.FACEBOOK_APP_ID;
    this.appSecret = config.FACEBOOK_APP_SECRET;
  }

  /**
   * Verify Facebook access token and get user profile
   * @param accessToken - Facebook access token from client
   * @returns Facebook user profile
   */
  async verifyAccessToken(accessToken: string): Promise<FacebookUserProfile> {
    try {
      // First, verify the token is valid and belongs to our app
      const debugResponse = await axios.get(
        `${this.graphApiUrl}/debug_token`,
        {
          params: {
            input_token: accessToken,
            access_token: `${this.appId}|${this.appSecret}`,
          },
        }
      );

      const tokenData = debugResponse.data.data;

      // Verify token is valid
      if (!tokenData.is_valid) {
        throw new Error('Invalid Facebook access token');
      }

      // Verify token belongs to our app
      if (tokenData.app_id !== this.appId) {
        throw new Error('Access token does not belong to this application');
      }

      // Get user profile information
      const profileResponse = await axios.get(`${this.graphApiUrl}/me`, {
        params: {
          fields: 'id,email,name,first_name,last_name,picture',
          access_token: accessToken,
        },
      });

      const profile: FacebookUserProfile = profileResponse.data;

      // Validate required fields
      if (!profile.id || !profile.email) {
        throw new Error('Missing required user information from Facebook');
      }

      logger.info(`Facebook token verified for user: ${profile.email}`);

      return profile;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Facebook API error:', {
          message: error.message,
          response: error.response?.data,
        });
        throw new Error(
          error.response?.data?.error?.message || 'Failed to verify Facebook token'
        );
      }
      logger.error('Error verifying Facebook access token:', error);
      throw new Error('Failed to verify Facebook token');
    }
  }

  /**
   * Exchange authorization code for access token and get user profile
   * @param code - Authorization code from Facebook OAuth flow
   * @param redirectUri - Redirect URI used in the OAuth flow
   * @returns Facebook user profile
   */
  async getTokenFromCode(
    code: string,
    redirectUri: string
  ): Promise<FacebookUserProfile> {
    try {
      // Exchange authorization code for access token
      const tokenResponse = await axios.get(
        `${this.graphApiUrl}/oauth/access_token`,
        {
          params: {
            client_id: this.appId,
            client_secret: this.appSecret,
            redirect_uri: redirectUri,
            code,
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      if (!accessToken) {
        throw new Error('No access token received from Facebook');
      }

      // Get user profile using the access token
      const profile = await this.verifyAccessToken(accessToken);

      logger.info(
        `Facebook authorization code exchanged for user: ${profile.email}`
      );

      return profile;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Facebook token exchange error:', {
          message: error.message,
          response: error.response?.data,
        });
        throw new Error(
          error.response?.data?.error?.message ||
            'Failed to exchange authorization code'
        );
      }
      logger.error('Error exchanging Facebook authorization code:', error);
      throw new Error('Failed to exchange authorization code');
    }
  }

  /**
   * Generate Facebook OAuth authorization URL
   * @param redirectUri - Redirect URI for OAuth callback
   * @param state - Optional state parameter for CSRF protection
   * @returns Authorization URL
   */
  getAuthorizationUrl(redirectUri: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri,
      scope: 'email,public_profile',
      response_type: 'code',
    });

    if (state) {
      params.append('state', state);
    }

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }
}

// Export singleton instance
export default new FacebookOAuthService();
