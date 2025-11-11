# Review API Documentation

## Overview

The Review API allows users to submit reviews and ratings for hotels after completing their bookings. Reviews include ratings for multiple aspects (overall, cleanliness, service, location, value) and text comments. The system automatically updates hotel average ratings when reviews are created, updated, or deleted.

## Endpoints

### 1. Create Review

Submit a review for a completed booking.

**Endpoint:** `POST /api/reviews`

**Authentication:** Required (Tourist)

**Request Body:**
```json
{
  "booking_id": "uuid",
  "ratings": {
    "overall": 4.5,
    "cleanliness": 5,
    "service": 4,
    "location": 4.5,
    "value": 4
  },
  "comment": "Great hotel! The staff was very friendly...",
  "images": ["url1", "url2"]
}
```

**Validation Rules:**
- `booking_id`: Required, must be a valid UUID
- `ratings`: Required object with all 5 rating fields
  - `overall`: Required, number between 1-5
  - `cleanliness`: Required, number between 1-5
  - `service`: Required, number between 1-5
  - `location`: Required, number between 1-5
  - `value`: Required, number between 1-5
- `comment`: Required, string between 10-5000 characters
- `images`: Optional array of image URLs

**Business Rules:**
- Booking must belong to the authenticated user
- Booking status must be "completed"
- User can only submit one review per booking
- Review is automatically marked as verified (is_verified: true)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "review": {
      "id": "uuid",
      "user_id": "uuid",
      "booking_id": "uuid",
      "hotel_id": "uuid",
      "ratings": {
        "overall": 4.5,
        "cleanliness": 5,
        "service": 4,
        "location": 4.5,
        "value": 4
      },
      "comment": "Great hotel!...",
      "sentiment": null,
      "images": [],
      "helpful_count": 0,
      "is_verified": true,
      "admin_response": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "average_rating": 4.4,
      "is_positive": true,
      "is_negative": false,
      "needs_attention": false
    }
  }
}
```

**Error Responses:**

400 - Missing Required Fields:
```json
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELDS",
    "message": "Booking ID, ratings, and comment are required"
  }
}
```

400 - Invalid Ratings:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_RATINGS",
    "message": "Rating for overall must be between 1 and 5"
  }
}
```

400 - Booking Not Completed:
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_NOT_COMPLETED",
    "message": "You can only review completed bookings"
  }
}
```

400 - Review Already Exists:
```json
{
  "success": false,
  "error": {
    "code": "REVIEW_ALREADY_EXISTS",
    "message": "You have already reviewed this booking"
  }
}
```

404 - Booking Not Found:
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "Booking not found or does not belong to you"
  }
}
```

---

### 2. Get Hotel Reviews

Retrieve all reviews for a specific hotel with pagination and sorting.

**Endpoint:** `GET /api/reviews/hotel/:hotelId`

**Authentication:** Not required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sortBy` (optional): Sort order
  - `recent` (default): Most recent first
  - `helpful`: Most helpful first
  - `rating_high`: Highest rating first
  - `rating_low`: Lowest rating first

**Example Request:**
```
GET /api/reviews/hotel/123e4567-e89b-12d3-a456-426614174000?page=1&limit=10&sortBy=recent
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": "uuid",
      "name": "Angkor Paradise Hotel",
      "average_rating": 4.5,
      "total_reviews": 127
    },
    "reviews": [
      {
        "id": "uuid",
        "ratings": {
          "overall": 4.5,
          "cleanliness": 5,
          "service": 4,
          "location": 4.5,
          "value": 4
        },
        "comment": "Great hotel!...",
        "sentiment": null,
        "images": [],
        "helpful_count": 5,
        "is_verified": true,
        "admin_response": null,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "user": {
          "id": "uuid",
          "first_name": "John",
          "last_name": "Doe",
          "profile_image": "url"
        },
        "average_rating": 4.4,
        "is_positive": true,
        "is_negative": false,
        "needs_attention": false
      }
    ],
    "ratingDistribution": {
      "counts": {
        "5": 50,
        "4": 40,
        "3": 20,
        "2": 10,
        "1": 7
      },
      "percentages": {
        "5": 39,
        "4": 31,
        "3": 16,
        "2": 8,
        "1": 6
      },
      "total": 127
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 127,
      "totalPages": 13,
      "hasNext": true,
      "hasPrev": false
    },
    "sortBy": "recent"
  }
}
```

**Error Responses:**

404 - Hotel Not Found:
```json
{
  "success": false,
  "error": {
    "code": "HOTEL_NOT_FOUND",
    "message": "Hotel not found"
  }
}
```

---

### 3. Get User's Reviews

Retrieve all reviews submitted by the authenticated user.

**Endpoint:** `GET /api/reviews/my-reviews`

**Authentication:** Required (Tourist)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Example Request:**
```
GET /api/reviews/my-reviews?page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "ratings": {
          "overall": 4.5,
          "cleanliness": 5,
          "service": 4,
          "location": 4.5,
          "value": 4
        },
        "comment": "Great hotel!...",
        "sentiment": null,
        "images": [],
        "helpful_count": 5,
        "is_verified": true,
        "admin_response": null,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "hotel": {
          "id": "uuid",
          "name": "Angkor Paradise Hotel",
          "images": ["url1", "url2"],
          "location": {
            "city": "Siem Reap",
            "province": "Siem Reap"
          }
        },
        "booking": {
          "id": "uuid",
          "booking_number": "BK-2024-001",
          "check_in": "2024-01-10",
          "check_out": "2024-01-12"
        },
        "average_rating": 4.4,
        "is_positive": true,
        "is_negative": false,
        "needs_attention": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### 4. Update Review

