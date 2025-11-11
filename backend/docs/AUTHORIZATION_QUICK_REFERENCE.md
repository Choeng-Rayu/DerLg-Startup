# Authorization Middleware - Quick Reference

## Import

```typescript
import { authenticate, authorize } from '../middleware/authenticate';
import { UserType } from '../models/User';
```

## Usage Patterns

### Super Admin Only
```typescript
router.post('/admin/hotels/:id/approve',
  authenticate,
  authorize([UserType.SUPER_ADMIN]),
  controller.approveHotel
);
```

### Admin Only
```typescript
router.put('/hotel/profile',
  authenticate,
  authorize([UserType.ADMIN]),
  controller.updateHotelProfile
);
```

### Tourist Only
```typescript
router.post('/bookings',
  authenticate,
  authorize([UserType.TOURIST]),
  controller.createBooking
);
```

### Admin OR Super Admin
```typescript
router.get('/bookings',
  authenticate,
  authorize([UserType.ADMIN, UserType.SUPER_ADMIN]),
  controller.getBookings
);
```

### All Authenticated Users
```typescript
router.get('/profile',
  authenticate,
  authorize([UserType.SUPER_ADMIN, UserType.ADMIN, UserType.TOURIST]),
  controller.getProfile
);
```

## Error Responses

### 401 Unauthorized
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

### 403 Forbidden
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

### Test Routes
- `GET /api/test/super-admin` - Super admin only
- `GET /api/test/admin` - Admin only
- `GET /api/test/tourist` - Tourist only
- `GET /api/test/admin-or-super` - Admin or super admin
- `GET /api/test/all-authenticated` - All authenticated
- `GET /api/test/public` - Public (no auth)

### Run Tests
```bash
npm run test:authorization
```

## Common Mistakes

❌ **Wrong**: Authorization before authentication
```typescript
router.get('/protected', authorize([...]), authenticate, handler);
```

✅ **Correct**: Authentication before authorization
```typescript
router.get('/protected', authenticate, authorize([...]), handler);
```

❌ **Wrong**: No authorization on protected route
```typescript
router.post('/admin-action', authenticate, handler);
```

✅ **Correct**: Explicit authorization
```typescript
router.post('/admin-action', authenticate, authorize([UserType.ADMIN]), handler);
```

## Role-Specific Logic in Controllers

```typescript
async getBookings(req: Request, res: Response) {
  let bookings;
  
  if (req.user!.user_type === UserType.ADMIN) {
    // Admin sees only their hotel's bookings
    bookings = await Booking.findAll({
      include: [{
        model: Hotel,
        where: { admin_id: req.user!.id }
      }]
    });
  } else if (req.user!.user_type === UserType.SUPER_ADMIN) {
    // Super admin sees all bookings
    bookings = await Booking.findAll();
  } else {
    // Tourist sees only their bookings
    bookings = await Booking.findAll({
      where: { user_id: req.user!.id }
    });
  }
  
  res.json({ success: true, data: bookings });
}
```

## Documentation

For complete documentation, see [AUTHORIZATION.md](./AUTHORIZATION.md)
