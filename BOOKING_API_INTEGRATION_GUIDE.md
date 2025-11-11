# Booking API Integration Guide

**For Frontend & Mobile Developers**

This guide provides everything you need to integrate the booking creation endpoint into the frontend web app and mobile app.

---

## Quick Start

### Endpoint
```
POST /api/bookings
```

### Authentication
```
Authorization: Bearer <access_token>
```

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.derlg.com/api`

---

## Request Format

### TypeScript Interface
```typescript
interface CreateBookingRequest {
  hotel_id: string;           // UUID of the hotel
  room_id: string;            // UUID of the room
  check_in: string;           // Format: YYYY-MM-DD
  check_out: string;          // Format: YYYY-MM-DD
  guests: {
    adults: number;           // Minimum: 1
    children?: number;        // Optional, default: 0
  };
  guest_details: {
    name: string;             // 2-100 characters
    email: string;            // Valid email format
    phone: string;            // Valid phone number
    special_requests?: string; // Optional, max 500 characters
  };
  payment_method?: 'paypal' | 'bakong' | 'stripe'; // Optional, default: 'paypal'
  payment_type?: 'deposit' | 'milestone' | 'full'; // Optional, default: 'full'
}
```

### Example Request
```json
{
  "hotel_id": "c53ed7a6-cfe9-46a7-aafe-38cd2324f6e1",
  "room_id": "60782e94-2164-43c6-bd90-9dd336d16a7e",
  "check_in": "2025-10-24",
  "check_out": "2025-10-26",
  "guests": {
    "adults": 2,
    "children": 0
  },
  "guest_details": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+855123456789",
    "special_requests": "Late check-in please"
  },
  "payment_method": "paypal",
  "payment_type": "full"
}
```

---

## Response Format

### Success Response (201 Created)
```typescript
interface CreateBookingResponse {
  success: true;
  data: {
    booking: {
      id: string;
      booking_number: string;
      user_id: string;
      hotel_id: string;
      room_id: string;
      check_in: string;
      check_out: string;
      nights: number;
      guests: {
        adults: number;
        children: number;
      };
      guest_details: {
        name: string;
        email: string;
        phone: string;
        special_requests: string;
      };
      pricing: {
        room_rate: number;
        subtotal: number;
        discount: number;
        promo_code: string | null;
        student_discount: number;
        tax: number;
        total: number;
      };
      payment: {
        method: string;
        type: string;
        status: string;
        transactions: any[];
        escrow_status: string;
      };
      status: string;
      cancellation: null;
      calendar_event_id: string | null;
      created_at: string;
      updated_at: string;
      hotel: {
        id: string;
        name: string;
        location: object;
        contact: object;
        images: string[];
      };
      room: {
        id: string;
        room_type: string;
        capacity: number;
        price_per_night: string;
        images: string[];
      };
    };
    message: string;
  };
  message: string;
  timestamp: string;
}
```

### Error Response (4xx/5xx)
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}
```

---

## Error Codes

| Code | Status | Description | Action |
|------|--------|-------------|--------|
| AUTH_1003 | 401 | User not authenticated | Redirect to login |
| VAL_2001 | 400 | Validation error | Show error message |
| VAL_2002 | 400 | Missing required fields | Check form data |
| VAL_2003 | 400 | Invalid dates | Validate date selection |
| RES_3001 | 404 | Hotel/Room not found | Show error, go back |
| RES_3003 | 400 | Hotel/Room not available | Show error, select another |
| BOOK_4001 | 400 | Room not available for dates | Show error, select other dates |
| SYS_9001 | 500 | System error | Show generic error, retry |

---

## Frontend Implementation (React/Next.js)

### 1. API Client Function

```typescript
// lib/api/bookings.ts
import { getAccessToken } from '@/lib/auth';

export async function createBooking(data: CreateBookingRequest): Promise<CreateBookingResponse> {
  const token = getAccessToken();
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error.message);
  }
  
  return result;
}
```

### 2. Booking Form Component

