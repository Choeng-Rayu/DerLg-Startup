# Role-Based Authorization Middleware

## Overview

The DerLg Tourism Platform implements role-based access control (RBAC) to ensure that users can only access features and resources appropriate to their role. The authorization system is built on top of JWT authentication and provides fine-grained access control.

## User Roles

The platform supports three distinct user roles:

### 1. Super Admin (`super_admin`)
- **Full system access** including:
  - User management (create, update, deactivate users)
  - Hotel approval and management
  - Guide and driver creation and management
  - Event CRUD operations
  - Platform-wide promo code management
  - System configuration
  - AI system monitoring
  - Platform analytics and reports

### 2. Admin (`admin`)
- **Hotel management access** including:
  - Hotel profile management
  - Room inventory management
  - Booking management (approve, reject, complete)
  - Customer messaging
  - Hotel-specific analytics and reports
  - Hotel-specific promo codes

### 3. Tourist (`tourist`)
- **Customer features** including:
  - Hotel and tour search
  - Booking creation and management
  - Payment processing
  - AI recommendations and chat
  - Reviews and ratings
  - Wishlist management
  - Profile management

## Authorization Middleware

### `authorize(allowedRoles: UserType[])`

The `authorize` middleware factory creates middleware that checks if the authenticated user has one of the allowed roles.

**Location**: `backend/src/middleware/authenticate.ts`

**Usage**:
```typescript
import { authenticate, authorize } from '../middleware/authenticate';
import { UserType } from '../models/User';

// Single role
router.get('/admin-only', 
  authenticate, 
  authorize([UserType.ADMIN]), 
  controller.adminOnlyAction
);

// Multiple roles
router.get('/admin-or-super', 
  authenticate, 
  authorize([UserType.ADMIN, UserType.SUPER_ADMIN]), 
  controller.adminOrSuperAction
);
```

**Parameters**:
- `allowedRoles`: Array of `UserType` enum values that are permitted to access the route

**Behavior**:
1. Checks if `req.user` exists (requires `authenticate` middleware first)
2. Verifies if `req.user.user_type` is in the `allowedRoles` array
3. Returns `403 Forbidden` if user doesn't have required role
4. Calls `next()` if authorization succeeds

**Error Responses**:

```typescript
// 401 Unauthorized - No authentication
{
  success: false,
  error: {
    code: 'AUTH_1003',
    message: 'Unauthorized - Authentication required',
    timestamp: '2025-10-23T...'
  }
}

// 403 Forbidden - Insufficient permissions
{
  success: false,
  error: {
    code: 'AUTH_1004',
    message: 'Forbidden - Insufficient permissions',
    timestamp: '2025-10-23T...'
  }
}
```

## Implementation Examples

### Example 1: Super Admin Only Route

```typescript
/**
 * @route   POST /api/admin/hotels/:id/approve
 * @desc    Approve a pending hotel registration
 * @access  Private (super_admin only)
 */
router.post(
  '/hotels/:id/approve',
  authenticate,
  authorize([UserType.SUPER_ADMIN]),
  hotelController.approveHotel
);
```

### Example 2: Admin or Super Admin Route

```typescript
/**
 * @route   GET /api/bookings
 * @desc    Get all bookings (filtered by role)
 * @access  Private (admin or super_admin)
 */
router.get(
  '/bookings',
  authenticate,
  authorize([UserType.ADMIN, UserType.SUPER_ADMIN]),
  bookingController.getBookings
);
```

### Example 3: Tourist Only Route

```typescript
/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private (tourist only)
 */
router.post(
  '/bookings',
  authenticate,
  authorize([UserType.TOURIST]),
  bookingController.createBooking
);
```

### Example 4: All Authenticated Users

```typescript
/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (all authenticated users)
 */
router.get(
  '/me',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.ADMIN, UserType.TOURIST]),
  authController.getCurrentUser
);
```

## Middleware Chain Order

The authorization middleware must be used **after** the authentication middleware:

```typescript
// ✅ Correct order
router.get('/protected', authenticate, authorize([UserType.ADMIN]), handler);

// ❌ Wrong order - authorize won't have req.user
router.get('/protected', authorize([UserType.ADMIN]), authenticate, handler);
```

## Testing Authorization

### Test Routes

Test routes are available at `/api/test/*` to demonstrate authorization:

```bash
# Super admin only
GET /api/test/super-admin

# Admin only
GET /api/test/admin

# Tourist only
GET /api/test/tourist

# Admin or super admin
GET /api/test/admin-or-super

# All authenticated users
GET /api/test/all-authenticated

# Public (no auth required)
GET /api/test/public
```

