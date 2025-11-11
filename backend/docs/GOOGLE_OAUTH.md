# Google OAuth 2.0 Integration

This document describes the Google OAuth 2.0 authentication implementation for the DerLg Tourism Platform.

## Overview

The platform supports Google OAuth 2.0 authentication, allowing users to sign in using their Google accounts. This provides a seamless authentication experience without requiring users to create and remember separate credentials.

## Features

- **Sign in with Google**: Users can authenticate using their Google account
- **Account Creation**: New users are automatically created when signing in with Google for the first time
- **Account Linking**: Existing users can link their Google account to their platform account
- **Profile Sync**: User profile information (name, email, profile picture) is synced from Google
- **Email Verification**: Google-verified emails are automatically marked as verified
- **Dual Flow Support**: Supports both client-side (ID token) and server-side (authorization code) OAuth flows

## Architecture

### Components

1. **GoogleOAuthService** (`src/services/google-oauth.service.ts`)
   - Handles Google OAuth token verification
   - Exchanges authorization codes for access tokens
   - Extracts user profile information

2. **AuthController** (`src/controllers/auth.controller.ts`)
   - `googleAuth()` method handles Google OAuth requests
   - Creates or updates user accounts
   - Generates JWT tokens for authenticated users

3. **Auth Routes** (`src/routes/auth.routes.ts`)
   - `POST /api/auth/social/google` endpoint for Google authentication

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/social/google/callback
```

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** or **Google Identity Services**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen:
   - Add application name, logo, and support email
   - Add authorized domains (e.g., `derlg.com`)
   - Add scopes: `userinfo.email`, `userinfo.profile`
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:3000`, `https://derlg.com`
   - Authorized redirect URIs: `http://localhost:5000/api/auth/social/google/callback`, `https://api.derlg.com/api/auth/social/google/callback`
7. Copy the **Client ID** and **Client Secret** to your `.env` file

## API Endpoint

### POST /api/auth/social/google

Authenticate a user using Google OAuth 2.0.

#### Request Body

The endpoint accepts either an ID token (client-side flow) or authorization code (server-side flow):

**Option 1: Client-side flow (ID Token)**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Option 2: Server-side flow (Authorization Code)**
```json
{
  "code": "4/0AY0e-g7X..."
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@gmail.com",
      "first_name": "John",
      "last_name": "Doe",
      "user_type": "tourist",
      "profile_image": "https://lh3.googleusercontent.com/...",
      "language": "en",
      "currency": "USD",
      "email_verified": true,
      "is_active": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "expiresIn": "24h",
    "isNewUser": true
  }
}
```

#### Error Responses

