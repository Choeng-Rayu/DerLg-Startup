# Provider Status Management & Real-Time Updates

## Overview

The Provider Status Management system enables tour guides and transportation providers to update their availability status through Telegram bot commands or webhook calls. Status changes are immediately broadcast to the admin dashboard via WebSocket for real-time monitoring and booking availability updates.

## Architecture

```
┌─────────────────┐
│  Telegram Bot   │
│  (Guide/Driver) │
└────────┬────────┘
         │ /available or /busy
         ▼
┌─────────────────────────────────────┐
│  Telegram Bot Service               │
│  - Update database status           │
│  - Broadcast via WebSocket          │
└────────┬────────────────────────────┘
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Database   │ │  WebSocket   │ │  Webhook     │
│   (MySQL)    │ │   Service    │ │  Endpoint    │
└──────────────┘ └──────┬───────┘ └──────────────┘
                        │
                        ▼
                ┌──────────────────┐
                │ Admin Dashboard  │
                │ (Real-time UI)   │
                └──────────────────┘
```

## Components

### 1. WebSocket Service (`websocket.service.ts`)

Manages real-time communication between the backend and admin dashboard.

**Key Features:**
- JWT authentication for WebSocket connections
- Room-based communication (admin dashboard room)
- Broadcast provider status updates
- Broadcast booking availability changes

**Events Emitted:**
- `provider:status:update` - When a provider's status changes
- `booking:availability:update` - When booking availability changes

### 2. Telegram Bot Service (`telegram-bot.service.ts`)

Handles Telegram bot commands and broadcasts status changes.

**Commands:**
- `/start` - Initialize bot and authenticate
- `/status` - Check current status
- `/available` - Mark as available
- `/busy` - Mark as unavailable

**Keyboard Buttons:**
- ✅ Available
- ❌ Busy
- 📊 Status
- ❓ Help

### 3. Webhook Controller (`telegram.controller.ts`)

Provides HTTP endpoints for external status updates.

**Endpoints:**
- `POST /api/webhook/telegram/status` - Update provider status
- `GET /api/webhook/telegram/status/:telegram_user_id` - Get provider status
- `POST /api/webhook/telegram/booking` - Send booking notification

## API Reference

### Update Provider Status

**Endpoint:** `POST /api/webhook/telegram/status`

**Request Body:**
```json
{
  "telegram_user_id": "123456789",
  "telegram_username": "john_guide",
  "status": "available",
  "timestamp": "2025-01-24T10:30:00Z"
}
```

**Valid Status Values:**
- `available` - Provider is available for bookings
- `unavailable` - Provider is not available
- `on_tour` - Guide is currently on a tour (mapped to unavailable)
- `on_trip` - Driver is currently on a trip (mapped to unavailable)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Guide status updated successfully",
    "provider_type": "guide",
    "provider_id": "uuid-here",
    "provider_name": "John Doe",
    "new_status": "available",
    "telegram_user_id": "123456789",
    "telegram_username": "john_guide"
  }
}
```

### Get Provider Status

**Endpoint:** `GET /api/webhook/telegram/status/:telegram_user_id`

**Response:**
```json
{
  "success": true,
  "data": {
    "provider_type": "guide",
    "provider_id": "uuid-here",
    "provider_name": "John Doe",
    "status": "available",
    "last_status_update": "2025-01-24T10:30:00Z",
    "telegram_user_id": "123456789",
    "telegram_username": "john_guide"
  }
}
```

## WebSocket Events

### Provider Status Update Event

**Event:** `provider:status:update`

**Payload:**
```json
{
  "provider_type": "guide",
  "provider_id": "uuid-here",
  "provider_name": "John Doe",
  "telegram_user_id": "123456789",
  "telegram_username": "john_guide",
  "old_status": "unavailable",
  "new_status": "available",
  "timestamp": "2025-01-24T10:30:00.000Z"
}
```

### Booking Availability Update Event

**Event:** `booking:availability:update`

**Payload:**
```json
{
  "provider_type": "guide",
  "provider_id": "uuid-here",
  "available": true,
  "timestamp": "2025-01-24T10:30:00.000Z"
}
```

## Frontend Integration

### Connecting to WebSocket

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token-here'
  },
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('provider:status:update', (data) => {
  console.log('Provider status updated:', data);
  // Update UI with new status
});

socket.on('booking:availability:update', (data) => {
  console.log('Booking availability updated:', data);
  // Update booking availability in UI
});
```

