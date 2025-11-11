# AI Engine Integration Guide

## Overview

This guide explains how to integrate the AI Engine with the main Node.js backend and frontend applications.

## Architecture

```
┌─────────────────┐
│  Frontend       │
│  (Next.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│  Backend        │─────▶│  AI Engine      │
│  (Node.js)      │      │  (FastAPI)      │
└────────┬────────┘      └─────────────────┘
         │
         ▼
┌─────────────────┐
│  MySQL Database │
└─────────────────┘
```

## Integration Points

### 1. Backend to AI Engine

The Node.js backend acts as a proxy between the frontend and AI Engine.

#### Example: Get Recommendations

**Backend Controller** (`backend/src/controllers/ai.controller.ts`):

```typescript
import axios from 'axios';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export class AIController {
  static async getRecommendations(req: Request, res: Response) {
    try {
      const { budget, destination, checkIn, checkOut, preferences } = req.body;
      const userId = req.user.userId;

      // Call AI Engine
      const response = await axios.post(
        `${AI_ENGINE_URL}/api/recommend`,
        {
          user_id: userId,
          budget,
          destination,
          check_in: checkIn,
          check_out: checkOut,
          preferences
        },
        {
          timeout: 10000 // 10 second timeout
        }
      );

      return res.json({
        success: true,
        data: response.data
      });
    } catch (error) {
      console.error('AI recommendation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get recommendations'
      });
    }
  }

  static async chatWithAI(req: Request, res: Response) {
    try {
      const { message, sessionId, conversationHistory, context } = req.body;

      const response = await axios.post(
        `${AI_ENGINE_URL}/api/chat`,
        {
          message,
          session_id: sessionId,
          conversation_history: conversationHistory,
          context,
          stream: false
        },
        {
          timeout: 15000 // 15 second timeout for chat
        }
      );

      return res.json({
        success: true,
        data: response.data
      });
    } catch (error) {
      console.error('AI chat error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to chat with AI'
      });
    }
  }

  static async analyzeReview(req: Request, res: Response) {
    try {
      const { reviewText } = req.body;

      const response = await axios.post(
        `${AI_ENGINE_URL}/api/analyze-review`,
        {
          review_text: reviewText
        },
        {
          timeout: 10000
        }
      );

      return res.json({
        success: true,
        data: response.data
      });
    } catch (error) {
      console.error('AI sentiment analysis error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to analyze review'
      });
    }
  }
}
```

**Backend Routes** (`backend/src/routes/ai.routes.ts`):

```typescript
import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/recommend', authenticate, AIController.getRecommendations);
router.post('/chat', authenticate, AIController.chatWithAI);
router.post('/analyze-review', authenticate, AIController.analyzeReview);

export default router;
```

**Register Routes** (`backend/src/app.ts`):

```typescript
import aiRoutes from './routes/ai.routes';

app.use('/api/ai', aiRoutes);
```

### 2. Frontend to Backend

The frontend calls the backend API, which proxies to the AI Engine.

#### Example: React Component

```typescript
// frontend/src/services/aiService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const aiService = {
  async getRecommendations(params: {
    budget: number;
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    preferences?: any;
  }) {
    const response = await axios.post(
      `${API_URL}/api/ai/recommend`,
      params,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  },

  async chatWithAI(params: {
    message: string;
    sessionId: string;
    conversationHistory?: any[];
    context?: any;
  }) {
    const response = await axios.post(
      `${API_URL}/api/ai/chat`,
      params,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  }
};
```

#### Example: Chat Component

```typescript
// frontend/src/components/AIChat.tsx
'use client';

import { useState } from 'react';
import { aiService } from '@/services/aiService';

export default function AIChat() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const response = await aiService.chatWithAI({
        message,
        sessionId: 'session-' + Date.now(),
        conversationHistory: conversation
      });

      setConversation([
        ...conversation,
        { role: 'user', content: message },
        { role: 'assistant', content: response.data.response }
      ]);
      setMessage('');
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {conversation.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about Cambodia tourism..."
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

## Environment Configuration

### Backend (.env)
```env
AI_ENGINE_URL=http://localhost:8000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### AI Engine (.env)
```env
BACKEND_API_URL=http://localhost:3001/api
```

## Deployment Configuration

