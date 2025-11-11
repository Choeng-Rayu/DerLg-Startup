# Booking Flow Integration Guide

## Overview
This guide explains how to integrate the booking flow pages with the rest of the DerLg Tourism Platform frontend.

## Integration Points

### 1. Hotel Detail Page → Booking Page

The hotel detail page should link to the booking page with the following URL parameters:

```typescript
// Example from hotel detail page
const handleBookRoom = (roomId: string) => {
  const params = new URLSearchParams();
  params.append('hotelId', hotelId);
  params.append('roomId', roomId);
  
  // Optional: Include search parameters if available
  if (checkIn) params.append('checkIn', checkIn);
  if (checkOut) params.append('checkOut', checkOut);
  if (adults) params.append('adults', adults.toString());
  if (children) params.append('children', children.toString());
  
  router.push(`/booking?${params.toString()}`);
};
```

**Required Parameters:**
- `hotelId` - The hotel's unique identifier
- `roomId` - The room's unique identifier
- `checkIn` - Check-in date in YYYY-MM-DD format
- `checkOut` - Check-out date in YYYY-MM-DD format
- `adults` - Number of adult guests (default: 1)
- `children` - Number of child guests (default: 0)

### 2. Booking Page → Payment Gateway

After the user submits the booking form, the backend should return a payment URL:

```typescript
// Backend response
{
  success: true,
  data: {
    booking_id: "uuid-here",
    payment_url: "https://paypal.com/checkout/..." // or null for direct confirmation
  }
}
```

If `payment_url` is provided, redirect to the payment gateway:
```typescript
window.location.href = response.data.payment_url;
```

If `payment_url` is null, redirect to confirmation:
```typescript
router.push(`/booking/confirmation/${response.data.booking_id}`);
```

### 3. Payment Gateway → Confirmation Page

After payment is processed, the payment gateway should redirect back to:
```
https://derlg.com/booking/confirmation/{booking_id}
```

The confirmation page will fetch the booking details and display them.

### 4. Confirmation Page → Other Pages

The confirmation page provides links to:
- **View All Bookings**: `/bookings` (to be implemented in Task 50)
- **Homepage**: `/`
- **Support Email**: `support@derlg.com`

## Backend API Requirements

### 1. Hotel Details Endpoint
```
GET /api/hotels/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "hotel-uuid",
    "name": "Hotel Name",
    "description": "...",
    "location": { ... },
    "contact": { ... },
    "amenities": [...],
    "images": [...],
    "star_rating": 4,
    "average_rating": 4.5,
    "total_reviews": 120,
    "status": "active"
  }
}
```

### 2. Room Details Endpoint
```
GET /api/hotels/:hotelId/rooms/:roomId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "room-uuid",
    "hotel_id": "hotel-uuid",
    "room_type": "Deluxe Suite",
    "description": "...",
    "capacity": 2,
    "bed_type": "King",
    "size_sqm": 35,
    "price_per_night": 100,
    "discount_percentage": 10,
    "amenities": [...],
    "images": [...],
    "total_rooms": 5,
    "is_active": true
  }
}
```

### 3. Promo Code Validation Endpoint
```
POST /api/promo-codes/validate
```

**Request:**
```json
{
  "code": "SUMMER2024",
  "booking_amount": 500
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "discount": 50,
    "message": "Promo code applied successfully"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PROMO_CODE",
    "message": "This promo code is invalid or expired"
  }
}
```

### 4. Create Booking Endpoint
```
POST /api/bookings
```

**Request:**
```json
{
  "hotel_id": "hotel-uuid",
  "room_id": "room-uuid",
  "check_in": "2024-12-01",
  "check_out": "2024-12-05",
  "guests": {
    "adults": 2,
    "children": 1
  },
  "guest_details": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+855 12 345 678",
    "special_requests": "Early check-in please"
  },
  "payment_type": "full",
  "payment_method": "paypal",
  "promo_code": "SUMMER2024"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_id": "booking-uuid",
    "payment_url": "https://paypal.com/checkout/..."
  }
}
```

### 5. Get Booking Details Endpoint
```
GET /api/bookings/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "booking_number": "BK-2024-001234",
    "user_id": "user-uuid",
    "hotel_id": "hotel-uuid",
    "room_id": "room-uuid",
    "check_in": "2024-12-01",
    "check_out": "2024-12-05",
    "nights": 4,
    "guests": {
      "adults": 2,
      "children": 1
    },
    "guest_details": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+855 12 345 678",
      "special_requests": "Early check-in please"
    },
    "pricing": {
      "room_rate": 90,
      "subtotal": 360,
      "discount": 50,
      "promo_code": "SUMMER2024",
      "student_discount": 0,
      "tax": 31,
      "total": 341
    },
    "payment": {
      "method": "paypal",
      "type": "full",
      "status": "completed",
      "transactions": [...],
      "escrow_status": "held"
    },
    "status": "confirmed",
    "created_at": "2024-10-25T10:00:00Z",
    "updated_at": "2024-10-25T10:05:00Z"
  }
}
```

## Authentication Flow

### 1. Unauthenticated User
If a user tries to access the booking page without being logged in:

```typescript
const token = getAuthToken();
if (!token) {
  // Redirect to login with return URL
  router.push(`/login?redirect=/booking?hotelId=${hotelId}&roomId=${roomId}&...`);
  return;
}
```

