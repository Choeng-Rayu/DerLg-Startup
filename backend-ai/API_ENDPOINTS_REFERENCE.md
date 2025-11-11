# AI Engine API Endpoints Reference

Quick reference guide for all AI API endpoints implemented in Task 35.

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://ai.derlg.com`

---

## Endpoints Overview

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/health` | Health check | ✅ Working |
| POST | `/api/recommend` | Get personalized recommendations | ✅ Working |
| POST | `/api/chat` | Chat with AI assistant | ✅ Implemented |
| POST | `/api/itinerary` | Generate travel itinerary | ✅ Implemented |
| POST | `/api/analyze-review` | Analyze review sentiment | ✅ Working |
| POST | `/api/analyze-reviews-batch` | Batch sentiment analysis | ✅ Working |

---

## 1. Health Check

### GET `/api/health`

Check if the AI Engine service is running.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-24T08:50:40.317190",
  "environment": "development",
  "model_used": "DeepSeek",
  "version": "1.0.0"
}
```

**cURL Example**:
```bash
curl http://localhost:8000/api/health
```

---

## 2. Personalized Recommendations

### POST `/api/recommend`

Get personalized hotel and tour recommendations based on user preferences.

**Request Body**:
```json
{
  "user_id": "user_123",
  "budget": 500.0,
  "destination": "Siem Reap",
  "check_in": "2025-11-24",
  "check_out": "2025-11-27",
  "preferences": {
    "amenities": ["wifi", "pool"],
    "rating": 4.0
  }
}
```

**Response**:
```json
{
  "success": true,
  "recommendations": [
    {
      "id": "hotel_1",
      "name": "Angkor Paradise Hotel",
      "type": "hotel",
      "price": 120.0,
      "rating": 4.5,
      "confidence": 0.85,
      "reason": "Matches your budget and amenity preferences"
    }
  ],
  "total": 3
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "budget": 500.0,
    "destination": "Siem Reap"
  }'
```

---

## 3. Chat Assistant

### POST `/api/chat`

Chat with the AI travel assistant for personalized help.

**Request Body**:
```json
{
  "message": "What are the best hotels in Siem Reap for families?",
  "session_id": "session_456",
  "conversation_history": [
    {
      "role": "user",
      "content": "I'm planning a trip to Cambodia"
    },
    {
      "role": "assistant",
      "content": "Great! I'd be happy to help..."
    }
  ],
  "context": {
    "budget": 500,
    "destination": "Siem Reap",
    "group_size": 4
  },
  "stream": false
}
```

**Response**:
```json
{
  "success": true,
  "response": "For families visiting Siem Reap, I recommend...",
  "session_id": "session_456"
}
```

**Streaming Response**:
Set `"stream": true` to receive Server-Sent Events (SSE) for real-time streaming.

**cURL Example**:
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the best hotels in Siem Reap?",
    "session_id": "session_456",
    "conversation_history": [],
    "stream": false
  }'
```

---

## 4. Itinerary Generation

### POST `/api/itinerary`

Generate an optimized day-by-day travel itinerary.

**Request Body**:
```json
{
  "destination": "Siem Reap",
  "start_date": "2025-11-24",
  "end_date": "2025-11-27",
  "budget": 800.0,
  "preferences": ["cultural", "adventure"],
  "group_size": 2,
  "hotels": [
    {
      "id": "hotel_1",
      "name": "Angkor Palace Resort",
      "price_per_night": 120,
      "rating": 4.5
    }
  ],
  "tours": [
    {
      "id": "tour_1",
      "name": "Angkor Wat Sunrise Tour",
      "price_per_person": 50,
      "duration": {"days": 1}
    }
  ],
  "events": []
}
```

**Response**:
```json
{
  "success": true,
  "itinerary": {
    "title": "3-Day Siem Reap Cultural Adventure",
    "summary": "Explore ancient temples and local culture",
    "days": [
      {
        "day": 1,
        "date": "2025-11-24",
        "theme": "Temple Exploration",
        "activities": [
          {
            "time": "09:00",
            "activity": "Angkor Wat Sunrise Tour",
            "location": "Angkor Wat",
            "duration": "4 hours",
            "cost": 50.0,
            "description": "Watch the sunrise over Angkor Wat",
            "type": "cultural"
          }
        ],
        "daily_cost": 250.0,
        "notes": "Bring sunscreen and water"
      }
    ],
    "total_cost": 750.0,
    "budget_remaining": 50.0,
    "cost_breakdown": {
      "accommodation": 360.0,
      "tours": 200.0,
      "meals": 150.0,
      "transportation": 40.0,
      "total": 750.0
    }
  }
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8000/api/itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Siem Reap",
    "start_date": "2025-11-24",
    "end_date": "2025-11-27",
    "budget": 800.0,
    "preferences": ["cultural"],
    "group_size": 2
  }'
