# Task 14: Role-Based Authorization Middleware - Implementation Summary

## Overview

Implemented role-based authorization middleware to enforce access control based on user roles (super_admin, admin, tourist) across the DerLg Tourism Platform API.

## What Was Implemented

### 1. Authorization Middleware ✅

**Location**: `backend/src/middleware/authenticate.ts`

The `authorize` middleware factory was already implemented in the authentication middleware file. It provides:

- **Role verification**: Checks if authenticated user has required role(s)
- **Multiple role support**: Accepts array of allowed roles
- **Proper error handling**: Returns 403 Forbidden for unauthorized access
- **Security logging**: Logs unauthorized access attempts with user details

**Key Features**:
```typescript
export const authorize = (allowedRoles: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check authentication
    if (!req.user) {
      res.status(401).json({ /* Unauthorized */ });
      return;
    }

    // Check role
    if (!allowedRoles.includes(req.user.user_type)) {
      logger.warn(`Authorization failed: User ${req.user.id}...`);
      res.status(403).json({ /* Forbidden */ });
      return;
    }

    next();
  };
};
```

### 2. Test Routes ✅

**Location**: `backend/src/routes/test.routes.ts`

Created comprehensive test routes demonstrating authorization patterns:

- `/api/test/super-admin` - Super admin only
- `/api/test/admin` - Admin only
- `/api/test/tourist` - Tourist only
- `/api/test/admin-or-super` - Multiple roles (admin OR super_admin)
- `/api/test/all-authenticated` - All authenticated users
- `/api/test/public` - Public access (no auth required)

### 3. Test Script ✅

**Location**: `backend/src/scripts/testAuthorization.ts`

Automated test script that:
- Creates test users with different roles (super_admin, admin, tourist)
- Generates JWT tokens for each user
- Tests access to protected routes with different roles
- Verifies proper 403 Forbidden responses for unauthorized access
- Verifies proper 401 Unauthorized for missing authentication
- Tests multiple role authorization
- Cleans up test data automatically

**Run with**: `npm run test:authorization`

### 4. Documentation ✅

**Location**: `backend/docs/AUTHORIZATION.md`

Comprehensive documentation covering:
- User roles and their permissions
- Authorization middleware usage and examples
- Implementation patterns (single role, multiple roles, all users)
- Security considerations
- Best practices
- Common patterns (role-specific filtering, conditional authorization)
- Testing instructions
- Requirements mapping

### 5. Route Integration ✅

**Location**: `backend/src/routes/index.ts`

Integrated test routes into main router for demonstration purposes.

## User Roles

### Super Admin (`super_admin`)
- Full system access
- User management
- Hotel approval
- Guide/driver management
- Event CRUD
- Platform-wide promo codes
- System configuration
- AI monitoring

### Admin (`admin`)
- Hotel profile management
- Room inventory management
- Booking management
- Customer messaging
- Hotel analytics
- Hotel-specific promo codes

### Tourist (`tourist`)
- Hotel/tour search
- Booking creation
- Payment processing
- AI recommendations
- Reviews and ratings
- Wishlist management
- Profile management

## Usage Examples

### Single Role Authorization
```typescript
router.post(
  '/admin-action',
  authenticate,
  authorize([UserType.ADMIN]),
  controller.adminAction
);
```

### Multiple Role Authorization
```typescript
router.get(
  '/bookings',
  authenticate,
  authorize([UserType.ADMIN, UserType.SUPER_ADMIN]),
  controller.getBookings
);
```

### All Authenticated Users
```typescript
router.get(
  '/profile',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.ADMIN, UserType.TOURIST]),
  controller.getProfile
);
```

## Error Responses

### 401 Unauthorized (No Authentication)
```json
{
  "success": false,
  "error": {
    "code": "AUTH_1003",
    "message": "Unauthorized - Authentication required",
    "timestamp": "2025-10-23T..."
  }
}
```

