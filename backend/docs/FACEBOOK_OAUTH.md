# Facebook OAuth Integration

This document describes the Facebook Login API integration for the DerLg Tourism Platform.

## Overview

The platform supports Facebook Login authentication, allowing users to register and login using their Facebook accounts. This provides a seamless authentication experience without requiring users to create new credentials.

## Architecture

### Components

1. **FacebookOAuthService** (`src/services/facebook-oauth.service.ts`)
   - Handles Facebook Login API interactions
   - Verifies Facebook access tokens
   - Exchanges authorization codes for access tokens
   - Retrieves user profile information

2. **AuthController** (`src/controllers/auth.controller.ts`)
   - `facebookAuth()` method handles Facebook authentication requests
   - Creates or updates user accounts based on Facebook profile
   - Generates JWT tokens for authenticated users

3. **Auth Routes** (`src/routes/auth.routes.ts`)
   - `POST /api/auth/social/facebook` endpoint
   - Validates request parameters

## Facebook Login Flow

### Client-Side Flow (Recommended)

```
1. User clicks "Login with Facebook" button
   ↓
2. Frontend initiates Facebook Login SDK
   ↓
3. User authenticates with Facebook
   ↓
4. Facebook returns access token to frontend
   ↓
5. Frontend sends access token to backend API
   ↓
6. Backend verifies token with Facebook Graph API
   ↓
7. Backend creates/updates user account
   ↓
8. Backend returns JWT tokens to frontend
```

### Server-Side Flow (Alternative)

```
1. User clicks "Login with Facebook" button
   ↓
2. Frontend redirects to Facebook authorization URL
   ↓
3. User authenticates with Facebook
   ↓
4. Facebook redirects back with authorization code
   ↓
5. Frontend sends code and redirectUri to backend API
   ↓
6. Backend exchanges code for access token
   ↓
7. Backend retrieves user profile
   ↓
8. Backend creates/updates user account
   ↓
9. Backend returns JWT tokens to frontend
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### Facebook App Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add "Facebook Login" product to your app
4. Configure OAuth settings:
   - Valid OAuth Redirect URIs: Add your callback URLs
   - For development: `http://localhost:3000/auth/facebook/callback`
   - For production: `https://derlg.com/auth/facebook/callback`
5. Copy your App ID and App Secret to `.env`

### Required Permissions

The integration requests the following Facebook permissions:
- `email` - User's email address
- `public_profile` - Basic profile information (name, profile picture)

## API Endpoint

### POST /api/auth/social/facebook

Authenticate a user with Facebook Login.

#### Request Body (Client-Side Flow)

```json
{
  "accessToken": "facebook_access_token_from_client"
}
```

#### Request Body (Server-Side Flow)

```json
{
  "code": "authorization_code_from_facebook",
  "redirectUri": "http://localhost:3000/auth/facebook/callback"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "user_type": "tourist",
      "profile_image": "https://graph.facebook.com/v18.0/user_id/picture",
      "language": "en",
      "currency": "USD",
      "email_verified": true,
      "is_active": true
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": "24h",
    "isNewUser": true
  }
}
```

#### Error Responses

