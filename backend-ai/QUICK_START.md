# AI Engine Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Setup (First Time Only)
```bash
cd backend-ai
./setup.sh
```

This will:
- Create virtual environment
- Install all dependencies
- Create .env file
- Verify setup

### 2. Configure
Edit `.env` file:
```env
# For testing (free)
MODEL_USED=DEEPSEEK
DEEPSEEK_API_KEY=sk-1d6ba5f959c14324b157e1df043bcf65

# For production
MODEL_USED=GPT
OPENAI_API_KEY=your_openai_key_here
```

### 3. Run
```bash
source venv/bin/activate  # Activate virtual environment
python main.py            # Start server
```

Server runs at: **http://localhost:8000**

## 📚 API Documentation

Once running, visit:
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Test the Chat Assistant

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to visit Angkor Wat with a budget of $500",
    "session_id": "test-123",
    "conversation_history": []
  }'
```

## 📁 Project Structure

```
backend-ai/
├── config/       # Settings and configuration
├── models/       # AI models (recommendation, chat, sentiment)
├── routes/       # API endpoints
├── utils/        # Helper functions
└── main.py       # Application entry point
```

## 🔧 Common Commands

```bash
# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
pip install -r requirements.txt

# Run server (development)
python main.py

# Run server (production)
uvicorn main:app --host 0.0.0.0 --port 8000

# Test setup
python test_setup.py

# Deactivate virtual environment
deactivate
```

## 🐛 Troubleshooting

### Dependencies not installed?
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Import errors?
Make sure virtual environment is activated:
```bash
source venv/bin/activate
```

### API key issues?
Check `.env` file exists and contains valid keys.

## 📖 Full Documentation

See [README.md](README.md) for complete documentation.

## ✅ What's Working Now

- ✅ Health check endpoint
- ✅ Chat assistant (fully functional with GPT-4/DeepSeek)
- ✅ API structure for recommendations
- ✅ API structure for sentiment analysis

## 🔜 Coming Soon

- Recommendation algorithm (Task 31)
- Sentiment analysis implementation (Task 33)
- Itinerary generation (Task 34)

## 💡 Tips

1. **Use DeepSeek for testing** - It's free and works well
2. **Switch to GPT-4 for production** - Better quality responses
3. **Check logs** - Server logs show all requests and errors
4. **Use /docs** - Interactive API documentation is your friend

## 🆘 Need Help?

1. Check [README.md](README.md) for detailed docs
2. Run `python test_setup.py` to verify setup
3. Check server logs for error messages
4. Ensure .env file is configured correctly
