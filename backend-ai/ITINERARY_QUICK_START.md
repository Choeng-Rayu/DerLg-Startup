# Itinerary Generation - Quick Start Guide

## Overview

The itinerary generation feature creates optimized day-by-day travel plans for tourists visiting Cambodia. It uses AI to balance activities, optimize routes, and manage budgets effectively.

## Quick Start

### 1. Start the AI Engine

```bash
cd backend-ai
python main.py
```

The server will start on `http://localhost:8000`

### 2. Generate an Itinerary

**Using curl:**

```bash
curl -X POST http://localhost:8000/api/itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Siem Reap",
    "start_date": "2025-12-01",
    "end_date": "2025-12-03",
    "budget": 500.0,
    "preferences": ["cultural", "adventure"],
    "group_size": 2
  }'
```

**Using Python:**

```python
import requests

response = requests.post(
    "http://localhost:8000/api/itinerary",
    json={
        "destination": "Siem Reap",
        "start_date": "2025-12-01",
        "end_date": "2025-12-03",
        "budget": 500.0,
        "preferences": ["cultural", "adventure"],
        "group_size": 2
    }
)

itinerary = response.json()
print(itinerary)
```

### 3. Test the Implementation

```bash
cd backend-ai
python test_itinerary.py
```

## API Reference

### Endpoint

```
POST /api/itinerary
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `destination` | string | Yes | Target destination (e.g., "Siem Reap", "Phnom Penh") |
| `start_date` | string | Yes | Trip start date in YYYY-MM-DD format |
| `end_date` | string | Yes | Trip end date in YYYY-MM-DD format |
| `budget` | number | Yes | Total budget in USD (must be > 0) |
| `preferences` | array | No | Activity preferences (e.g., ["cultural", "adventure"]) |
| `group_size` | number | No | Number of travelers (default: 1) |
| `hotels` | array | No | Available hotels data for context |
| `tours` | array | No | Available tours data for context |
| `events` | array | No | Available events data for context |

### Response

```json
{
  "success": true,
  "itinerary": {
    "title": "3-Day Siem Reap Adventure",
    "summary": "A balanced cultural and adventure experience",
    "days": [
      {
        "day": 1,
        "date": "2025-12-01",
        "theme": "Cultural Exploration",
        "activities": [
          {
            "time": "09:00",
            "activity": "Angkor Wat Sunrise Tour",
            "location": "Angkor Wat",
            "duration": "3 hours",
            "cost": 35.00,
            "description": "Witness the stunning sunrise at Angkor Wat",
            "type": "cultural",
            "travel_to_next": "15-30 minutes"
          }
        ],
        "daily_cost": 150.00,
        "notes": "Bring sunscreen and comfortable shoes"
      }
    ],
    "total_cost": 450.00,
    "budget_remaining": 50.00,
    "cost_breakdown": {
      "accommodation": 120.00,
      "tours": 210.00,
      "meals": 90.00,
      "transportation": 30.00,
      "events": 0.00,
      "other": 0.00,
      "total": 450.00
    }
  }
}
```

## Features

### 1. Route Optimization
- Minimizes travel time between activities
- Adds travel time estimates
- Ready for Google Maps API integration

### 2. Activity Balancing
- Distributes activity types across days
- Considers user preferences
- Includes cultural, adventure, and relaxation activities

### 3. Budget Management
- Stays within 90% of specified budget
- Provides detailed cost breakdowns
- Tracks expenses by category

### 4. Day-by-Day Planning
- Structured daily schedules
- Includes meal breaks
- Considers opening hours
- Provides activity descriptions

### 5. Context Integration
- Uses provided hotel data
- Incorporates tour information
- Includes event details
- Prioritizes available options

## Examples

### Basic Itinerary

```json
{
  "destination": "Siem Reap",
  "start_date": "2025-12-01",
  "end_date": "2025-12-03",
  "budget": 500.0,
  "preferences": ["cultural"],
  "group_size": 2
}
```

### With Context Data

```json
{
  "destination": "Phnom Penh",
  "start_date": "2025-12-10",
  "end_date": "2025-12-12",
  "budget": 400.0,
  "preferences": ["cultural", "relaxation"],
  "group_size": 1,
  "hotels": [
    {
      "name": "Royal Palace Hotel",
      "price_per_night": 80,
      "average_rating": 4.5
    }
  ],
  "tours": [
    {
      "name": "Royal Palace Tour",
      "price_per_person": 35,
      "duration": {"days": 1},
      "category": ["cultural"]
    }
  ],
  "events": [
    {
      "name": "Traditional Dance Show",
      "pricing": {"base_price": 20},
      "start_date": "2025-12-10",
      "event_type": "cultural"
    }
  ]
}
```

### Budget-Conscious Trip

```json
{
  "destination": "Siem Reap",
  "start_date": "2025-12-15",
  "end_date": "2025-12-17",
  "budget": 200.0,
  "preferences": ["cultural"],
  "group_size": 1
}
```

## Configuration

### Environment Variables

```bash
# AI Model Selection
MODEL_USED=DEEPSEEK  # Use DEEPSEEK for testing, GPT for production