### Development
- Backend: http://localhost:3001
- AI Engine: http://localhost:8000
- Frontend: http://localhost:3000

### Production
- Backend: https://api.derlg.com
- AI Engine: https://ai.derlg.com
- Frontend: https://derlg.com

Update environment variables accordingly.

## Error Handling

### Backend Error Handling

```typescript
try {
  const response = await axios.post(`${AI_ENGINE_URL}/api/recommend`, data);
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNREFUSED') {
      // AI Engine is down
      return fallbackRecommendations();
    }
    if (error.response?.status === 500) {
      // AI Engine error
      console.error('AI Engine error:', error.response.data);
    }
  }
  throw error;
}
```

### Frontend Error Handling

```typescript
try {
  const recommendations = await aiService.getRecommendations(params);
  setRecommendations(recommendations.data);
} catch (error) {
  setError('Failed to get recommendations. Please try again.');
  console.error(error);
}
```

## Testing Integration

### 1. Test AI Engine Health

```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00",
  "environment": "development",
  "model_used": "DeepSeek"
}
```

### 2. Test Backend to AI Engine

```bash
# Start AI Engine
cd backend-ai
source venv/bin/activate
python main.py

# In another terminal, test backend
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "I want to visit Angkor Wat",
    "sessionId": "test-123"
  }'
```

### 3. Test Full Stack

1. Start AI Engine: `cd backend-ai && python main.py`
2. Start Backend: `cd backend && npm run dev`
3. Start Frontend: `cd frontend && npm run dev`
4. Visit: http://localhost:3000
5. Test chat or recommendations feature

## Performance Considerations

### Timeouts
- Recommendations: 10 seconds
- Chat: 15 seconds
- Sentiment Analysis: 10 seconds

### Caching
Consider caching AI responses in Redis:

```typescript
const cacheKey = `ai:recommend:${userId}:${JSON.stringify(params)}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const response = await callAIEngine(params);
await redis.setex(cacheKey, 300, JSON.stringify(response)); // 5 min cache
return response;
```

### Rate Limiting
Implement rate limiting for AI endpoints:

```typescript
import rateLimit from 'express-rate-limit';

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: 'Too many AI requests, please try again later'
});

router.post('/ai/chat', aiLimiter, authenticate, AIController.chatWithAI);
```

## Monitoring

### Health Checks

Add health check endpoint in backend:

```typescript
router.get('/ai/health', async (req, res) => {
  try {
    const response = await axios.get(`${AI_ENGINE_URL}/api/health`, {
      timeout: 5000
    });
    res.json({
      success: true,
      aiEngine: response.data
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'AI Engine unavailable'
    });
  }
});
```

### Logging

Log all AI Engine calls:

```typescript
logger.info('AI Engine request', {
  endpoint: '/api/recommend',
  userId,
  params,
  responseTime: Date.now() - startTime
});
```

## Security

### API Key Protection
Never expose AI Engine URL or keys to frontend:
- ✅ Frontend → Backend → AI Engine
- ❌ Frontend → AI Engine (direct)

### Authentication
Always authenticate users before calling AI Engine:

```typescript
router.post('/ai/chat', authenticate, AIController.chatWithAI);
```

### Input Validation
Validate all inputs before sending to AI Engine:

```typescript
const { error } = chatSchema.validate(req.body);
if (error) {
  return res.status(400).json({ error: error.details[0].message });
}
```

## Troubleshooting

### AI Engine Not Responding
1. Check if AI Engine is running: `curl http://localhost:8000/api/health`
2. Check logs: `tail -f backend-ai/logs/app.log`
3. Verify environment variables in `.env`

### Timeout Errors
1. Increase timeout in backend
2. Check AI Engine performance
3. Consider implementing queue system for long-running requests

### CORS Issues
1. Verify CORS_ORIGINS in AI Engine `.env`
2. Check backend proxy configuration
3. Ensure proper headers in requests

## Next Steps

1. Implement recommendation algorithm (Task 31)
2. Implement sentiment analysis (Task 33)
3. Add caching layer
4. Set up monitoring and alerts
5. Load testing
6. Production deployment

## Support

For issues or questions:
1. Check AI Engine logs
2. Check backend logs
3. Verify all services are running
4. Test each integration point separately