### Test Script

Run the authorization test script:

```bash
# Start the server first
npm run dev

# In another terminal, run the test
npx ts-node src/scripts/testAuthorization.ts
```

The test script will:
1. Create test users with different roles
2. Generate JWT tokens for each user
3. Test access to protected routes
4. Verify proper authorization enforcement
5. Clean up test data

## Best Practices

### 1. Always Use with Authentication

```typescript
// ✅ Good
router.post('/admin-action', authenticate, authorize([UserType.ADMIN]), handler);

// ❌ Bad - no authentication check
router.post('/admin-action', authorize([UserType.ADMIN]), handler);
```

### 2. Use Specific Roles

```typescript
// ✅ Good - explicit about who can access
router.get('/hotels', authenticate, authorize([UserType.ADMIN]), handler);

// ❌ Bad - too permissive
router.get('/hotels', authenticate, handler);
```

### 3. Document Access Requirements

```typescript
/**
 * @route   DELETE /api/hotels/:id
 * @desc    Delete a hotel (super admin only)
 * @access  Private (super_admin)
 */
router.delete(
  '/hotels/:id',
  authenticate,
  authorize([UserType.SUPER_ADMIN]),
  hotelController.deleteHotel
);
```

### 4. Log Authorization Failures

The middleware automatically logs authorization failures with user details:

```typescript
logger.warn(
  `Authorization failed: User ${req.user.id} (${req.user.user_type}) ` +
  `attempted to access resource requiring roles: ${allowedRoles.join(', ')}`
);
```

## Security Considerations

### 1. Token Verification

The `authenticate` middleware verifies JWT tokens before authorization:
- Checks token signature
- Validates expiration
- Ensures user exists and is active

### 2. Role Verification

The `authorize` middleware checks the user's role from the database:
- Uses `req.user.user_type` from authenticated user
- Compares against allowed roles
- Logs unauthorized access attempts

### 3. Inactive Users

Users with `is_active: false` are blocked at the authentication level:

```typescript
if (!user.is_active) {
  res.status(403).json({
    success: false,
    error: {
      code: 'AUTH_1004',
      message: 'User account is inactive',
      timestamp: new Date(),
    },
  });
  return;
}
```

## Common Patterns

### Pattern 1: Role-Specific Data Filtering

```typescript
router.get('/bookings', authenticate, authorize([UserType.ADMIN, UserType.SUPER_ADMIN]), 
  async (req, res) => {
    let bookings;
    
    if (req.user!.user_type === UserType.ADMIN) {
      // Admin sees only their hotel's bookings
      bookings = await Booking.findAll({
        include: [{
          model: Hotel,
          where: { admin_id: req.user!.id }
        }]
      });
    } else {
      // Super admin sees all bookings
      bookings = await Booking.findAll();
    }
    
    res.json({ success: true, data: bookings });
  }
);
```

### Pattern 2: Conditional Authorization

```typescript
router.put('/bookings/:id', authenticate, async (req, res) => {
  const booking = await Booking.findByPk(req.params.id);
  
  // Tourists can only modify their own bookings
  if (req.user!.user_type === UserType.TOURIST && 
      booking.user_id !== req.user!.id) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'AUTH_1004',
        message: 'Cannot modify another user\'s booking',
        timestamp: new Date()
      }
    });
  }
  
  // Proceed with update
  // ...
});
```

### Pattern 3: Multiple Authorization Levels

```typescript
// Level 1: Any authenticated user can view
router.get('/hotels/:id', authenticate, hotelController.getHotel);

// Level 2: Admin can update their hotel
router.put('/hotels/:id', 
  authenticate, 
  authorize([UserType.ADMIN]), 
  hotelController.updateHotel
);

// Level 3: Super admin can approve/reject
router.post('/hotels/:id/approve', 
  authenticate, 
  authorize([UserType.SUPER_ADMIN]), 
  hotelController.approveHotel
);
```

## Related Documentation

- [Authentication](./AUTHENTICATION.md) - JWT authentication system
- [User Model](./USER_MODEL.md) - User schema and roles
- [API Documentation](../API_DOCUMENTATION.md) - Complete API reference

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 32.2**: Tourists access without login shows only home page, requires login for booking
- **Requirement 32.5**: Role-Based Access enforces appropriate permissions for each user type
- **Requirement 34.1**: Super Admin has full system access
- **Requirement 34.2**: Admin has booking management and operational access
- **Requirement 34.3**: Tourist has booking services and personal account access