Update an existing review.

**Endpoint:** `PUT /api/reviews/:id`

**Authentication:** Required (Tourist - must be review owner)

**Request Body:**
```json
{
  "ratings": {
    "overall": 5,
    "cleanliness": 5,
    "service": 5,
    "location": 5,
    "value": 5
  },
  "comment": "Updated review text...",
  "images": ["url1", "url2"]
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "review": {
      "id": "uuid",
      "ratings": {
        "overall": 5,
        "cleanliness": 5,
        "service": 5,
        "location": 5,
        "value": 5
      },
      "comment": "Updated review text...",
      "images": ["url1", "url2"],
      "helpful_count": 5,
      "is_verified": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T11:00:00Z",
      "average_rating": 5.0,
      "is_positive": true,
      "is_negative": false,
      "needs_attention": false
    }
  }
}
```

**Error Responses:**

404 - Review Not Found:
```json
{
  "success": false,
  "error": {
    "code": "REVIEW_NOT_FOUND",
    "message": "Review not found or does not belong to you"
  }
}
```

---

### 5. Delete Review

Delete a review.

**Endpoint:** `DELETE /api/reviews/:id`

**Authentication:** Required (Tourist - must be review owner)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": null
}
```

**Error Responses:**

404 - Review Not Found:
```json
{
  "success": false,
  "error": {
    "code": "REVIEW_NOT_FOUND",
    "message": "Review not found or does not belong to you"
  }
}
```

---

### 6. Mark Review as Helpful

Increment the helpful count for a review.

**Endpoint:** `POST /api/reviews/:id/helpful`

**Authentication:** Not required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Review marked as helpful",
  "data": {
    "helpful_count": 6
  }
}
```

**Error Responses:**

404 - Review Not Found:
```json
{
  "success": false,
  "error": {
    "code": "REVIEW_NOT_FOUND",
    "message": "Review not found"
  }
}
```

---

## Features

### Automatic Hotel Rating Updates

When a review is created, updated, or deleted, the system automatically:
1. Recalculates the hotel's average rating based on all reviews
2. Updates the hotel's `average_rating` field (rounded to 1 decimal place)
3. Updates the hotel's `total_reviews` count

### Rating Distribution

The hotel reviews endpoint includes a rating distribution showing:
- Count of reviews for each star rating (1-5)
- Percentage of reviews for each star rating
- Total number of reviews

This helps users understand the overall sentiment and rating patterns.

### Review Verification

Reviews are automatically marked as verified (`is_verified: true`) when:
- The review is submitted for a completed booking
- The booking belongs to the authenticated user

This ensures all reviews are from actual guests.

### Sorting Options

Reviews can be sorted by:
- **Recent**: Most recent reviews first (default)
- **Helpful**: Reviews with most helpful votes first
- **Rating High**: Highest rated reviews first
- **Rating Low**: Lowest rated reviews first

### Review Metadata

Each review includes computed fields:
- `average_rating`: Average of all 5 rating categories
- `is_positive`: True if sentiment classification is positive
- `is_negative`: True if sentiment classification is negative
- `needs_attention`: True if sentiment score < 0.3 (extremely negative)

---

## Testing

Run the test script to verify all review endpoints:

```bash
npm run test:review
```

Add this script to `package.json`:
```json
{
  "scripts": {
    "test:review": "ts-node src/scripts/testReviewEndpoints.ts"
  }
}
```

---

## Requirements Covered

This implementation covers the following requirements:

- **Requirement 5.1**: Review submission enabled after booking completion
- **Requirement 5.2**: Store ratings (overall, cleanliness, service, location, value) and text comment
- **Requirement 5.3**: Calculate and display average rating for each hotel
- **Requirement 5.5**: Display reviews on hotel detail pages with sorting options

---

## Future Enhancements

The following features are planned for future implementation:

1. **AI Sentiment Analysis** (Requirement 5.4, 15.1-15.5):
   - Automatic sentiment classification (positive/neutral/negative)
   - Topic extraction from review text
   - Satisfaction scoring
   - Flagging extremely negative reviews

2. **Admin Response**:
   - Hotel admins can respond to reviews
   - Responses displayed alongside reviews

3. **Review Images**:
   - Upload and display review images
   - Image optimization and thumbnails

4. **Review Moderation**:
   - Flag inappropriate reviews
   - Admin approval workflow

5. **Review Helpfulness**:
   - Track which users marked reviews as helpful
   - Prevent duplicate helpful votes from same user