**400 Bad Request** - Missing credentials
```json
{
  "success": false,
  "error": {
    "code": "VAL_2002",
    "message": "Either idToken or authorization code is required",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**401 Unauthorized** - Invalid token/code
```json
{
  "success": false,
  "error": {
    "code": "AUTH_1001",
    "message": "Failed to authenticate with Google",
    "details": "Invalid token",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**403 Forbidden** - Inactive account
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

## Implementation Flows

### Client-Side Flow (Recommended for Web/Mobile)

This flow is recommended for single-page applications and mobile apps.

#### Frontend Implementation

```javascript
// 1. Initialize Google Sign-In
const googleSignIn = async () => {
  try {
    // Use Google Sign-In library to get ID token
    const response = await google.accounts.id.prompt();
    const idToken = response.credential;

    // 2. Send ID token to backend
    const result = await fetch('http://localhost:5000/api/auth/social/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    const data = await result.json();

    if (data.success) {
      // 3. Store tokens and redirect
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      
      // Redirect to dashboard or home
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Google Sign-In failed:', error);
  }
};
```

#### HTML Setup

```html
<!-- Load Google Sign-In library -->
<script src="https://accounts.google.com/gsi/client" async defer></script>

<!-- Google Sign-In button -->
<div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID"
     data-callback="handleCredentialResponse">
</div>
<div class="g_id_signin" data-type="standard"></div>

<script>
function handleCredentialResponse(response) {
  // Send ID token to backend
  fetch('http://localhost:5000/api/auth/social/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: response.credential })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      window.location.href = '/dashboard';
    }
  });
}
</script>
```

### Server-Side Flow (Alternative)

This flow is useful when you need more control over the OAuth process.

#### Step 1: Redirect to Google

```javascript
// Backend generates authorization URL
app.get('/auth/google', (req, res) => {
  const authUrl = googleOAuthService.getAuthorizationUrl();
  res.redirect(authUrl);
});
```

#### Step 2: Handle Callback

```javascript
// Google redirects back with authorization code
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  
  // Exchange code for tokens via your API
  const response = await fetch('http://localhost:5000/api/auth/social/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Set tokens in cookies or redirect with tokens
    res.cookie('accessToken', data.data.accessToken, { httpOnly: true });
    res.redirect('/dashboard');
  }
});
```

## User Account Behavior

### New User Registration

When a user signs in with Google for the first time:

1. A new user account is created with:
   - `email`: From Google profile
   - `google_id`: Google user ID
   - `first_name`: From Google profile
   - `last_name`: From Google profile
   - `profile_image`: Google profile picture URL
   - `user_type`: Set to `tourist`
   - `email_verified`: Set to `true` (Google-verified)
   - `password_hash`: Set to `null` (no password needed)
   - `language`: Detected from Google locale (en/km/zh)
   - `currency`: Default to `USD`

2. JWT tokens are generated and returned
3. `isNewUser: true` is included in the response

### Existing User Login

When a user with an existing account signs in with Google:

1. User is found by `google_id` or `email`
2. If found by email but no `google_id`, the Google account is linked
3. Profile information is updated (profile picture if changed)
4. JWT tokens are generated and returned
5. `isNewUser: false` is included in the response

### Account Linking

If a user has an existing account with email/password and signs in with Google:

1. The system finds the user by email
2. The `google_id` is added to the existing account
3. The user can now sign in using either method:
   - Email/password (traditional)
   - Google OAuth

## Security Considerations

### Token Verification

- All Google ID tokens are verified using Google's public keys
- Token audience is validated against the configured Client ID
- Expired tokens are rejected

### Account Protection

- Inactive accounts cannot sign in via Google OAuth
- Email verification status is synced from Google
- Refresh tokens are rotated on each use

### Data Privacy

- Only necessary profile information is requested from Google
- Profile pictures are stored as URLs (not downloaded)
- No sensitive Google data is stored

## Testing

### Manual Testing

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Run the test script:
   ```bash
   npm run test:google-oauth
   ```

3. Test with a real Google account:
   - Use the Google Sign-In button in your frontend
   - Or use Postman/curl with a valid ID token

### Test Scenarios

1. **New User Registration**
   - Sign in with a Google account that doesn't exist in the system
   - Verify new user is created with correct information
   - Verify JWT tokens are returned

2. **Existing User Login**
   - Sign in with a Google account that already exists
   - Verify user is authenticated successfully
   - Verify tokens are returned

3. **Account Linking**
   - Create a user with email/password
   - Sign in with Google using the same email
   - Verify Google account is linked
   - Verify user can sign in with both methods

4. **Inactive Account**
   - Deactivate a user account
   - Try to sign in with Google
   - Verify authentication is rejected

5. **Invalid Token**
   - Send an invalid ID token
   - Verify error response is returned

### Example cURL Commands

**Test with ID token:**
```bash
curl -X POST http://localhost:5000/api/auth/social/google \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your-google-id-token"}'
```

**Test with authorization code:**
```bash
curl -X POST http://localhost:5000/api/auth/social/google \
  -H "Content-Type: application/json" \
  -d '{"code": "your-authorization-code"}'
```

## Troubleshooting

### Common Issues

1. **"Failed to verify Google token"**
   - Check that `GOOGLE_CLIENT_ID` is correctly set in `.env`
   - Verify the ID token is not expired
   - Ensure the token was issued for your Client ID

2. **"Invalid token payload"**
   - The ID token may be malformed
   - Try generating a new token

3. **"Missing required user information"**
   - Google profile may not have email or ID
   - Check Google account settings

4. **"Account is inactive"**
   - The user account has been deactivated
   - Contact support to reactivate

### Debug Logging

Enable debug logging to troubleshoot issues:

```typescript
// In src/services/google-oauth.service.ts
logger.info('Google token verified for user:', profile.email);
logger.error('Error verifying Google ID token:', error);
```

Check logs in the console when running the server.

## Requirements Mapping

This implementation satisfies the following requirements:

- **Requirement 32.3**: Multi-role authentication with Google OAuth support
- **Requirement 35.1**: Google OAuth 2.0 for secure authentication
- **Requirement 35.3**: Create/update user account with social information

## Next Steps

1. Implement Facebook Login integration (Task 12)
2. Add password reset functionality (Task 13)
3. Implement role-based authorization middleware (Task 14)
4. Add email verification for non-OAuth users
5. Implement account deletion and data export

## References

- [Google Identity Platform](https://developers.google.com/identity)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web)
- [OAuth 2.0 Documentation](https://oauth.net/2/)
- [google-auth-library npm package](https://www.npmjs.com/package/google-auth-library)
