# Event API Documentation

## Overview

The Event API provides endpoints for browsing and discovering cultural events, festivals, and seasonal experiences in Cambodia. Events include important festivals like Khmer New Year and Water Festival, as well as ongoing cultural experiences like Angkor Wat sunrise tours.

## Base URL

```
/api/events
```

## Endpoints

### 1. Get All Events

Retrieve a list of all active events with optional filtering, sorting, and pagination.

**Endpoint:** `GET /api/events`

**Access:** Public

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `event_type` | string | Filter by event type (festival, cultural, seasonal) | `festival` |
| `city` | string | Filter by city name (partial match) | `Phnom Penh` |
| `province` | string | Filter by province name (partial match) | `Siem Reap` |
| `start_date` | date | Filter events starting on or after this date (YYYY-MM-DD) | `2025-04-01` |
| `end_date` | date | Filter events ending on or before this date (YYYY-MM-DD) | `2025-12-31` |
| `min_price` | number | Minimum base price | `40` |
| `max_price` | number | Maximum base price | `100` |
| `available_only` | boolean | Show only events with available capacity | `true` |
| `page` | number | Page number for pagination (default: 1) | `1` |
| `limit` | number | Number of results per page (default: 20) | `10` |
| `sort_by` | string | Sort order: `start_date`, `end_date`, `name`, `popularity` (default: `start_date`) | `popularity` |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "name": "Khmer New Year Festival",
        "description": "Experience the most important traditional festival...",
        "event_type": "festival",
        "start_date": "2025-04-14",
        "end_date": "2025-04-16",
        "location": {
          "city": "Phnom Penh",
          "province": "Phnom Penh",
          "venue": "Various locations across the city",
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
        "cultural_significance": "Khmer New Year marks the end of harvest season...",
        "what_to_expect": "Participate in traditional water blessings...",
        "related_tours": ["tour-id-1", "tour-id-2"],
        "is_active": true,
        "created_by": "admin-id",
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z",
        "is_upcoming": true,
        "is_ongoing": false,
        "is_past": false,
        "available_spots": 500,
        "duration_days": 3
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 6,
      "totalPages": 1
    },
    "filters": {
      "event_type": null,
      "city": null,
      "province": null,
      "start_date": null,
      "end_date": null,
      "min_price": null,
      "max_price": null,
      "available_only": null,
      "sort_by": "start_date"
    }
  },
  "message": "Events retrieved successfully"
}
```

**Example Requests:**

```bash
# Get all events
curl http://localhost:3000/api/events

# Get festival events only
curl http://localhost:3000/api/events?event_type=festival

# Get events in Phnom Penh
curl http://localhost:3000/api/events?city=Phnom%20Penh

# Get events in price range $40-$60
curl http://localhost:3000/api/events?min_price=40&max_price=60

# Get available events sorted by popularity
curl http://localhost:3000/api/events?available_only=true&sort_by=popularity

# Get events with pagination
curl http://localhost:3000/api/events?page=1&limit=5
```

---

### 2. Get Event by ID

Retrieve detailed information about a specific event, including related tours.

**Endpoint:** `GET /api/events/:id`

**Access:** Public

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Event ID |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "event": {
      "id": "uuid",
      "name": "Khmer New Year Festival",
      "description": "Experience the most important traditional festival in Cambodia...",
      "event_type": "festival",
      "start_date": "2025-04-14",
      "end_date": "2025-04-16",
      "location": {
        "city": "Phnom Penh",
        "province": "Phnom Penh",
        "venue": "Various locations across the city",
        "latitude": 11.5564,
        "longitude": 104.9282
      },
      "pricing": {
        "base_price": 50,
        "vip_price": 150
      },
      "capacity": 500,
      "bookings_count": 0,
      "images": [
        "https://res.cloudinary.com/demo/image/upload/khmer-new-year-1.jpg",
        "https://res.cloudinary.com/demo/image/upload/khmer-new-year-2.jpg"
      ],
      "cultural_significance": "Khmer New Year, also known as Choul Chnam Thmey...",
      "what_to_expect": "Participate in traditional water blessings, watch cultural performances...",
      "related_tours": [
        {
          "id": "tour-uuid",
          "name": "Phnom Penh Cultural Tour",
          "description": "Explore the cultural heart of Cambodia...",
          "destination": "Phnom Penh",
          "duration": {
            "days": 1,
            "nights": 0
          },
          "difficulty": "easy",
          "price_per_person": 45,
          "average_rating": 4.5,
          "images": ["tour-image-url"]
        }
      ],
      "is_active": true,
      "created_by": "admin-id",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z",
      "is_upcoming": true,
      "is_ongoing": false,
      "is_past": false,
      "available_spots": 500,
      "duration_days": 3
    }
  },
  "message": "Event details retrieved successfully"
}
```

