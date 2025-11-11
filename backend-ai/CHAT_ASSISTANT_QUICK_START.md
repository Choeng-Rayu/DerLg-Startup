# Chat Assistant Quick Start Guide

## Overview

The DerLg AI Chat Assistant provides intelligent, context-aware travel recommendations for Cambodia using either OpenAI GPT-4 (production) or DeepSeek (testing).

## Quick Setup

### 1. Configure Environment

Edit `backend-ai/.env`:

```bash
# For Testing (DeepSeek)
MODEL_USED=DEEPSEEK
DEEPSEEK_API_KEY=sk-1d6ba5f959c14324b157e1df043bcf65

# For Production (GPT-4)
MODEL_USED=GPT
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Start the Server

```bash
cd backend-ai
python3 main.py
```

Server runs on: `http://localhost:8000`

### 3. Test the Configuration

```bash
python3 test_chat_config.py
```

## API Usage

### Endpoint

**POST** `/api/chat`

### Basic Request (Non-streaming)

```json
{
  "message": "I want to visit Angkor Wat",
  "session_id": "user-123-session-1",
  "conversation_history": [],
  "stream": false
}
```

### Response

```json
{
  "success": true,
  "response": "Angkor Wat is Cambodia's most iconic temple...",
  "session_id": "user-123-session-1"
}
```

### Streaming Request

```json
{
  "message": "Tell me about Khmer New Year",
  "session_id": "user-123-session-1",
  "conversation_history": [],
  "stream": true
}
```

Returns: `text/event-stream` with real-time chunks

### With Conversation History

```json
{
  "message": "How much does it cost?",
  "session_id": "user-123-session-1",
  "conversation_history": [
    {
      "role": "user",
      "content": "I want to visit Angkor Wat"
    },
    {
      "role": "assistant",
      "content": "Angkor Wat is Cambodia's most iconic temple..."
    }
  ],
  "stream": false
}
```

### With Context

```json
{
  "message": "What hotels do you recommend?",
  "session_id": "user-123-session-1",
  "conversation_history": [],
  "context": {
    "available_hotels": [
      {
        "name": "Angkor Palace Resort",
        "location": "Siem Reap",
        "price_per_night": 80
      }
    ],
    "user_preferences": {
      "budget": 500,
      "interests": ["temples", "culture"],
      "travel_dates": "December 2024",
      "group_size": 2
    }
  },
  "stream": false
}
```

## Language Support

The assistant automatically detects and responds in:
- **English**: Default language
- **Khmer**: Detected from Khmer script (ភាសាខ្មែរ)
- **Chinese**: Detected from Chinese characters (中文)

### Examples

**English:**
```json
{"message": "What's the best time to visit Cambodia?"}
```

**Chinese:**
```json
{"message": "什么时候去柬埔寨最好？"}
```

**Khmer:**
```json
{"message": "តើពេលណាល្អបំផុតក្នុងការទៅកម្ពុជា?"}
```

## Python Usage

### Basic Chat

```python
from models.chat_model import ChatAssistant

assistant = ChatAssistant()

# Non-streaming
response = await assistant.chat(
    user_message="I want to visit Cambodia",
    conversation_history=[]
)
print(response)
```

### Streaming Chat

```python
async for chunk in assistant.chat_stream(
    user_message="Tell me about Angkor Wat",
    conversation_history=[]
):
    print(chunk, end="", flush=True)
```

### With Context

```python
response = await assistant.chat(
    user_message="What do you recommend?",
    conversation_history=[],
    context={
        "user_preferences": {
            "budget": 500,
            "interests": ["temples", "culture"]
        },
        "available_hotels": [
            {"name": "Angkor Palace", "price_per_night": 80}
        ]
    }
)
```

## cURL Examples

### Non-streaming

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to visit Cambodia for 3 days",
    "session_id": "test-session",
    "conversation_history": [],
    "stream": false
  }'
```

### Streaming

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about Angkor Wat",
    "session_id": "test-session",
    "conversation_history": [],
    "stream": true
  }'
```

## Context Options

### Available Hotels

```json
"available_hotels": [
  {
    "name": "Hotel Name",
    "location": "City",
    "price_per_night": 80,
    "rating": 4.5
  }
]
```

### Available Tours

```json
"available_tours": [
  {
    "name": "Tour Name",
    "duration": "Full day",
    "price": 45,
    "difficulty": "easy"
  }
]
```