```typescript
// components/BookingForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBooking } from '@/lib/api/bookings';

interface BookingFormProps {
  hotelId: string;
  roomId: string;
}

export function BookingForm({ hotelId, roomId }: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    check_in: '',
    check_out: '',
    adults: 1,
    children: 0,
    name: '',
    email: '',
    phone: '',
    special_requests: '',
    payment_method: 'paypal' as const,
    payment_type: 'full' as const,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await createBooking({
        hotel_id: hotelId,
        room_id: roomId,
        check_in: formData.check_in,
        check_out: formData.check_out,
        guests: {
          adults: formData.adults,
          children: formData.children,
        },
        guest_details: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          special_requests: formData.special_requests,
        },
        payment_method: formData.payment_method,
        payment_type: formData.payment_type,
      });
      
      // Redirect to booking confirmation page
      router.push(`/bookings/${response.data.booking.id}/confirm`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded">
          {error}
        </div>
      )}
      
      {/* Date Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="check_in" className="block text-sm font-medium">
            Check-in Date
          </label>
          <input
            type="date"
            id="check_in"
            value={formData.check_in}
            onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
            className="mt-1 block w-full rounded border-gray-300"
          />
        </div>
        
        <div>
          <label htmlFor="check_out" className="block text-sm font-medium">
            Check-out Date
          </label>
          <input
            type="date"
            id="check_out"
            value={formData.check_out}
            onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
            min={formData.check_in || new Date().toISOString().split('T')[0]}
            required
            className="mt-1 block w-full rounded border-gray-300"
          />
        </div>
      </div>
      
      {/* Guest Count */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="adults" className="block text-sm font-medium">
            Adults
          </label>
          <input
            type="number"
            id="adults"
            value={formData.adults}
            onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) })}
            min={1}
            required
            className="mt-1 block w-full rounded border-gray-300"
          />
        </div>
        
        <div>
          <label htmlFor="children" className="block text-sm font-medium">
            Children
          </label>
          <input
            type="number"
            id="children"
            value={formData.children}
            onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) })}
            min={0}
            className="mt-1 block w-full rounded border-gray-300"
          />
        </div>
      </div>
      
      {/* Guest Details */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          minLength={2}
          maxLength={100}
          className="mt-1 block w-full rounded border-gray-300"
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="mt-1 block w-full rounded border-gray-300"
        />
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          className="mt-1 block w-full rounded border-gray-300"
        />
      </div>
      
      <div>
        <label htmlFor="special_requests" className="block text-sm font-medium">
          Special Requests (Optional)
        </label>
        <textarea
          id="special_requests"
          value={formData.special_requests}
          onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
          maxLength={500}
          rows={3}
          className="mt-1 block w-full rounded border-gray-300"
        />
      </div>
      
      {/* Payment Options */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Payment Method
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="paypal"
              checked={formData.payment_method === 'paypal'}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
              className="mr-2"
            />
            PayPal
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="bakong"
              checked={formData.payment_method === 'bakong'}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
              className="mr-2"
            />
            Bakong (KHQR)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="stripe"
              checked={formData.payment_method === 'stripe'}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
              className="mr-2"
            />
            Credit Card (Stripe)
          </label>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Payment Type
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="full"
              checked={formData.payment_type === 'full'}
              onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as any })}
              className="mr-2"
            />
            Full Payment (5% discount)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="deposit"
              checked={formData.payment_type === 'deposit'}
              onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as any })}
              className="mr-2"
            />
            Deposit (50-70%)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="milestone"
              checked={formData.payment_type === 'milestone'}
              onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as any })}
              className="mr-2"
            />
            Milestone (50%/25%/25%)
          </label>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating Booking...' : 'Book Now'}
      </button>
    </form>
  );
}
```

---

## Mobile Implementation (Flutter)

### 1. API Client

```dart
// lib/services/booking_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class BookingService {
  final String baseUrl = 'http://localhost:5000/api';
  final storage = FlutterSecureStorage();
  
  Future<Map<String, dynamic>> createBooking(Map<String, dynamic> bookingData) async {
    final token = await storage.read(key: 'access_token');
    
    final response = await http.post(
      Uri.parse('$baseUrl/bookings'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(bookingData),
    );
    
    final result = jsonDecode(response.body);
    
    if (response.statusCode == 201) {
      return result['data']['booking'];
    } else {
      throw Exception(result['error']['message']);
    }
  }
}
```

### 2. Booking Screen