**Error Responses:**

```json
// Event not found (404)
{
  "success": false,
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event not found"
  }
}

// Event not available (404)
{
  "success": false,
  "error": {
    "code": "EVENT_NOT_AVAILABLE",
    "message": "Event is not available"
  }
}
```

**Example Request:**

```bash
curl http://localhost:3000/api/events/550e8400-e29b-41d4-a716-446655440000
```

---

### 3. Get Events by Date

Retrieve all events that are active on a specific date, including related tours.

**Endpoint:** `GET /api/events/date/:date`

**Access:** Public

**URL Parameters:**

| Parameter | Type | Description | Format |
|-----------|------|-------------|--------|
| `date` | date | Query date | YYYY-MM-DD |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "date": "2025-04-15",
    "events": [
      {
        "id": "uuid",
        "name": "Khmer New Year Festival",
        "description": "Experience the most important traditional festival...",
        "event_type": "festival",
        "start_date": "2025-04-14",
        "end_date": "2025-04-16",
        "location": {
          "city": "Phnom Penh",
          "province": "Phnom Penh",
          "venue": "Various locations across the city",
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
        "cultural_significance": "Khmer New Year marks the end of harvest season...",
        "what_to_expect": "Participate in traditional water blessings...",
        "related_tours": [
          {
            "id": "tour-uuid",
            "name": "Phnom Penh Cultural Tour",
            "destination": "Phnom Penh",
            "duration": {
              "days": 1,
              "nights": 0
            },
            "price_per_person": 45,
            "average_rating": 4.5
          }
        ],
        "is_active": true,
        "created_by": "admin-id",
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z",
        "is_upcoming": true,
        "is_ongoing": false,
        "is_past": false,
        "available_spots": 500,
        "duration_days": 3
      }
    ],
    "count": 1
  },
  "message": "Events for 2025-04-15 retrieved successfully"
}
```

**Error Response:**

```json
// Invalid date format (400)
{
  "success": false,
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "Invalid date format. Use YYYY-MM-DD"
  }
}
```

**Example Requests:**

```bash
# Get events on Khmer New Year
curl http://localhost:3000/api/events/date/2025-04-15

# Get events on a specific date
curl http://localhost:3000/api/events/date/2025-11-06

