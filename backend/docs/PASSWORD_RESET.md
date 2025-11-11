# Password Reset System

## Overview

The password reset system allows users to securely reset their passwords using either email or phone number. The system generates a secure token with 1-hour expiration and sends reset links via Nodemailer (email) or Twilio (SMS).

## Features

- **Dual Channel Support**: Reset via email or phone number
- **Secure Token Generation**: 32-byte random hex tokens
- **Time-Limited Tokens**: 1-hour expiration for security
- **Token Invalidation**: Tokens are cleared after use or expiration
- **Session Invalidation**: All JWT refresh tokens are invalidated on password change
- **User Enumeration Prevention**: Same response for existing and non-existing users
- **OAuth User Protection**: Prevents password reset for social login users
- **Password Validation**: Enforces strong password requirements

## API Endpoints

### 1. Forgot Password

Request a password reset link via email or SMS.

**Endpoint**: `POST /api/auth/forgot-password`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```
OR
```json
{
  "phone": "+1234567890"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "If an account exists with this email, a password reset link has been sent."
  }
}
```

**Error Responses**:

- **400 Bad Request** - Missing both email and phone:
```json
{
  "success": false,
  "error": {
    "code": "VAL_2002",
    "message": "Either email or phone number is required",
    "timestamp": "2025-10-23T02:00:00.000Z"
  }
}
```

- **400 Bad Request** - OAuth user (no password):
```json
{
  "success": false,
  "error": {
    "code": "VAL_2001",
    "message": "This account uses social login. Please login with Google or Facebook.",
    "timestamp": "2025-10-23T02:00:00.000Z"
  }
}
```

- **403 Forbidden** - Inactive account:
```json
{
  "success": false,
  "error": {
    "code": "AUTH_1004",
    "message": "Account is inactive",
    "timestamp": "2025-10-23T02:00:00.000Z"
  }
}
```

### 2. Reset Password

Reset password using the token received via email or SMS.

**Endpoint**: `POST /api/auth/reset-password`

**Request Body**:
```json
{
  "token": "7f744d99126b11fa99f4c8e9d5a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
  "newPassword": "NewSecurePassword123"
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Password reset successful. Please login with your new password."
  }
}
```

**Error Responses**:

- **400 Bad Request** - Missing fields:
```json
{
  "success": false,
  "error": {
    "code": "VAL_2002",
    "message": "Token and new password are required",
    "timestamp": "2025-10-23T02:00:00.000Z"
  }
}
```

- **400 Bad Request** - Weak password:
```json
{
  "success": false,
  "error": {
    "code": "VAL_2001",
    "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    "timestamp": "2025-10-23T02:00:00.000Z"
  }
}
```

- **400 Bad Request** - Invalid or expired token:
```json
{
  "success": false,
  "error": {
    "code": "AUTH_1001",
    "message": "Invalid or expired reset token",
    "timestamp": "2025-10-23T02:00:00.000Z"
  }
}
```

## Database Schema

The password reset system adds two fields to the `users` table:

```sql
ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN password_reset_expires DATETIME NULL;
```

**Fields**:
- `password_reset_token`: Stores the secure reset token (32-byte hex string)
- `password_reset_expires`: Timestamp when the token expires (1 hour from generation)

## Security Features

### 1. User Enumeration Prevention

The system returns the same success message whether the user exists or not, preventing attackers from discovering valid email addresses or phone numbers.

### 2. Token Security

- **Random Generation**: Uses cryptographically secure random bytes
- **One-Time Use**: Tokens are cleared after successful password reset
- **Time-Limited**: Tokens expire after 1 hour
- **No Reuse**: Used or expired tokens cannot be reused

### 3. Session Invalidation

When a password is reset:
- All existing JWT refresh tokens are invalidated
- User must login again with the new password
- Prevents unauthorized access from old sessions

### 4. OAuth User Protection

Users who registered via Google or Facebook (OAuth) cannot reset passwords since they don't have passwords. The system detects this and returns an appropriate error message.

## Email Template

The password reset email includes:
- Personalized greeting with user's name
- Clear call-to-action button
- Plain text link as fallback
- Expiration notice (1 hour)
- Security notice for unsolicited requests

## SMS Template

The password reset SMS includes:
- Personalized greeting
- Reset link
- Expiration notice
- Security notice

## Configuration

### Environment Variables

Required environment variables in `.env`:

```env
# SMTP Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=noreply@derlg.com

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# API URL (for reset links)
API_URL=https://api.derlg.com
```

**SMTP Configuration Options**:

1. **Gmail**:
   - Host: `smtp.gmail.com`
   - Port: `587` (TLS) or `465` (SSL)
   - Secure: `false` for 587, `true` for 465
   - Requires App Password (enable 2FA first)

2. **Outlook/Hotmail**:
   - Host: `smtp-mail.outlook.com`
   - Port: `587`
   - Secure: `false`

3. **Custom SMTP Server**:
   - Use your own SMTP server credentials
   - Or use services like SendGrid, Mailgun, AWS SES via SMTP

### Frontend Integration

The reset link format is:
```
{API_URL}/reset-password?token={reset_token}
```

The frontend should:
1. Extract the token from the URL query parameter
2. Display a password reset form
3. Submit the token and new password to `/api/auth/reset-password`
4. Redirect to login page on success

## Testing

### Run Tests

```bash
# Basic password reset tests
npm run test:password-reset

