# Itinerary Generation - Backend Integration Guide

## Overview
This guide shows how to integrate the itinerary generation API with the Node.js backend.

## Backend Integration (Node.js/Express)

### 1. Create AI Service Client

Create `backend/src/services/ai-itinerary.service.ts`:

```typescript
import axios from 'axios';
import { logger } from '../utils/logger';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export interface ItineraryRequest {
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  preferences: string[];
  group_size: number;
  hotels?: any[];
  tours?: any[];
  events?: any[];
}

export class AIItineraryService {
  async generateItinerary(params: ItineraryRequest) {
    try {
      const response = await axios.post(
        `${AI_ENGINE_URL}/api/itinerary`,
        params,
        { timeout: 30000 }
      );
      
      return response.data.itinerary;
    } catch (error) {
      logger.error('Failed to generate itinerary:', error);
      throw new Error('Itinerary generation failed');
    }
  }
}
```

### 2. Create Controller

Create `backend/src/controllers/itinerary.controller.ts`:

```typescript
import { Request, Response } from 'express';
import { AIItineraryService } from '../services/ai-itinerary.service';
import { successResponse, errorResponse } from '../utils/response';

const aiService = new AIItineraryService();

export class ItineraryController {
  async generateItinerary(req: Request, res: Response) {
    try {
      const itinerary = await aiService.generateItinerary(req.body);
      return successResponse(res, itinerary, 'Itinerary generated successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to generate itinerary', 500);
    }
  }
}
```

### 3. Add Route

Add to `backend/src/routes/ai.routes.ts`:

```typescript
import { Router } from 'express';
import { ItineraryController } from '../controllers/itinerary.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const controller = new ItineraryController();

router.post('/itinerary', authenticate, controller.generateItinerary);

export default router;
```

## Frontend Integration (React/Next.js)

### API Call

```typescript
async function generateItinerary(params: ItineraryParams) {
  const response = await fetch('/api/ai/itinerary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return response.json();
}
```

### Display Component

```tsx
function ItineraryDisplay({ itinerary }) {
  return (
    <div>
      <h2>{itinerary.title}</h2>
      <p>{itinerary.summary}</p>
      {itinerary.days.map(day => (
        <DayCard key={day.day} day={day} />
      ))}
      <CostBreakdown breakdown={itinerary.cost_breakdown} />
    </div>
  );
}
```

## Environment Configuration

Add to `backend/.env`:
```
AI_ENGINE_URL=http://localhost:8000
```

## Testing

Test the integration:
```bash
curl -X POST http://localhost:3001/api/ai/itinerary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"destination":"Siem Reap","start_date":"2025-12-01","end_date":"2025-12-03","budget":500,"preferences":["cultural"],"group_size":2}'
```