# API Keys
OPENAI_API_KEY=your_openai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# Server Configuration
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
```

### Model Selection

- **DeepSeek**: Cost-effective for development and testing
- **GPT-4**: Higher quality for production use

Change the model by setting `MODEL_USED` in `.env`:
- `MODEL_USED=DEEPSEEK` - Use DeepSeek
- `MODEL_USED=GPT` - Use GPT-4

## Testing

### Run Test Suite

```bash
cd backend-ai
python test_itinerary.py
```

### Test Coverage

1. **Basic Itinerary Generation** - Simple 3-day trip
2. **Context Integration** - With hotels, tours, and events
3. **Budget Optimization** - Verifies 90% budget constraint
4. **Route Optimization** - Checks travel time information

### Manual Testing

Visit the interactive API documentation:
```
http://localhost:8000/docs
```

Use the "Try it out" feature to test the endpoint directly.

## Integration with Backend

### From Node.js Backend

```javascript
const axios = require('axios');

async function generateItinerary(params) {
  try {
    const response = await axios.post(
      'http://localhost:8000/api/itinerary',
      params
    );
    return response.data.itinerary;
  } catch (error) {
    console.error('Failed to generate itinerary:', error);
    throw error;
  }
}

// Usage
const itinerary = await generateItinerary({
  destination: 'Siem Reap',
  start_date: '2025-12-01',
  end_date: '2025-12-03',
  budget: 500.0,
  preferences: ['cultural', 'adventure'],
  group_size: 2
});
```

### From Frontend (React/Next.js)

```typescript
async function generateItinerary(params: ItineraryRequest) {
  const response = await fetch('http://localhost:8000/api/itinerary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate itinerary');
  }
  
  const data = await response.json();
  return data.itinerary;
}
```

## Troubleshooting

### Server Won't Start

**Issue:** Port 8000 already in use

**Solution:**
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Or change the port in .env
PORT=8001
```

### API Key Errors

**Issue:** "Insufficient Balance" or "Invalid API Key"

**Solution:**
1. Check your API key in `.env`
2. Verify the key has sufficient credits
3. Switch to a different model if needed

### Slow Response Times

**Issue:** Itinerary generation takes too long

**Solution:**
1. Reduce the number of days
2. Simplify preferences
3. Use DeepSeek for faster responses
4. Check your internet connection

### JSON Parsing Errors

**Issue:** Failed to parse AI response

**Solution:**
1. Check the AI model configuration
2. Verify API key is valid
3. Review logs for detailed error messages
4. Try regenerating with different parameters

## Best Practices

### 1. Budget Planning
- Set realistic budgets (minimum $50/day recommended)
- Include buffer for unexpected expenses
- Consider group size in budget calculations

### 2. Date Selection
- Plan at least 2-3 days in advance
- Avoid peak tourist seasons for better availability
- Check local holidays and events

### 3. Preferences
- Be specific with preferences (e.g., "temples", "nature")
- Limit to 2-3 main preferences for better results
- Mix activity types for balanced itineraries

### 4. Context Data
- Provide hotel/tour data when available
- Include pricing information for accuracy
- Update availability in real-time

### 5. Error Handling
- Always check the `success` field in responses
- Handle API errors gracefully
- Provide fallback options for users

## Support

For issues or questions:
1. Check the logs in `backend-ai/logs/`
2. Review the API documentation at `/docs`
3. Run the test suite to verify functionality
4. Check the main documentation in `TASK_34_SUMMARY.md`

## Next Steps

1. **Google Maps Integration**: Add real route optimization
2. **Weather API**: Include weather-based recommendations
3. **Real-time Availability**: Connect to booking system
4. **User Feedback**: Collect and incorporate user ratings
5. **Machine Learning**: Improve recommendations over time
