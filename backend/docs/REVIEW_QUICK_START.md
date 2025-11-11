# Review System - Quick Start Guide

## Overview

The review system allows tourists to submit reviews for completed bookings and view reviews for hotels. Reviews include 5-category ratings and text comments.

## Quick Test

### 1. Prerequisites

- Backend server running on `http://localhost:3000`
- A tourist account with a completed booking
- Authentication token

### 2. Create a Review

```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": "your-booking-uuid",
    "ratings": {
      "overall": 4.5,
      "cleanliness": 5,
      "service": 4,
      "location": 4.5,
      "value": 4
    },
    "comment": "Great hotel! The staff was very friendly and the room was clean.",
    "images": []
  }'
```

### 3. Get Hotel Reviews

```bash
curl http://localhost:3000/api/reviews/hotel/HOTEL_UUID?page=1&limit=10&sortBy=recent
```

### 4. Get My Reviews

```bash
curl http://localhost:3000/api/reviews/my-reviews \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Key Features

### ✅ Review Creation
- Only for completed bookings
- One review per booking
- Automatically verified
- Updates hotel rating

### ✅ Review Display
- Pagination support
- Multiple sort options
- Rating distribution
- User information

### ✅ Review Management
- Update your reviews
- Delete your reviews
- Mark reviews as helpful

## Validation Rules

### Ratings
- All 5 categories required
- Values: 1-5 (decimals allowed)
- Categories: overall, cleanliness, service, location, value

### Comment
- Minimum: 10 characters
- Maximum: 5000 characters
- Required field

### Booking
- Must be completed
- Must belong to you
- One review per booking

## Sort Options

- `recent` - Most recent first (default)
- `helpful` - Most helpful first
- `rating_high` - Highest rated first
- `rating_low` - Lowest rated first

## Response Format

### Success
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "review": { ... }
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Common Errors

### BOOKING_NOT_COMPLETED
- **Cause**: Trying to review a non-completed booking
- **Solution**: Wait for booking to be completed

### REVIEW_ALREADY_EXISTS
- **Cause**: Already reviewed this booking
- **Solution**: Update existing review instead

### INVALID_RATINGS
- **Cause**: Rating value outside 1-5 range
- **Solution**: Ensure all ratings are between 1 and 5

### BOOKING_NOT_FOUND
- **Cause**: Booking doesn't exist or doesn't belong to you
- **Solution**: Verify booking ID and ownership

## Testing

Run the automated test:

```bash
npm run test:review
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/reviews` | ✓ | Create review |
| GET | `/api/reviews/hotel/:hotelId` | ✗ | Get hotel reviews |
| GET | `/api/reviews/my-reviews` | ✓ | Get user's reviews |
| PUT | `/api/reviews/:id` | ✓ | Update review |
| DELETE | `/api/reviews/:id` | ✓ | Delete review |
| POST | `/api/reviews/:id/helpful` | ✗ | Mark as helpful |

## Next Steps

1. **Start Server**: `npm run dev`
2. **Run Tests**: `npm run test:review`
3. **Read Full Docs**: See `REVIEW_API.md`
4. **Integrate Frontend**: Use API endpoints in customer system

## Support

For detailed documentation, see:
- `backend/docs/REVIEW_API.md` - Complete API documentation
- `backend/TASK_29_SUMMARY.md` - Implementation details
- `backend/src/scripts/testReviewEndpoints.ts` - Test examples