**400 Bad Request** - Missing required parameters
```json
{
  "success": false,
  "error": {
    "code": "VAL_2002",
    "message": "Either accessToken or authorization code is required",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**401 Unauthorized** - Invalid Facebook token
```json
{
  "success": false,
  "error": {
    "code": "AUTH_1001",
    "message": "Failed to authenticate with Facebook",
    "details": "Invalid Facebook access token",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**403 Forbidden** - Account inactive
```json
{
  "success": false,
  "error": {
    "code": "AUTH_1004",
    "message": "Account is inactive",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## User Account Handling

### New User Creation

When a user authenticates with Facebook for the first time:
- A new user account is created with `user_type: 'tourist'`
- Email is marked as verified (Facebook provides verified emails)
- Profile image is set from Facebook profile picture
- No password is stored (OAuth-only account)
- Default language is set to English
- Default currency is set to USD

### Existing User Linking

If a user with the same email already exists:
- The Facebook ID is linked to the existing account
- Profile image is updated if not already set
- Email verification status is updated
- User can login with either Facebook or email/password

### Account Merging

The system automatically handles account merging:
1. User registers with email/password
2. Later, user logs in with Facebook using the same email
3. System links the Facebook account to existing user
4. User can now login with either method

## Frontend Integration

### React Example (using react-facebook-login)

```bash
npm install react-facebook-login
```

```jsx
import FacebookLogin from 'react-facebook-login';
import axios from 'axios';

function LoginPage() {
  const responseFacebook = async (response) => {
    if (response.accessToken) {
      try {
        const result = await axios.post('/api/auth/social/facebook', {
          accessToken: response.accessToken
        });
        
        // Store JWT tokens
        localStorage.setItem('accessToken', result.data.data.accessToken);
        localStorage.setItem('refreshToken', result.data.data.refreshToken);
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Facebook login failed:', error);
      }
    }
  };

  return (
    <FacebookLogin
      appId={process.env.REACT_APP_FACEBOOK_APP_ID}
      autoLoad={false}
      fields="name,email,picture"
      callback={responseFacebook}
      icon="fa-facebook"
    />
  );
}
```

### Next.js Example

```jsx
import { useEffect } from 'react';

function LoginPage() {
  useEffect(() => {
    // Load Facebook SDK
    window.fbAsyncInit = function() {
      FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };

    // Load SDK script
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  const handleFacebookLogin = () => {
    FB.login(function(response) {
      if (response.authResponse) {
        // Send access token to backend
        fetch('/api/auth/social/facebook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: response.authResponse.accessToken
          })
        })
        .then(res => res.json())
        .then(data => {
          // Store tokens and redirect
          localStorage.setItem('accessToken', data.data.accessToken);
          window.location.href = '/dashboard';
        });
      }
    }, {scope: 'public_profile,email'});
  };

  return (
    <button onClick={handleFacebookLogin}>
      Login with Facebook
    </button>
  );
}
```

## Testing

### Unit Tests

Test the Facebook OAuth service:

```bash
npm run test:facebook-oauth
```

### Integration Tests

Test the complete authentication flow:

```bash
# Start the server first
npm run dev

# In another terminal, run the integration test
npm run test:facebook-oauth-integration
```

### Manual Testing with cURL

1. Get a Facebook access token from the [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Test the endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/social/facebook \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "YOUR_FACEBOOK_ACCESS_TOKEN"
  }'
```

## Security Considerations

### Token Verification

- All Facebook access tokens are verified with Facebook's Graph API
- Tokens are validated to ensure they belong to our app
- Invalid or expired tokens are rejected

### Data Privacy

- Only essential user information is requested (email, name, profile picture)
- User data is stored securely in the database
- Passwords are never stored for OAuth users

### CSRF Protection

- State parameter can be used in server-side flow for CSRF protection
- Frontend should implement CSRF tokens for additional security

### Rate Limiting

- API endpoints are protected by rate limiting
- Prevents brute force attacks and abuse

## Troubleshooting

### Common Issues

**"Invalid Facebook access token"**
- Ensure the token is not expired
- Verify the token was generated for your app
- Check that FACEBOOK_APP_ID matches the token's app

**"Missing required user information from Facebook"**
- Ensure email permission is granted
- User must have a verified email on Facebook
- Check Facebook app permissions configuration

**"Failed to verify Facebook token"**
- Verify FACEBOOK_APP_ID and FACEBOOK_APP_SECRET are correct
- Check network connectivity to Facebook Graph API
- Review server logs for detailed error messages

### Debug Mode

Enable detailed logging by setting log level to 'debug' in your logger configuration.

## References

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
- [Facebook Login Best Practices](https://developers.facebook.com/docs/facebook-login/security/)
- [OAuth 2.0 Specification](https://oauth.net/2/)

## Related Documentation

- [Authentication System](./AUTHENTICATION.md)
- [Google OAuth Integration](./GOOGLE_OAUTH.md)
- [User Model](./USER_MODEL.md)
