# Authentication System Documentation

## Overview

The DerLg Tourism Platform uses JWT (JSON Web Token) based authentication with refresh token rotation for secure user authentication and authorization.

## Architecture

### Components

1. **AuthService** (`src/services/auth.service.ts`) - Core authentication logic
2. **Authentication Middleware** (`src/middleware/authenticate.ts`) - Request authentication
3. **AuthController** (`src/controllers/auth.controller.ts`) - Authentication endpoints
4. **Auth Routes** (`src/routes/auth.routes.ts`) - API route definitions
5. **Validation Middleware** (`src/middleware/validate.ts`) - Input validation

## Token System

### Access Tokens
- **Expiration**: 24 hours
- **Purpose**: Authenticate API requests
- **Secret**: `JWT_SECRET` environment variable
- **Claims**: userId, userType, email, type, jti (unique ID), iat, exp, iss, aud

### Refresh Tokens
- **Expiration**: 30 days
- **Purpose**: Generate new access tokens
- **Secret**: `JWT_REFRESH_SECRET` environment variable
- **Storage**: Stored in database (User.jwt_refresh_token)
- **Rotation**: Automatically rotated on refresh

### Token Security Features

1. **Unique Token IDs (jti)**: Each token has a cryptographically random unique identifier
2. **Separate Secrets**: Access and refresh tokens use different secrets
3. **Token Rotation**: Refresh tokens are automatically rotated, invalidating old tokens
4. **Database Validation**: Refresh tokens are validated against database storage
5. **Issuer/Audience Claims**: Additional security through iss and aud claims

## API Endpoints

### POST /api/auth/login

Login user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "user_type": "tourist",
      "first_name": "John",
      "last_name": "Doe",
      "language": "en",
      "currency": "USD",
      "is_student": false,
      "email_verified": true,
      "is_active": true,
      "created_at": "2025-10-22T00:00:00.000Z",
      "updated_at": "2025-10-22T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

**Error Responses:**
- `400` - Validation error (missing email/password)
- `401` - Invalid credentials
- `403` - Account inactive

### POST /api/auth/refresh-token

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

**Error Responses:**
- `400` - Missing refresh token
- `401` - Invalid or expired refresh token

### POST /api/auth/logout

Logout user and revoke refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Error Responses:**
- `401` - Unauthorized (missing or invalid token)

### GET /api/auth/verify

Verify access token validity.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "valid": true
  }
}
```

**Error Responses:**
- `401` - Invalid or expired token

### GET /api/auth/me

Get current authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ }
  }
}
```

**Error Responses:**
- `401` - Unauthorized

## Authentication Middleware

### authenticate

Main authentication middleware that verifies JWT access tokens.

**Usage:**
```typescript
import { authenticate } from './middleware/authenticate';

router.get('/protected', authenticate, (req, res) => {
  // req.user is available here
  res.json({ user: req.user });
});
```

**Behavior:**
- Extracts Bearer token from Authorization header
- Verifies token signature and expiration
- Loads user from database
- Checks user active status
- Attaches user to `req.user`
- Attaches token payload to `req.token`

### authorize

Role-based authorization middleware factory.

**Usage:**
```typescript
import { authenticate, authorize } from './middleware/authenticate';
import { UserType } from './models/User';

// Only super admins can access
router.get('/admin', authenticate, authorize([UserType.SUPER_ADMIN]), handler);

// Admins and super admins can access
router.get('/manage', authenticate, authorize([UserType.ADMIN, UserType.SUPER_ADMIN]), handler);
```

### optionalAuthenticate

Optional authentication middleware for public endpoints that benefit from user context.

**Usage:**
```typescript
import { optionalAuthenticate } from './middleware/authenticate';

router.get('/public', optionalAuthenticate, (req, res) => {
  // req.user may or may not be present
  if (req.user) {
    // Personalized response
  } else {
    // Generic response
  }
});
```

### requireEmailVerification

Middleware to ensure user's email is verified.

**Usage:**
```typescript
import { authenticate, requireEmailVerification } from './middleware/authenticate';

router.post('/sensitive', authenticate, requireEmailVerification, handler);
```

## Error Codes

### Authentication Errors (AUTH_XXXX)