```dart
// lib/screens/booking_screen.dart
import 'package:flutter/material.dart';
import '../services/booking_service.dart';

class BookingScreen extends StatefulWidget {
  final String hotelId;
  final String roomId;
  
  const BookingScreen({
    required this.hotelId,
    required this.roomId,
  });
  
  @override
  _BookingScreenState createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _bookingService = BookingService();
  
  DateTime? _checkIn;
  DateTime? _checkOut;
  int _adults = 1;
  int _children = 0;
  String _name = '';
  String _email = '';
  String _phone = '';
  String _specialRequests = '';
  String _paymentMethod = 'paypal';
  String _paymentType = 'full';
  
  bool _loading = false;
  
  Future<void> _submitBooking() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _loading = true);
    
    try {
      final booking = await _bookingService.createBooking({
        'hotel_id': widget.hotelId,
        'room_id': widget.roomId,
        'check_in': _checkIn!.toIso8601String().split('T')[0],
        'check_out': _checkOut!.toIso8601String().split('T')[0],
        'guests': {
          'adults': _adults,
          'children': _children,
        },
        'guest_details': {
          'name': _name,
          'email': _email,
          'phone': _phone,
          'special_requests': _specialRequests,
        },
        'payment_method': _paymentMethod,
        'payment_type': _paymentType,
      });
      
      // Navigate to confirmation screen
      Navigator.pushNamed(
        context,
        '/booking-confirmation',
        arguments: booking,
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      setState(() => _loading = false);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Book Room')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: EdgeInsets.all(16),
          children: [
            // Date Selection
            ListTile(
              title: Text('Check-in Date'),
              subtitle: Text(_checkIn?.toString() ?? 'Select date'),
              onTap: () async {
                final date = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now(),
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(Duration(days: 365)),
                );
                if (date != null) setState(() => _checkIn = date);
              },
            ),
            
            ListTile(
              title: Text('Check-out Date'),
              subtitle: Text(_checkOut?.toString() ?? 'Select date'),
              onTap: () async {
                final date = await showDatePicker(
                  context: context,
                  initialDate: _checkIn ?? DateTime.now(),
                  firstDate: _checkIn ?? DateTime.now(),
                  lastDate: DateTime.now().add(Duration(days: 365)),
                );
                if (date != null) setState(() => _checkOut = date);
              },
            ),
            
            // Guest Count
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    decoration: InputDecoration(labelText: 'Adults'),
                    keyboardType: TextInputType.number,
                    initialValue: '1',
                    validator: (value) {
                      if (value == null || int.parse(value) < 1) {
                        return 'At least 1 adult required';
                      }
                      return null;
                    },
                    onChanged: (value) => _adults = int.parse(value),
                  ),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: TextFormField(
                    decoration: InputDecoration(labelText: 'Children'),
                    keyboardType: TextInputType.number,
                    initialValue: '0',
                    onChanged: (value) => _children = int.parse(value),
                  ),
                ),
              ],
            ),
            
            // Guest Details
            TextFormField(
              decoration: InputDecoration(labelText: 'Full Name'),
              validator: (value) {
                if (value == null || value.length < 2) {
                  return 'Name must be at least 2 characters';
                }
                return null;
              },
              onChanged: (value) => _name = value,
            ),
            
            TextFormField(
              decoration: InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
              validator: (value) {
                if (value == null || !value.contains('@')) {
                  return 'Invalid email';
                }
                return null;
              },
              onChanged: (value) => _email = value,
            ),
            
            TextFormField(
              decoration: InputDecoration(labelText: 'Phone'),
              keyboardType: TextInputType.phone,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Phone is required';
                }
                return null;
              },
              onChanged: (value) => _phone = value,
            ),
            
            TextFormField(
              decoration: InputDecoration(labelText: 'Special Requests (Optional)'),
              maxLines: 3,
              maxLength: 500,
              onChanged: (value) => _specialRequests = value,
            ),
            
            SizedBox(height: 24),
            
            ElevatedButton(
              onPressed: _loading ? null : _submitBooking,
              child: _loading
                  ? CircularProgressIndicator()
                  : Text('Book Now'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## Validation Rules

### Client-Side Validation

Implement these validations before sending the request:

1. **Check-in Date**
   - Must not be in the past
   - Format: YYYY-MM-DD

2. **Check-out Date**
   - Must be after check-in date
   - Format: YYYY-MM-DD

3. **Adults**
   - Minimum: 1
   - Type: Integer

4. **Children**
   - Minimum: 0
   - Type: Integer

5. **Guest Name**
   - Minimum length: 2 characters
   - Maximum length: 100 characters

6. **Guest Email**
   - Must be valid email format
   - Example: user@example.com

7. **Guest Phone**
   - Must be valid phone number
   - Example: +855123456789

8. **Special Requests**
   - Maximum length: 500 characters
   - Optional field

---

## Testing Checklist

### Frontend Testing
- [ ] Form validation works correctly
- [ ] Date picker prevents past dates
- [ ] Guest count validation enforced
- [ ] Email/phone format validation
- [ ] API call includes Authorization header
- [ ] Success response handled correctly
- [ ] Error responses displayed to user
- [ ] Loading state shown during API call
- [ ] Redirect to confirmation page on success

### Mobile Testing
- [ ] Form validation works correctly
- [ ] Date picker prevents past dates
- [ ] Guest count validation enforced
- [ ] Email/phone format validation
- [ ] API call includes Authorization header
- [ ] Success response handled correctly
- [ ] Error responses displayed to user
- [ ] Loading indicator shown during API call
- [ ] Navigation to confirmation screen on success

---

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Cause**: Missing or invalid JWT token  
**Solution**: Check if user is logged in, refresh token if expired

### Issue: 400 Validation Error
**Cause**: Invalid input data  
**Solution**: Check client-side validation, ensure all required fields are present

### Issue: 400 Room Not Available
**Cause**: Room is fully booked for selected dates  
**Solution**: Show error message, suggest alternative dates or rooms

### Issue: 404 Hotel/Room Not Found
**Cause**: Invalid hotel_id or room_id  
**Solution**: Verify IDs are correct, check if hotel/room still exists

### Issue: 500 System Error
**Cause**: Server error  
**Solution**: Show generic error message, suggest retry, log error for debugging

---

## Support

For questions or issues:
- Backend API Documentation: `backend/docs/BOOKING_API.md`
- Implementation Summary: `backend/TASK_19_SUMMARY.md`
- Synchronization Status: `TASK_19_SYNC_STATUS.md`

---

**Last Updated**: October 23, 2025  
**API Version**: 1.0  
**Status**: Production Ready
