# Provider Status Management - Quick Start Guide

## Overview

This guide will help you quickly set up and test the provider status management system with real-time WebSocket updates.

## Prerequisites

- Backend server running (`npm run dev`)
- MySQL database connected
- Telegram bot configured (optional for webhook testing)
- At least one guide or driver in the database

## Quick Setup

### 1. Ensure WebSocket Service is Running

The WebSocket service is automatically initialized when the server starts. Check the logs:

```
Server is running on port 3000
WebSocket service: Initialized
```

### 2. Create Test Providers

Run the seed script to create test guides and drivers:

```bash
npm run seed:telegram
```

This creates:
- Test guide with Telegram ID: `123456789`
- Test driver with Telegram ID: `987654321`

## Testing Methods

### Method 1: Automated Test Suite (Recommended)

Run the comprehensive test suite:

```bash
npm run test:provider-status
```

This will:
1. ✅ Connect to WebSocket
2. ✅ Test guide status updates (available, unavailable, on_tour)
3. ✅ Test driver status updates (available, unavailable, on_trip)
4. ✅ Test getting provider status
5. ✅ Test error cases (invalid status, missing fields)
6. ✅ Monitor real-time WebSocket events

### Method 2: Manual Webhook Testing

#### Update Guide Status

```bash
# Mark guide as available
curl -X POST http://localhost:3000/api/webhook/telegram/status \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_user_id": "123456789",
    "telegram_username": "test_guide",
    "status": "available"
  }'

# Mark guide as unavailable
curl -X POST http://localhost:3000/api/webhook/telegram/status \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_user_id": "123456789",
    "telegram_username": "test_guide",
    "status": "unavailable"
  }'
```

#### Update Driver Status

```bash
# Mark driver as available
curl -X POST http://localhost:3000/api/webhook/telegram/status \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_user_id": "987654321",
    "telegram_username": "test_driver",
    "status": "available"
  }'

# Mark driver as on trip
curl -X POST http://localhost:3000/api/webhook/telegram/status \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_user_id": "987654321",
    "telegram_username": "test_driver",
    "status": "on_trip"
  }'
```

#### Get Provider Status

```bash
# Get guide status
curl http://localhost:3000/api/webhook/telegram/status/123456789

# Get driver status
curl http://localhost:3000/api/webhook/telegram/status/987654321
```

### Method 3: Telegram Bot Testing

If you have the Telegram bot configured:

1. Open Telegram and find your bot
2. Send `/start` to authenticate
3. Use the keyboard buttons:
   - Click "✅ Available" to mark as available
   - Click "❌ Busy" to mark as unavailable
   - Click "📊 Status" to check current status

## Monitoring Real-Time Updates

### Using Browser Console

Open your browser console and connect to WebSocket:

```javascript
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('provider:status:update', (data) => {
  console.log('Provider status updated:', data);
});

socket.on('booking:availability:update', (data) => {
  console.log('Booking availability updated:', data);
});
```

### Using Node.js Script

Create a simple monitoring script:

```javascript
// monitor.js
const io = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket');
});

socket.on('provider:status:update', (data) => {
  console.log('\n📡 Provider Status Update:');
  console.log(JSON.stringify(data, null, 2));
});

socket.on('booking:availability:update', (data) => {
  console.log('\n📡 Booking Availability Update:');
  console.log(JSON.stringify(data, null, 2));
});
```

Run it:
```bash
node monitor.js
```

## Expected Results

### Successful Status Update

**Request:**
```json
{
  "telegram_user_id": "123456789",
  "status": "available"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Guide status updated successfully",
    "provider_type": "guide",
    "provider_id": "uuid-here",
    "provider_name": "Test Guide",
    "new_status": "available",
    "telegram_user_id": "123456789",
    "telegram_username": "test_guide"
  }
}
```

**WebSocket Events Emitted:**

1. `provider:status:update`:
```json
{
  "provider_type": "guide",
  "provider_id": "uuid-here",
  "provider_name": "Test Guide",
  "telegram_user_id": "123456789",
  "telegram_username": "test_guide",
  "old_status": "unavailable",
  "new_status": "available",
  "timestamp": "2025-01-24T10:30:00.000Z"
}
```

2. `booking:availability:update`:
```json
{
  "provider_type": "guide",
  "provider_id": "uuid-here",
  "available": true,
  "timestamp": "2025-01-24T10:30:00.000Z"
}
```

## Common Issues

### Issue: WebSocket not connecting

**Solution:**
- Ensure server is running
- Check CORS configuration in `config/env.ts`
- Verify port is not blocked by firewall

### Issue: Provider not found

**Solution:**
- Run `npm run seed:telegram` to create test providers
- Verify Telegram user ID matches database

### Issue: Status update not broadcasting

**Solution:**
- Check WebSocket service initialization in logs
- Ensure admin dashboard is connected to WebSocket
- Verify JWT token is valid (if using authentication)

## Next Steps

1. **Frontend Integration**: Connect your admin dashboard to WebSocket
2. **Mobile App**: Implement Socket.io client in Flutter app
3. **Notifications**: Add push notifications for status changes
4. **Analytics**: Track status change patterns for insights

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhook/telegram/status` | Update provider status |
| GET | `/api/webhook/telegram/status/:id` | Get provider status |
| POST | `/api/webhook/telegram/booking` | Send booking notification |

## WebSocket Events Summary

| Event | Description | Payload |
|-------|-------------|---------|
| `provider:status:update` | Provider status changed | Provider details + status |
| `booking:availability:update` | Booking availability changed | Provider ID + availability |

## Support

For issues or questions:
- Check logs: `tail -f logs/app.log`
- Review documentation: `backend/docs/PROVIDER_STATUS_MANAGEMENT.md`
- Test with automated suite: `npm run test:provider-status`
