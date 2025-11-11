# Hotel Admin Profile Management - Quick Start Guide

## Quick Reference

### Get Your Hotel Profile

```bash
curl -X GET http://localhost:5000/api/hotel/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Hotel Name

```bash
curl -X PUT http://localhost:5000/api/hotel/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Amazing Hotel"}'
```

### Update Contact Info

```bash
curl -X PUT http://localhost:5000/api/hotel/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "phone": "+855-23-123-456",
      "email": "info@myhotel.com",
      "website": "https://myhotel.com"
    }
  }'
```

### Update Amenities

```bash
curl -X PUT http://localhost:5000/api/hotel/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amenities": ["wifi", "parking", "pool", "gym", "restaurant"]
  }'
```

### Upload Images (Base64)

```bash
curl -X PUT http://localhost:5000/api/hotel/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "images": [
      "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    ]
  }'
```

## Common Validation Errors

### Name Too Short
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Hotel name must be between 2 and 255 characters"
  }
}
```

### Invalid Email
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Contact email must be valid"
  }
}
```

### Invalid Coordinates
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Latitude must be between -90 and 90"
  }
}
```

## Testing

Run the automated test suite:

```bash
npm run test:hotel-admin-profile
```

## Need Help?

See the full documentation: `docs/HOTEL_ADMIN_PROFILE.md`