# Get events for today
curl http://localhost:3000/api/events/date/$(date +%Y-%m-%d)
```

---

## Event Object Structure

### Event Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique event identifier |
| `name` | string | Event name |
| `description` | text | Detailed event description |
| `event_type` | enum | Event type: `festival`, `cultural`, `seasonal` |
| `start_date` | date | Event start date (YYYY-MM-DD) |
| `end_date` | date | Event end date (YYYY-MM-DD) |
| `location` | object | Event location details |
| `location.city` | string | City name |
| `location.province` | string | Province name |
| `location.venue` | string | Venue name or description |
| `location.latitude` | number | GPS latitude |
| `location.longitude` | number | GPS longitude |
| `pricing` | object | Pricing information |
| `pricing.base_price` | number | Base ticket price (USD) |
| `pricing.vip_price` | number | VIP ticket price (USD) |
| `capacity` | number | Maximum capacity |
| `bookings_count` | number | Current number of bookings |
| `images` | array | Array of image URLs |
| `cultural_significance` | text | Cultural and historical context |
| `what_to_expect` | text | What participants can expect |
| `related_tours` | array | Array of related tour IDs or tour objects |
| `is_active` | boolean | Whether event is active |
| `created_by` | UUID | Admin who created the event |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Last update timestamp |

### Computed Fields (in responses)

| Field | Type | Description |
|-------|------|-------------|
| `is_upcoming` | boolean | Event hasn't started yet |
| `is_ongoing` | boolean | Event is currently happening |
| `is_past` | boolean | Event has ended |
| `available_spots` | number | Remaining capacity |
| `duration_days` | number | Event duration in days |

---

## Event Types

### Festival
Major cultural and religious festivals celebrated across Cambodia.

**Examples:**
- Khmer New Year (Choul Chnam Thmey)
- Water Festival (Bon Om Touk)
- Pchum Ben (Ancestors' Day)

### Cultural
Ongoing cultural experiences and ceremonies.

**Examples:**
- Angkor Wat Sunrise Experience
- Royal Ploughing Ceremony
- Traditional dance performances

### Seasonal
Seasonal activities and experiences available during specific times of the year.

**Examples:**
- Mekong River Sunset Cruise (dry season)
- Monsoon season experiences
- Harvest season activities

---

## Integration with Tours

Events can be linked to related tours through the `related_tours` field. When retrieving event details or events by date, the API automatically fetches and includes information about related tours.

**Related Tour Object:**

```json
{
  "id": "tour-uuid",
  "name": "Tour Name",
  "description": "Tour description",
  "destination": "Destination",
  "duration": {
    "days": 1,
    "nights": 0
  },
  "difficulty": "easy",
  "price_per_person": 45,
  "average_rating": 4.5,
  "images": ["image-url"]
}
```

---

## Testing

### Seed Events

```bash
npm run seed:events
```

This will create sample events including:
- Khmer New Year Festival
- Water Festival (Bon Om Touk)
- Angkor Wat Sunrise Experience
- Pchum Ben Festival
- Royal Ploughing Ceremony
- Mekong River Sunset Cruise

### Test Endpoints

```bash
npm run test:events
```

This runs a comprehensive test suite covering:
- Get all events
- Filter by event type
- Filter by city
- Filter by price range
- Sort by popularity
- Get event by ID
- Get events by date
- Invalid date handling
- Non-existent event handling
- Pagination
- Available events only

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `EVENT_RETRIEVAL_ERROR` | 500 | Failed to retrieve events |
| `EVENT_NOT_FOUND` | 404 | Event not found |
| `EVENT_NOT_AVAILABLE` | 404 | Event is not active |
| `EVENT_DETAIL_ERROR` | 500 | Failed to retrieve event details |
| `INVALID_DATE_FORMAT` | 400 | Invalid date format provided |
| `EVENT_DATE_QUERY_ERROR` | 500 | Failed to retrieve events by date |

---

## Best Practices

1. **Date Queries**: Always use YYYY-MM-DD format for date parameters
2. **Filtering**: Combine multiple filters for precise results
3. **Pagination**: Use pagination for large result sets
4. **Caching**: Consider caching event listings as they don't change frequently
5. **Related Tours**: Use event details endpoint to get full tour information
6. **Availability**: Check `available_spots` before allowing bookings
7. **Status**: Use `is_upcoming`, `is_ongoing`, `is_past` to display appropriate UI

---

## Example Use Cases

### 1. Display Upcoming Festivals

```bash
curl "http://localhost:3000/api/events?event_type=festival&sort_by=start_date"
```

### 2. Find Events During User's Travel Dates

```bash
# Get events on specific date
curl "http://localhost:3000/api/events/date/2025-04-15"
```

### 3. Show Cultural Experiences in Siem Reap

```bash
curl "http://localhost:3000/api/events?event_type=cultural&city=Siem%20Reap"
```

### 4. Budget-Friendly Events

```bash
curl "http://localhost:3000/api/events?max_price=50&available_only=true"
```

### 5. Event Calendar View

```bash
# Get all events with date range
curl "http://localhost:3000/api/events?start_date=2025-04-01&end_date=2025-04-30"
```

---

## Requirements Fulfilled

This implementation fulfills the following requirements:

- **Requirement 47.1**: Display current and upcoming festivals including Khmer New Year and popular cultural events
- **Requirement 47.2**: AI recommendations automatically include relevant festivals happening during user's travel dates
- **Requirement 47.4**: Events are seasonal with historical information and optimal timing suggestions

---

## Next Steps

1. Implement event booking functionality
2. Add event to AI recommendation engine
3. Create event calendar view in frontend
4. Implement event notifications
5. Add event reviews and ratings