### 2. Login Page
After successful login, redirect back to the booking page:

```typescript
const redirect = searchParams.get('redirect');
if (redirect) {
  router.push(redirect);
} else {
  router.push('/');
}
```

### 3. Token Management
The booking page uses the `getAuthToken()` function from `@/lib/api` to retrieve the JWT token from cookies and include it in API requests.

## Error Handling

### 1. Missing Parameters
If required URL parameters are missing:
```typescript
if (!hotelId || !roomId || !checkIn || !checkOut) {
  setError('Missing booking information');
  // Show error message with "Go Back" button
}
```

### 2. API Errors
If API requests fail:
```typescript
if (!response.success) {
  setError(response.error?.message || 'Failed to load data');
  // Show error message
}
```

### 3. Network Errors
If network requests fail:
```typescript
try {
  // API call
} catch (err) {
  setError(err instanceof Error ? err.message : 'Network error');
}
```

## Payment Gateway Integration

### Supported Payment Methods

1. **PayPal**
   - Redirect to PayPal checkout
   - Return URL: `/booking/confirmation/{booking_id}`
   - Cancel URL: `/booking?hotelId=...&error=payment_cancelled`

2. **Bakong (KHQR)**
   - Display QR code for scanning
   - Poll for payment confirmation
   - Redirect to confirmation on success

3. **Stripe**
   - Redirect to Stripe checkout
   - Return URL: `/booking/confirmation/{booking_id}`
   - Cancel URL: `/booking?hotelId=...&error=payment_cancelled`

### Payment Flow

```
User submits booking
    ↓
Backend creates booking (status: pending)
    ↓
Backend creates payment intent
    ↓
Backend returns payment_url
    ↓
Frontend redirects to payment gateway
    ↓
User completes payment
    ↓
Payment gateway processes payment
    ↓
Payment gateway sends webhook to backend
    ↓
Backend updates booking (status: confirmed)
    ↓
Payment gateway redirects to confirmation page
    ↓
Frontend displays confirmation
```

## Styling Guidelines

### Colors
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Gray**: Various shades for text and backgrounds

### Typography
- **Headings**: Font-bold, larger sizes
- **Body**: Font-normal, readable sizes
- **Labels**: Font-medium, smaller sizes

### Spacing
- **Container**: max-w-6xl, mx-auto, px-4
- **Sections**: space-y-6 or space-y-8
- **Cards**: p-6
- **Forms**: space-y-4

### Responsive Breakpoints
- **Mobile**: < 768px (single column)
- **Tablet**: 768px - 1024px (optimized layout)
- **Desktop**: > 1024px (two columns with sticky sidebar)

## Testing Checklist

### Unit Testing
- [ ] Test pricing calculations
- [ ] Test promo code validation
- [ ] Test form validation
- [ ] Test date calculations

### Integration Testing
- [ ] Test hotel detail → booking flow
- [ ] Test booking → payment gateway
- [ ] Test payment gateway → confirmation
- [ ] Test confirmation → other pages

### E2E Testing
- [ ] Complete booking flow (happy path)
- [ ] Booking with promo code
- [ ] Booking with each payment option
- [ ] Booking with each payment method
- [ ] Error scenarios

### Manual Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile devices
- [ ] Test on tablets

## Deployment Considerations

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.derlg.com
```

### Build Configuration
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start"
  }
}
```

### Static Generation
The booking pages are client-side rendered (use client directive) because they require:
- User authentication
- Dynamic data fetching
- Real-time updates
- Form submissions

## Monitoring & Analytics

### Track Events
1. **Booking Started**: User lands on booking page
2. **Payment Option Selected**: User selects payment type
3. **Promo Code Applied**: User applies promo code
4. **Booking Submitted**: User clicks "Pay" button
5. **Booking Confirmed**: User reaches confirmation page

### Error Tracking
1. **API Errors**: Track failed API requests
2. **Validation Errors**: Track form validation failures
3. **Payment Errors**: Track payment gateway errors
4. **Network Errors**: Track network failures

## Support & Maintenance

### Common Issues

1. **"Missing booking information" error**
   - Ensure all URL parameters are provided
   - Check URL encoding

2. **"Failed to fetch hotel details" error**
   - Verify backend API is running
   - Check hotel ID is valid
   - Verify API endpoint URL

3. **"Invalid promo code" error**
   - Check promo code exists in database
   - Verify promo code is not expired
   - Check usage limits

4. **Payment redirect not working**
   - Verify payment gateway configuration
   - Check return URLs are correct
   - Verify webhook endpoints

### Debugging Tips

1. **Check browser console** for JavaScript errors
2. **Check network tab** for API request/response
3. **Check authentication** token in cookies
4. **Check URL parameters** are correct
5. **Check backend logs** for API errors

## Next Steps

After implementing the booking flow, the next tasks are:

1. **Task 50**: Implement user profile and bookings page
   - View booking history
   - Modify bookings
   - Cancel bookings
   - Manage wishlist

2. **Task 51**: Implement AI chat assistant interface
   - Chat UI
   - Streaming responses
   - Recommendation display

3. **Task 52**: Implement tours and events pages
   - Tour listings
   - Event calendar
   - Tour/event booking

## Conclusion

The booking flow is now complete and ready for integration. Follow this guide to connect it with the hotel detail page and backend API. Test thoroughly before deploying to production.

For questions or issues, contact the development team or refer to the task summary documents.
