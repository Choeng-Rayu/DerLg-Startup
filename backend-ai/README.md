# DerLg AI Recommendation Engine

AI-powered recommendation and chat assistant service for the DerLg Cambodia tourism platform.

## Overview

This FastAPI microservice provides:
- **Personalized Recommendations**: Hybrid recommendation system using collaborative and content-based filtering
- **AI Chat Assistant**: Conversational interface using ChatGPT-4 or DeepSeek
- **Sentiment Analysis**: Review analysis and topic extraction
- **Itinerary Generation**: Intelligent trip planning with budget optimization

## Technology Stack

- **Framework**: FastAPI 0.109.0
- **Server**: Uvicorn with async support
- **AI Models**:
  - OpenAI GPT-4 (production)
  - DeepSeek (testing/development)
  - scikit-learn for recommendations
  - sentence-transformers for sentiment analysis
- **Database**: MySQL via aiomysql
- **Python**: 3.10+

## Project Structure

```
backend-ai/
├── config/              # Configuration and settings
│   ├── __init__.py
│   └── settings.py      # Environment-based settings
├── models/              # AI models
│   ├── __init__.py
│   ├── recommendation_model.py
│   ├── sentiment_model.py
│   └── chat_model.py
├── routes/              # API endpoints
│   ├── __init__.py
│   ├── recommend.py     # Recommendation endpoints
│   ├── chat.py          # Chat assistant endpoints
│   ├── analyze.py       # Sentiment analysis endpoints
│   └── health.py        # Health check endpoint
├── utils/               # Utility functions
│   ├── __init__.py
│   ├── data_processor.py
│   ├── feature_extractor.py
│   └── logger.py
├── main.py              # Application entry point
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
└── README.md           # This file
```

## Setup

### 1. Create Virtual Environment

```bash
cd backend-ai
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# For testing with DeepSeek
MODEL_USED=DEEPSEEK
DEEPSEEK_API_KEY=sk-1d6ba5f959c14324b157e1df043bcf65

# For production with GPT-4
MODEL_USED=GPT
OPENAI_API_KEY=your_openai_api_key_here

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=derlg_tourism
DB_USER=root
DB_PASSWORD=your_password
```

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
python main.py
```

**Production mode:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Health Check
```
GET /api/health
```

### Recommendations
```
POST /api/recommend
{
  "user_id": "user-123",
  "budget": 500,
  "destination": "Siem Reap",
  "check_in": "2025-12-01",
  "check_out": "2025-12-05",
  "preferences": {
    "amenities": ["wifi", "pool"],
    "rating_min": 4.0
  }
}
```

### Chat Assistant
```
POST /api/chat
{
  "message": "I want to visit Angkor Wat",
  "session_id": "session-123",
  "conversation_history": [],
  "stream": false
}
```

### Sentiment Analysis
```
POST /api/analyze-review
{
  "review_text": "Great hotel with excellent service!"
}
```

## Model Configuration

### Using DeepSeek (Testing)

Set in `.env`:
```env
MODEL_USED=DEEPSEEK
DEEPSEEK_API_KEY=sk-1d6ba5f959c14324b157e1df043bcf65
```

### Using GPT-4 (Production)

Set in `.env`:
```env
MODEL_USED=GPT
OPENAI_API_KEY=your_openai_api_key_here
```

## Development

### Adding New Routes

1. Create a new file in `routes/`
2. Define your router and endpoints
3. Import and register in `main.py`

### Adding New Models

1. Create a new file in `models/`
2. Implement your model class
3. Import in `models/__init__.py`

### Testing

```bash
# Run with test configuration
MODEL_USED=DEEPSEEK python main.py
```

## Integration with Backend

The AI Engine integrates with the main Node.js backend:

```typescript
// Example: Call from Node.js backend
const response = await fetch('http://localhost:8000/api/recommend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: userId,
    budget: 500,
    preferences: userPreferences
  })
});

const recommendations = await response.json();
```

## Deployment

### Digital Ocean Droplet

1. Create Ubuntu 22.04 droplet (8GB RAM, 4 vCPUs recommended)
2. Install Python 3.10+
3. Clone repository and install dependencies
4. Configure environment variables
5. Run with systemd or supervisor

### Using systemd

Create `/etc/systemd/system/ai-engine.service`:

```ini
[Unit]
Description=DerLg AI Engine
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/backend-ai
Environment="PATH=/var/www/backend-ai/venv/bin"
ExecStart=/var/www/backend-ai/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable ai-engine
sudo systemctl start ai-engine
```

## Performance

- Response time target: < 3 seconds for recommendations
- Chat response: < 2 seconds per message
- Streaming chat: Real-time token delivery
- Concurrent requests: Supports async processing

## Monitoring

Check service health:
```bash
curl http://localhost:8000/api/health
```

View logs:
```bash
# If using systemd
sudo journalctl -u ai-engine -f
```

## Troubleshooting

### Import Errors
```bash
# Ensure virtual environment is activated
source venv/bin/activate
pip install -r requirements.txt
```

### API Key Issues
- Verify `.env` file exists and contains valid keys
- Check MODEL_USED setting matches your API key

### Database Connection
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE derlg_tourism;`

## Future Enhancements

- [ ] Implement collaborative filtering (Task 31)
- [ ] Add ChatGPT-4 integration (Task 32)
- [ ] Implement sentiment analysis (Task 33)
- [ ] Add itinerary generation (Task 34)
- [ ] Optimize recommendation algorithm
- [ ] Add caching layer
- [ ] Implement rate limiting
- [ ] Add monitoring and metrics

## License

Proprietary - DerLg Tourism Platform
