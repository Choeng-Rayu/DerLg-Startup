# Sentiment Analysis Quick Start Guide

## Overview

The sentiment analysis system automatically analyzes customer reviews to extract sentiment scores, classify reviews, identify topics, and flag extremely negative reviews for admin attention.

## Features

- **Sentiment Scoring**: 0-1 scale (0 = very negative, 1 = very positive)
- **Classification**: Positive (≥0.6), Neutral (0.4-0.6), Negative (<0.4)
- **Topic Extraction**: Identifies sentiment for specific topics (cleanliness, service, location, value, comfort, amenities, food)
- **Auto-Flagging**: Reviews with score < 0.3 are flagged for admin review
- **Batch Processing**: Analyze multiple reviews efficiently

## API Endpoints

### 1. Analyze Single Review

**Endpoint:** `POST /api/analyze-review`

**Request:**
```json
{
  "review_text": "Amazing hotel! The staff was incredibly friendly and the room was spotless."
}
```

**Response:**
```json
{
  "success": true,
  "score": 0.728,
  "classification": "positive",
  "topics": {
    "service": 0.727,
    "cleanliness": 0.809
  },
  "flagged": false
}
```

### 2. Analyze Multiple Reviews (Batch)

**Endpoint:** `POST /api/analyze-reviews-batch`

**Request:**
```json
{
  "reviews": [
    "Great hotel!",
    "Terrible experience.",
    "It was okay."
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "score": 0.797,
      "classification": "positive",
      "topics": {},
      "flagged": false
    },
    {
      "score": 0.225,
      "classification": "negative",
      "topics": {},
      "flagged": true
    },
    {
      "score": 0.430,
      "classification": "neutral",
      "topics": {},
      "flagged": false
    }
  ],
  "total": 3
}
```

## Usage Examples

### cURL

```bash
# Analyze single review
curl -X POST http://localhost:8000/api/analyze-review \
  -H "Content-Type: application/json" \
  -d '{"review_text": "Excellent service and clean rooms!"}'

# Batch analysis
curl -X POST http://localhost:8000/api/analyze-reviews-batch \
  -H "Content-Type: application/json" \
  -d '{"reviews": ["Great!", "Bad experience", "Okay"]}'
```

### Python

```python
import httpx
import asyncio

async def analyze_review(review_text: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/api/analyze-review",
            json={"review_text": review_text}
        )
        return response.json()

# Usage
result = asyncio.run(analyze_review("Amazing hotel!"))
print(f"Score: {result['score']}, Classification: {result['classification']}")
```

### JavaScript/TypeScript

```typescript
async function analyzeReview(reviewText: string) {
  const response = await fetch('http://localhost:8000/api/analyze-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review_text: reviewText })
  });
  
  return await response.json();
}

// Usage
const result = await analyzeReview("Amazing hotel!");
console.log(`Score: ${result.score}, Classification: ${result.classification}`);
```

## Integration with Backend

### Review Submission Flow

```typescript
// In backend review controller (backend/src/controllers/review.controller.ts)

import axios from 'axios';

async createReview(req, res) {
  try {
    // 1. Create review in database
    const review = await Review.create({
      user_id: req.user.id,
      hotel_id: req.body.hotel_id,
      comment: req.body.comment,
      ratings: req.body.ratings
    });
    
    // 2. Call AI Engine for sentiment analysis
    const sentimentResponse = await axios.post(
      'http://localhost:8000/api/analyze-review',
      { review_text: req.body.comment }
    );
    
    // 3. Update review with sentiment data
    await review.update({
      sentiment: {
        score: sentimentResponse.data.score,
        classification: sentimentResponse.data.classification,
        topics: sentimentResponse.data.topics
      }
    });
    
    // 4. Flag for admin if extremely negative
    if (sentimentResponse.data.flagged) {
      await notifyAdmin({
        type: 'negative_review',
        review_id: review.id,
        hotel_id: req.body.hotel_id,
        score: sentimentResponse.data.score
      });
    }
    
    // 5. Update hotel average rating
    await updateHotelRating(req.body.hotel_id);
    
    return res.json({
      success: true,
      data: review
    });
    
  } catch (error) {
    console.error('Review creation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create review'
    });
  }
}
```

## Understanding Results

### Sentiment Score Interpretation