### 403 Forbidden (Insufficient Permissions)
```json
{
  "success": false,
  "error": {
    "code": "AUTH_1004",
    "message": "Forbidden - Insufficient permissions",
    "timestamp": "2025-10-23T..."
  }
}
```

## Testing

### Manual Testing with Test Routes

1. Start the server:
```bash
npm run dev
```

2. Get JWT tokens by logging in as different users

3. Test protected routes:
```bash
# Super admin route
curl -H "Authorization: Bearer <super_admin_token>" \
  http://localhost:3000/api/test/super-admin

# Admin route (should fail with tourist token)
curl -H "Authorization: Bearer <tourist_token>" \
  http://localhost:3000/api/test/admin
```

### Automated Testing

Run the test script:
```bash
npm run test:authorization
```

The script will:
- ✓ Create test users with different roles
- ✓ Generate JWT tokens
- ✓ Test super admin access to super admin route
- ✓ Test admin denied access to super admin route (403)
- ✓ Test tourist denied access to super admin route (403)
- ✓ Test admin access to admin route
- ✓ Test tourist denied access to admin route (403)
- ✓ Test tourist access to tourist route
- ✓ Test no token denied access (401)
- ✓ Test multiple role authorization
- ✓ Clean up test data

## Security Features

1. **Authentication Required**: Authorization middleware requires authentication first
2. **Role Verification**: Checks user role from database (not just JWT claims)
3. **Active User Check**: Inactive users are blocked at authentication level
4. **Audit Logging**: Logs all authorization failures with user details
5. **Consistent Error Responses**: Standard error format across all endpoints

## Requirements Satisfied

✅ **Requirement 32.2**: Role-Based Access with appropriate permissions
✅ **Requirement 32.5**: Enforce Role-Based Access for each user type
✅ **Requirement 34.1**: Super Admin full system access
✅ **Requirement 34.2**: Admin booking management and operational access
✅ **Requirement 34.3**: Tourist booking services and personal account access

## Files Created/Modified

### Created:
- `backend/src/routes/test.routes.ts` - Test routes for authorization
- `backend/src/scripts/testAuthorization.ts` - Automated test script
- `backend/docs/AUTHORIZATION.md` - Comprehensive documentation
- `backend/TASK_14_SUMMARY.md` - This summary

### Modified:
- `backend/src/routes/index.ts` - Added test routes
- `backend/package.json` - Added test:authorization script

### Existing (No Changes Needed):
- `backend/src/middleware/authenticate.ts` - Authorization middleware already implemented

## Next Steps

The authorization middleware is now ready to be applied to protected routes in subsequent tasks:

1. **Task 15-18**: Hotel and Room Management APIs
   - Apply `authorize([UserType.ADMIN])` to hotel management routes
   - Apply `authorize([UserType.SUPER_ADMIN])` to hotel approval routes

2. **Task 19-26**: Booking System and Payment Processing
   - Apply `authorize([UserType.TOURIST])` to booking creation
   - Apply `authorize([UserType.ADMIN, UserType.SUPER_ADMIN])` to booking management

3. **Task 67-76**: Super Admin Dashboard
   - Apply `authorize([UserType.SUPER_ADMIN])` to all admin routes

## Best Practices for Future Implementation

1. **Always use with authenticate middleware**:
   ```typescript
   router.post('/protected', authenticate, authorize([...]), handler);
   ```

2. **Be specific about allowed roles**:
   ```typescript
   // Good - explicit
   authorize([UserType.ADMIN])
   
   // Bad - too permissive
   authorize([UserType.SUPER_ADMIN, UserType.ADMIN, UserType.TOURIST])
   ```

3. **Document access requirements**:
   ```typescript
   /**
    * @access  Private (super_admin only)
    */
   ```

4. **Implement role-specific data filtering in controllers**:
   ```typescript
   if (req.user!.user_type === UserType.ADMIN) {
     // Filter to admin's hotel only
   }
   ```

## Conclusion

Task 14 is complete. The role-based authorization middleware is fully implemented, tested, and documented. The system now enforces proper access control based on user roles, satisfying all requirements for secure, role-based API access.