### React Example

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

function AdminDashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      auth: { token: localStorage.getItem('token') }
    });

    newSocket.on('provider:status:update', (data) => {
      setProviders(prev => 
        prev.map(p => 
          p.id === data.provider_id 
            ? { ...p, status: data.new_status }
            : p
        )
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div>
      {/* Your dashboard UI */}
    </div>
  );
}
```

## Testing

### Run Test Suite

```bash
npm run test:provider-status
```

### Manual Testing with Telegram Bot

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Open Telegram and find your bot

3. Send `/start` command to authenticate

4. Use keyboard buttons or commands:
   - Click "✅ Available" or send `/available`
   - Click "❌ Busy" or send `/busy`
   - Click "📊 Status" or send `/status`

5. Monitor the admin dashboard for real-time updates

### Manual Testing with Webhook

```bash
# Update guide status to available
curl -X POST http://localhost:3000/api/webhook/telegram/status \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_user_id": "123456789",
    "telegram_username": "test_guide",
    "status": "available",
    "timestamp": "2025-01-24T10:30:00Z"
  }'

# Get provider status
curl http://localhost:3000/api/webhook/telegram/status/123456789
```

## Database Schema

### Guide Status Fields

```typescript
interface Guide {
  status: 'available' | 'unavailable' | 'on_tour';
  last_status_update: Date;
  telegram_user_id: string;
  telegram_username: string;
}
```

### Transportation Status Fields

```typescript
interface Transportation {
  status: 'available' | 'unavailable' | 'on_trip';
  last_status_update: Date;
  telegram_user_id: string;
  telegram_username: string;
}
```

## Error Handling

### Common Errors

**400 Bad Request - Missing Fields**
```json
{
  "success": false,
  "error": {
    "code": "VAL_2002",
    "message": "Missing required fields: telegram_user_id and status"
  }
}
```

**400 Bad Request - Invalid Status**
```json
{
  "success": false,
  "error": {
    "code": "VAL_2001",
    "message": "Invalid status. Must be one of: available, unavailable, on_tour, on_trip"
  }
}
```

**404 Not Found - Provider Not Found**
```json
{
  "success": false,
  "error": {
    "code": "RES_3001",
    "message": "Provider not found with the given Telegram user ID"
  }
}
```

## Security Considerations

1. **WebSocket Authentication**: JWT tokens are validated for WebSocket connections
2. **Webhook Security**: Consider adding webhook signature verification for production
3. **Rate Limiting**: Status updates are subject to API rate limiting
4. **Telegram Bot Token**: Keep the bot token secure in environment variables

## Performance

- **WebSocket Latency**: < 100ms for status updates
- **Database Updates**: Indexed queries on `telegram_user_id`
- **Broadcast Efficiency**: Room-based broadcasting to admin dashboard only

## Future Enhancements

1. **Webhook Signature Verification**: Add HMAC signature verification for webhooks
2. **Status History**: Track status change history for analytics
3. **Geolocation**: Add location tracking for on-tour/on-trip status
4. **Push Notifications**: Send push notifications to mobile admin apps
5. **Status Scheduling**: Allow providers to schedule availability in advance

## Requirements Fulfilled

- ✅ **49.3**: Real-time status updates for guides and drivers
- ✅ **49.4**: Dashboard displays real-time status with availability indicators
- ✅ **50.4**: Status changes broadcast to admin dashboard
- ✅ **60.5**: Guides/drivers update status via Telegram bot, reflected in admin dashboard

## Related Documentation

- [Telegram Bot Integration](./TELEGRAM_BOT.md)
- [WebSocket Architecture](./WEBSOCKET_ARCHITECTURE.md)
- [Guide Management](./GUIDE_TRANSPORTATION_MODELS.md)