| Score Range | Classification | Meaning |
|-------------|----------------|---------|
| 0.8 - 1.0 | Positive | Highly positive, excellent experience |
| 0.6 - 0.8 | Positive | Good experience with positive feedback |
| 0.4 - 0.6 | Neutral | Mixed or average experience |
| 0.3 - 0.4 | Negative | Poor experience with complaints |
| 0.0 - 0.3 | Negative (Flagged) | Very poor experience, needs admin attention |

### Topic Scores

Each topic (cleanliness, service, location, etc.) gets its own sentiment score:
- Only topics mentioned in the review are included
- Scores follow the same 0-1 scale as overall sentiment
- Useful for identifying specific areas of concern or praise

**Example:**
```json
{
  "score": 0.501,
  "classification": "neutral",
  "topics": {
    "cleanliness": 0.238,  // Negative - needs attention
    "service": 0.727,      // Positive - doing well
    "location": 0.809,     // Very positive
    "value": 0.447         // Neutral
  }
}
```

## Admin Dashboard Integration

### Flagged Reviews Display

```typescript
// Fetch flagged reviews for admin dashboard
async function getFlaggedReviews() {
  const reviews = await Review.findAll({
    where: {
      'sentiment.flagged': true,
      admin_reviewed: false
    },
    include: [
      { model: User, attributes: ['id', 'first_name', 'last_name'] },
      { model: Hotel, attributes: ['id', 'name'] }
    ],
    order: [['sentiment.score', 'ASC']]  // Most negative first
  });
  
  return reviews;
}
```

### Hotel Satisfaction Index

```typescript
// Calculate hotel satisfaction from sentiment scores
async function calculateHotelSatisfaction(hotelId: string) {
  const reviews = await Review.findAll({
    where: { hotel_id: hotelId },
    attributes: ['sentiment']
  });
  
  const avgScore = reviews.reduce((sum, r) => 
    sum + r.sentiment.score, 0) / reviews.length;
  
  const positiveCount = reviews.filter(r => 
    r.sentiment.classification === 'positive').length;
  
  const negativeCount = reviews.filter(r => 
    r.sentiment.classification === 'negative').length;
  
  return {
    average_sentiment: avgScore,
    positive_percentage: (positiveCount / reviews.length) * 100,
    negative_percentage: (negativeCount / reviews.length) * 100,
    total_reviews: reviews.length
  };
}
```

## Testing

### Run Standalone Tests

```bash
# Test the sentiment model directly
python backend-ai/test_sentiment_standalone.py
```

### Run API Tests

```bash
# Start the AI Engine server
cd backend-ai
uvicorn main:app --reload --port 8000

# In another terminal, run API tests
python backend-ai/test_sentiment_api.py
```

## Performance

- **Model Load Time**: ~2 seconds (first time only, then cached)
- **Single Review Analysis**: <100ms
- **Batch Analysis**: ~50ms per review
- **Memory Usage**: ~200MB (model in memory)

## Troubleshooting

### Model Download Issues

If the model fails to download:
```bash
# Manually download the model
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

### API Connection Issues

Check if the AI Engine is running:
```bash
curl http://localhost:8000/api/health
```

### Unexpected Results

The model uses semantic analysis, so results may differ from simple keyword matching:
- "Nothing special" might be classified as slightly negative
- Context matters: "not bad" is positive, but "not good" is negative
- Mixed reviews will have neutral scores

## Best Practices

1. **Always analyze reviews asynchronously** - Don't block user review submission
2. **Cache sentiment results** - Store in database, don't re-analyze
3. **Monitor flagged reviews** - Set up admin notifications for score < 0.3
4. **Use topic scores** - Identify specific areas for improvement
5. **Aggregate hotel scores** - Calculate overall satisfaction index
6. **Handle errors gracefully** - Have fallback if AI Engine is unavailable

## Next Steps

- Integrate with backend review submission endpoint
- Set up admin dashboard for flagged reviews
- Create automated reports for hotel satisfaction trends
- Implement email notifications for extremely negative reviews
- Add sentiment analysis to existing historical reviews (batch processing)

## Support

For issues or questions:
- Check logs: `backend-ai/logs/`
- Review test results: `python backend-ai/test_sentiment_standalone.py`
- API documentation: `http://localhost:8000/docs`