```

---

## 5. Sentiment Analysis

### POST `/api/analyze-review`

Analyze the sentiment of a customer review.

**Request Body**:
```json
{
  "review_text": "Amazing hotel! The staff was incredibly friendly and helpful. The room was spotlessly clean and the location was perfect. Great value for money. Highly recommend!"
}
```

**Response**:
```json
{
  "success": true,
  "score": 0.85,
  "classification": "positive",
  "topics": {
    "cleanliness": 0.90,
    "service": 0.95,
    "location": 0.85,
    "value": 0.80,
    "overall": 0.85
  },
  "flagged": false
}
```

**Classifications**:
- `positive`: score 0.6 - 1.0
- `neutral`: score 0.4 - 0.6
- `negative`: score 0.0 - 0.4
- `flagged`: true if score < 0.3 (requires admin attention)

**cURL Example**:
```bash
curl -X POST http://localhost:8000/api/analyze-review \
  -H "Content-Type: application/json" \
  -d '{
    "review_text": "Great hotel with excellent service!"
  }'
```

---

## 6. Batch Sentiment Analysis

### POST `/api/analyze-reviews-batch`

Analyze multiple reviews in a single request (more efficient).

**Request Body**:
```json
{
  "reviews": [
    "Great hotel!",
    "Terrible experience, would not recommend.",
    "Average stay, nothing special."
  ]
}
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "review_text": "Great hotel!",
      "score": 0.85,
      "classification": "positive",
      "topics": {...},
      "flagged": false
    },
    {
      "review_text": "Terrible experience...",
      "score": 0.15,
      "classification": "negative",
      "topics": {...},
      "flagged": true
    }
  ],
  "total": 3
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes**:
- `200`: Success
- `400`: Bad Request (invalid input)
- `402`: Payment Required (insufficient API credits)
- `500`: Internal Server Error

---

## Interactive Documentation

### Swagger UI
Visit `http://localhost:8000/docs` for interactive API documentation where you can:
- View all endpoints
- See request/response schemas
- Test endpoints directly in the browser

### ReDoc
Visit `http://localhost:8000/redoc` for alternative documentation format.

---

## Integration Examples

### JavaScript/TypeScript (Frontend)

```typescript
// Recommendation request
const getRecommendations = async (userId: string, budget: number) => {
  const response = await fetch('http://localhost:8000/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      budget: budget,
      destination: 'Siem Reap'
    })
  });
  return await response.json();
};

// Chat request
const chatWithAI = async (message: string, sessionId: string) => {
  const response = await fetch('http://localhost:8000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: message,
      session_id: sessionId,
      conversation_history: [],
      stream: false
    })
  });
  return await response.json();
};

// Sentiment analysis
const analyzeReview = async (reviewText: string) => {
  const response = await fetch('http://localhost:8000/api/analyze-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      review_text: reviewText
    })
  });
  return await response.json();
};
```

### Python (Backend Integration)

```python
import requests

# Recommendation request
def get_recommendations(user_id: str, budget: float):
    response = requests.post(
        'http://localhost:8000/api/recommend',
        json={
            'user_id': user_id,
            'budget': budget,
            'destination': 'Siem Reap'
        }
    )
    return response.json()

# Chat request
def chat_with_ai(message: str, session_id: str):
    response = requests.post(
        'http://localhost:8000/api/chat',
        json={
            'message': message,
            'session_id': session_id,
            'conversation_history': [],
            'stream': False
        }
    )
    return response.json()

# Sentiment analysis
def analyze_review(review_text: str):
    response = requests.post(
        'http://localhost:8000/api/analyze-review',
        json={'review_text': review_text}
    )
    return response.json()
```

---

## Performance Considerations

- **Recommendations**: < 3 seconds response time
- **Chat**: < 2 seconds per message
- **Sentiment Analysis**: < 1 second per review
- **Itinerary**: 3-5 seconds depending on complexity
- **Health Check**: < 100ms

---

## Security Notes

⚠️ **Current Status**: Endpoints are open (no authentication)

**Planned Security** (Phase 13):
- JWT authentication required
- Rate limiting per user
- API key validation
- Request throttling

---

## Support

For issues or questions:
1. Check the interactive docs at `/docs`
2. Review the implementation in `backend-ai/routes/`
3. Check logs for detailed error messages
4. Refer to TASK_35_SUMMARY.md for implementation details