- `AUTH_1001` - Invalid credentials or no token provided
- `AUTH_1002` - Token expired or refresh failed
- `AUTH_1003` - Invalid token or user not found
- `AUTH_1004` - Account inactive or insufficient permissions
- `AUTH_1005` - Email verification required

### Validation Errors (VAL_XXXX)

- `VAL_2001` - Validation failed (with field details)
- `VAL_2002` - Required field missing

### System Errors (SYS_XXXX)

- `SYS_9001` - Internal server error

## Client Integration

### Login Flow

```typescript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123!'
  })
});

const { data } = await loginResponse.json();
const { accessToken, refreshToken, user } = data;

// 2. Store tokens securely
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 3. Use access token for authenticated requests
const response = await fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Token Refresh Flow

```typescript
// When access token expires (401 error)
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (response.ok) {
    const { data } = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  } else {
    // Refresh token expired, redirect to login
    window.location.href = '/login';
  }
}

// Automatic retry with token refresh
async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem('accessToken');
  
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  });

  // If 401, try refreshing token
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    
    // Retry with new token
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`
      }
    });
  }

  return response;
}
```

### Logout Flow

```typescript
async function logout() {
  const accessToken = localStorage.getItem('accessToken');
  
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  // Clear tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Redirect to login
  window.location.href = '/login';
}
```

## Security Best Practices

### Token Storage

**Web Applications:**
- Store tokens in HTTP-only cookies (recommended)
- Or use localStorage with XSS protection
- Never store in regular cookies accessible by JavaScript

**Mobile Applications:**
- Use secure storage (Keychain on iOS, Keystore on Android)
- Never store in plain text

### Token Transmission

- Always use HTTPS in production
- Send tokens in Authorization header: `Bearer <token>`
- Never send tokens in URL parameters

### Token Lifecycle

1. **Login**: Generate and store refresh token
2. **API Requests**: Use access token
3. **Token Expiry**: Refresh using refresh token
4. **Logout**: Revoke refresh token
5. **Password Change**: Revoke all tokens

### Additional Security

- Implement rate limiting on auth endpoints
- Log authentication attempts
- Monitor for suspicious activity
- Implement account lockout after failed attempts
- Use strong password requirements
- Enable two-factor authentication (future enhancement)

## Testing

Run the authentication test suite:

```bash
npm run test:auth
```

The test suite covers:
- Token generation (access & refresh)
- Token storage in database
- Token verification
- Token validation against database
- Token refresh with rotation
- Token revocation (logout)
- Last login tracking
- Invalid token handling
- Token expiration configuration

## Configuration

Required environment variables:

```env
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=30d
```

**Important**: Use strong, unique secrets in production. Generate using:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Troubleshooting

### "Invalid token" errors

- Check token format (should be `Bearer <token>`)
- Verify token hasn't expired
- Ensure correct JWT_SECRET is configured
- Check if user account is active

### "Token expired" errors

- Use refresh token to get new access token
- Check system time synchronization
- Verify token expiration configuration

### "User not found" errors

- User may have been deleted
- Check database connection
- Verify user ID in token payload

### Refresh token rotation issues

- Ensure database is properly storing tokens
- Check for concurrent refresh requests
- Verify refresh token hasn't been revoked

## Social Authentication

### Google OAuth 2.0

The platform supports Google OAuth 2.0 authentication. See [Google OAuth Documentation](./GOOGLE_OAUTH.md) for detailed information.

**Quick Start:**

```typescript
// Client-side flow
const response = await fetch('/api/auth/social/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken: googleIdToken })
});
```

**Features:**
- Sign in with Google account
- Automatic user creation
- Account linking for existing users
- Profile sync (name, email, picture)
- Email verification from Google

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Biometric authentication for mobile
- [ ] Session management dashboard
- [ ] Device tracking and management
- [ ] Suspicious activity detection
- [ ] IP-based access control
- [x] OAuth 2.0 integration - Google (✅ Completed)
- [ ] OAuth 2.0 integration - Facebook
- [ ] Password reset functionality
- [ ] Email verification system

## Related Documentation

- [User Model Documentation](./USER_MODEL.md)
- [Database Configuration](./DATABASE.md)
- [API Error Codes](./ERROR_CODES.md)