### Upcoming Events

```json
"upcoming_events": [
  {
    "name": "Event Name",
    "date": "November 2024",
    "location": "Phnom Penh"
  }
]
```

### User Preferences

```json
"user_preferences": {
  "budget": 500,
  "interests": ["temples", "culture", "adventure"],
  "travel_dates": "December 2024",
  "group_size": 2
}
```

### Booking History

```json
"booking_history": [
  {
    "hotel": "Previous Hotel",
    "date": "2024-01-15",
    "rating": 5
  }
]
```

## Model Switching

### Switch to DeepSeek (Testing)

```bash
# In .env
MODEL_USED=DEEPSEEK
```

Restart server:
```bash
python3 main.py
```

### Switch to GPT-4 (Production)

```bash
# In .env
MODEL_USED=GPT
OPENAI_API_KEY=your_actual_key
```

Restart server:
```bash
python3 main.py
```

## Testing

### Run Configuration Tests

```bash
python3 test_chat_config.py
```

Tests:
- ✓ Settings configuration
- ✓ Chat assistant initialization
- ✓ System prompt content
- ✓ Language detection
- ✓ Context formatting
- ✓ Message building

### Run Integration Tests (requires API credits)

```bash
python3 test_chat_integration.py
```

Tests:
- ✓ Basic conversation
- ✓ Streaming responses
- ✓ Context maintenance
- ✓ Multi-language support

## System Prompt Features

The assistant knows about:

### Destinations
- Siem Reap (Angkor Wat, Angkor Thom, Ta Prohm)
- Phnom Penh (Royal Palace, National Museum)
- Sihanoukville & Islands
- Battambang, Kampot, Kep
- Mondulkiri, Ratanakiri

### Cultural Events
- Khmer New Year (April)
- Water Festival (November)
- Pchum Ben (September/October)
- Royal Ploughing Ceremony (May)

### Payment Options
- Deposit: 50-70% upfront
- Milestone: 50%/25%/25%
- Full payment: 5% discount + bonuses

### Policies
- Cancellation: Full refund 30+ days, 50% 7-30 days
- Escrow protection on all payments
- Free airport pickup with full payment

## Troubleshooting

### "Insufficient Balance" Error

DeepSeek API key has no credits. Switch to GPT-4:
```bash
MODEL_USED=GPT
OPENAI_API_KEY=your_key
```

### "API Key Not Set" Error

Check `.env` file:
```bash
# For DeepSeek
DEEPSEEK_API_KEY=sk-1d6ba5f959c14324b157e1df043bcf65

# For GPT-4
OPENAI_API_KEY=your_key
```

### Import Errors

Install dependencies:
```bash
pip install -r requirements.txt
```

### Server Won't Start

Check port 8000 is available:
```bash
lsof -i :8000
```

## Best Practices

1. **Use Streaming for Better UX**: Enable streaming for real-time responses
2. **Maintain Context**: Pass conversation history for coherent conversations
3. **Provide Context**: Include available options for better recommendations
4. **Limit History**: Keep last 10 messages to manage token usage
5. **Handle Errors**: Implement retry logic for API failures
6. **Cache Responses**: Cache common queries to reduce API calls

## Integration Examples

### Frontend (React/Next.js)

```javascript
// Non-streaming
const response = await fetch('http://localhost:8000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    session_id: sessionId,
    conversation_history: history,
    stream: false
  })
});
const data = await response.json();
console.log(data.response);

// Streaming
const response = await fetch('http://localhost:8000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    session_id: sessionId,
    conversation_history: history,
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  console.log(chunk);
}
```

### Backend (Node.js)

```javascript
const axios = require('axios');

// Non-streaming
const response = await axios.post('http://localhost:8000/api/chat', {
  message: 'I want to visit Cambodia',
  session_id: 'user-123',
  conversation_history: [],
  stream: false
});
console.log(response.data.response);
```

## Support

For issues or questions:
1. Check `TASK_32_SUMMARY.md` for detailed implementation
2. Run `test_chat_config.py` to verify setup
3. Review logs in console output
4. Check `.env` configuration

## Resources

- OpenAI API Docs: https://platform.openai.com/docs
- DeepSeek API Docs: https://platform.deepseek.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com
- Project README: `backend-ai/README.md`