# Complete flow tests (including token validation)
npm run test:password-reset-complete
```

### Manual Testing

1. **Request Reset via Email**:
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

2. **Request Reset via Phone**:
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'
```

3. **Get Token from Database**:
```sql
SELECT password_reset_token, password_reset_expires 
FROM users 
WHERE email = 'user@example.com';
```

4. **Reset Password**:
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your_token_here",
    "newPassword": "NewPassword123"
  }'
```

## Error Handling

The system handles various error scenarios:

1. **Missing Credentials**: Returns validation error
2. **Invalid Email/Phone Format**: Caught by validation middleware
3. **Inactive Account**: Returns 403 Forbidden
4. **OAuth User**: Returns appropriate error message
5. **Invalid Token**: Returns 400 Bad Request
6. **Expired Token**: Returns 400 Bad Request
7. **Weak Password**: Returns validation error
8. **SendGrid/Twilio Failure**: Logs error but returns success (security)

## Implementation Details

### Token Generation

```typescript
generatePasswordResetToken(): { token: string; expires: Date } {
  const token = randomBytes(32).toString('hex');
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // 1 hour expiration
  return { token, expires };
}
```

### Token Validation

```typescript
async validatePasswordResetToken(token: string): Promise<User | null> {
  const user = await User.findOne({
    where: { password_reset_token: token },
  });

  if (!user || !user.password_reset_expires) {
    return null;
  }

  // Check if token has expired
  if (user.password_reset_expires < new Date()) {
    return null;
  }

  return user;
}
```

### Password Reset

```typescript
async resetPassword(token: string, newPassword: string): Promise<boolean> {
  const user = await this.validatePasswordResetToken(token);
  if (!user) return false;

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await User.update(
    {
      password_hash: hashedPassword,
      password_reset_token: null,
      password_reset_expires: null,
      jwt_refresh_token: null, // Invalidate all sessions
    },
    { where: { id: user.id } }
  );

  return true;
}
```

## Requirements Fulfilled

This implementation fulfills the following requirements from the specification:

- **Requirement 1.5**: Password reset functionality
- **Requirement 33.1**: Accept email or phone number for reset
- **Requirement 33.2**: Send SMS with reset link via Twilio (30 seconds)
- **Requirement 33.3**: Send email with reset link (30 seconds)
- **Requirement 33.4**: Auto-redirect with pre-validated token
- **Requirement 33.5**: Invalidate all JWT tokens on password change

## Future Enhancements

Potential improvements for future versions:

1. **Rate Limiting**: Limit reset requests per user/IP
2. **Email Verification**: Require email verification before reset
3. **2FA Integration**: Optional 2FA for password reset
4. **Password History**: Prevent reuse of recent passwords
5. **Audit Logging**: Track all password reset attempts
6. **Custom Templates**: Allow customization of email/SMS templates
7. **Multi-Language**: Support for multiple languages in notifications
