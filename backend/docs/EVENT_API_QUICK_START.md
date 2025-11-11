# Event API Quick Start Guide

## Overview

Quick guide to get started with the Event Management API endpoints.

## Prerequisites

- Backend server running on `http://localhost:3000`
- Database connected and synced
- Event data seeded (optional but recommended)

## Quick Setup

### 1. Start the Server

```bash
cd backend
npm run dev
```

The server should start on port 3000.

### 2. Seed Event Data (Optional)

```bash
npm run seed:events
```

This creates 6 sample events including:
- Khmer New Year Festival
- Water Festival
- Angkor Wat Sunrise Experience
- Pchum Ben Festival
- Royal Ploughing Ceremony
- Mekong River Sunset Cruise

### 3. Test the Endpoints

```bash
npm run test:events
```

This runs a comprehensive test suite with 12 test cases.

## Quick API Examples

### Get All Events

```bash
curl http://localhost:3000/api/events
```

### Get Festival Events Only

```bash
curl "http://localhost:3000/api/events?event_type=festival"
```

### Get Events in Phnom Penh

```bash
curl "http://localhost:3000/api/events?city=Phnom%20Penh"
```

### Get Events by Date (Khmer New Year)

```bash
curl http://localhost:3000/api/events/date/2025-04-15
```

### Get Event Details

First, get an event ID from the list, then:

```bash
curl http://localhost:3000/api/events/{EVENT_ID}
```

### Get Budget-Friendly Events

```bash
curl "http://localhost:3000/api/events?max_price=50"
```

### Get Available Events Sorted by Popularity

```bash
curl "http://localhost:3000/api/events?available_only=true&sort_by=popularity"
```

## Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "data": {
    "events": [...],
    "pagination": {...},
    "filters": {...}
  },
  "message": "Events retrieved successfully"
}
```

## Event Object

Each event includes:

```json
{
  "id": "uuid",
  "name": "Event Name",
  "description": "Detailed description",
  "event_type": "festival|cultural|seasonal",
  "start_date": "2025-04-14",
  "end_date": "2025-04-16",
  "location": {
    "city": "Phnom Penh",
    "province": "Phnom Penh",
    "venue": "Venue name",
    "latitude": 11.5564,
    "longitude": 104.9282
  },
  "pricing": {
    "base_price": 50,
    "vip_price": 150
  },
  "capacity": 500,
  "bookings_count": 0,
  "images": ["url1", "url2"],
  "cultural_significance": "Historical context...",
  "what_to_expect": "What participants will experience...",
  "related_tours": ["tour-id-1"],
  "is_active": true,
  "is_upcoming": true,
  "is_ongoing": false,
  "is_past": false,
  "available_spots": 500,
  "duration_days": 3
}
```

## Common Use Cases

### 1. Display Upcoming Festivals

```bash
curl "http://localhost:3000/api/events?event_type=festival&sort_by=start_date"
```

### 2. Find Events During Travel Dates

```bash
# Check what's happening on a specific date
curl http://localhost:3000/api/events/date/2025-04-15
```

### 3. Cultural Experiences in Siem Reap

```bash
curl "http://localhost:3000/api/events?event_type=cultural&city=Siem%20Reap"
```

### 4. Budget Planning

```bash
# Events under $60
curl "http://localhost:3000/api/events?max_price=60"

# Events in price range $40-$60
curl "http://localhost:3000/api/events?min_price=40&max_price=60"
```

### 5. Event Calendar

```bash
# Get all events in April 2025
curl "http://localhost:3000/api/events?start_date=2025-04-01&end_date=2025-04-30"
```

## Filter Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `event_type` | string | festival, cultural, seasonal | `festival` |
| `city` | string | City name (partial match) | `Phnom Penh` |
| `province` | string | Province name | `Siem Reap` |
| `start_date` | date | Events starting on/after | `2025-04-01` |
| `end_date` | date | Events ending on/before | `2025-12-31` |
| `min_price` | number | Minimum base price | `40` |
| `max_price` | number | Maximum base price | `100` |
| `available_only` | boolean | Only events with capacity | `true` |
| `page` | number | Page number | `1` |
| `limit` | number | Results per page | `20` |
| `sort_by` | string | start_date, end_date, name, popularity | `popularity` |

## Error Handling

### Event Not Found (404)

```json
{
  "success": false,
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event not found"
  }
}
```

### Invalid Date Format (400)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "Invalid date format. Use YYYY-MM-DD"
  }
}
```

## Integration with Frontend

### React/Next.js Example

```typescript
// Fetch all events
const response = await fetch('http://localhost:3000/api/events');
const data = await response.json();

if (data.success) {
  const events = data.data.events;
  // Display events
}

// Fetch events by date
const date = '2025-04-15';
const response = await fetch(`http://localhost:3000/api/events/date/${date}`);
const data = await response.json();

if (data.success) {
  const events = data.data.events;
  // Display events for this date
}
```

### Filter Events

```typescript
const params = new URLSearchParams({
  event_type: 'festival',
  city: 'Phnom Penh',
  max_price: '60',
  available_only: 'true',
  sort_by: 'start_date'
});

const response = await fetch(`http://localhost:3000/api/events?${params}`);
const data = await response.json();
```

## Testing Checklist

- [ ] Server starts successfully
- [ ] Events can be seeded
- [ ] GET /api/events returns event list
- [ ] Filters work correctly
- [ ] Sorting works correctly
- [ ] Pagination works correctly
- [ ] GET /api/events/:id returns event details
- [ ] Related tours are included in details
- [ ] GET /api/events/date/:date returns events for date
- [ ] Invalid date format returns 400 error
- [ ] Non-existent event returns 404 error
- [ ] Available spots are calculated correctly

## Troubleshooting

### Server Won't Start

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill the process if needed
kill -9 <PID>
```

### Database Connection Issues

```bash
# Test database connection
npm run db:test

# Sync models
npm run db:sync
```

### No Events Returned

```bash
# Seed the database
npm run seed:events

# Check if events table exists
# Connect to MySQL and run:
# SHOW TABLES;
# SELECT COUNT(*) FROM events;
```

## Next Steps

1. Implement event booking functionality
2. Add event to AI recommendations
3. Create event calendar UI
4. Add event notifications
5. Implement event reviews

## Support

For full API documentation, see [EVENT_API.md](./EVENT_API.md)

For issues or questions, check the task summary at [TASK_28_SUMMARY.md](../TASK_28_SUMMARY.md)
