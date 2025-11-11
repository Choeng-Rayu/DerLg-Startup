"""
Comprehensive test script for all AI API endpoints.
Tests all endpoints defined in task 35.
"""

import asyncio
import sys
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, '.')

from routes.recommend import get_recommendations, RecommendationRequest
from routes.chat import chat_with_ai, ChatRequest, ChatMessage
from routes.analyze import analyze_review, ReviewAnalysisRequest
from routes.health import health_check
from routes.itinerary import generate_itinerary, ItineraryRequest


async def test_health_endpoint():
    """Test GET /api/health endpoint."""
    print("\n" + "="*60)
    print("Testing GET /api/health")
    print("="*60)
    
    try:
        response = await health_check()
        print(f"✓ Status: {response.status}")
        print(f"✓ Environment: {response.environment}")
        print(f"✓ Model: {response.model_used}")
        print(f"✓ Version: {response.version}")
        print(f"✓ Timestamp: {response.timestamp}")
        return True
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False


async def test_recommend_endpoint():
    """Test POST /api/recommend endpoint."""
    print("\n" + "="*60)
    print("Testing POST /api/recommend")
    print("="*60)
    
    try:
        request = RecommendationRequest(
            user_id="test_user_123",
            budget=500.0,
            destination="Siem Reap",
            check_in=(datetime.now() + timedelta(days=30)).isoformat(),
            check_out=(datetime.now() + timedelta(days=33)).isoformat(),
            preferences={
                "amenities": ["wifi", "pool"],
                "rating": 4.0
            }
        )
        
        response = await get_recommendations(request)
        print(f"✓ Success: {response.success}")
        print(f"✓ Total recommendations: {response.total}")
        print(f"✓ Recommendations count: {len(response.recommendations)}")
        
        if response.recommendations:
            print(f"✓ Sample recommendation: {response.recommendations[0].get('name', 'N/A')}")
        
        return True
    except Exception as e:
        print(f"✗ Recommendation endpoint failed: {e}")
        return False


async def test_chat_endpoint():
    """Test POST /api/chat endpoint."""
    print("\n" + "="*60)
    print("Testing POST /api/chat")
    print("="*60)
    
    try:
        request = ChatRequest(
            message="What are the best hotels in Siem Reap for a family vacation?",
            session_id="test_session_456",
            conversation_history=[],
            context={
                "budget": 500,
                "destination": "Siem Reap"
            },
            stream=False
        )
        
        response = await chat_with_ai(request)
        print(f"✓ Success: {response.success}")
        print(f"✓ Session ID: {response.session_id}")
        print(f"✓ Response length: {len(response.response)} characters")
        print(f"✓ Response preview: {response.response[:100]}...")
        
        return True
    except Exception as e:
        print(f"✗ Chat endpoint failed: {e}")
        return False


async def test_analyze_review_endpoint():
    """Test POST /api/analyze-review endpoint."""
    print("\n" + "="*60)
    print("Testing POST /api/analyze-review")
    print("="*60)
    
    try:
        # Test positive review
        request = ReviewAnalysisRequest(
            review_text="Amazing hotel! The staff was incredibly friendly and helpful. "
                       "The room was spotlessly clean and the location was perfect. "
                       "Great value for money. Highly recommend!"
        )
        
        response = await analyze_review(request)
        print(f"✓ Success: {response.success}")
        print(f"✓ Sentiment score: {response.score:.2f}")
        print(f"✓ Classification: {response.classification}")
        print(f"✓ Flagged: {response.flagged}")
        print(f"✓ Topics analyzed: {len(response.topics)}")
        
        if response.topics:
            print(f"✓ Sample topics: {list(response.topics.keys())[:3]}")
        
        return True
    except Exception as e:
        print(f"✗ Analyze review endpoint failed: {e}")
        return False


async def test_itinerary_endpoint():
    """Test POST /api/itinerary endpoint."""
    print("\n" + "="*60)
    print("Testing POST /api/itinerary")
    print("="*60)
    
    try:
        start_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=33)).strftime("%Y-%m-%d")
        
        request = ItineraryRequest(
            destination="Siem Reap",
            start_date=start_date,
            end_date=end_date,
            budget=800.0,
            preferences=["cultural", "adventure"],
            group_size=2,
            hotels=[
                {
                    "id": "hotel_1",
                    "name": "Angkor Palace Resort",
                    "price_per_night": 120,
                    "rating": 4.5
                }
            ],
            tours=[
                {
                    "id": "tour_1",
                    "name": "Angkor Wat Sunrise Tour",
                    "price": 50,
                    "duration": "4 hours"
                }
            ]
        )
        
        response = await generate_itinerary(request)
        print(f"✓ Success: {response.success}")
        print(f"✓ Itinerary generated: {bool(response.itinerary)}")
        
        if response.itinerary:
            print(f"✓ Days planned: {response.itinerary.get('total_days', 'N/A')}")
            print(f"✓ Total cost: ${response.itinerary.get('total_cost', 'N/A')}")
            print(f"✓ Daily activities: {len(response.itinerary.get('daily_plans', []))}")
        
        return True
    except Exception as e:
        print(f"✗ Itinerary endpoint failed: {e}")
        return False


async def run_all_tests():
    """Run all endpoint tests."""
    print("\n" + "="*60)
    print("AI API ENDPOINTS COMPREHENSIVE TEST")
    print("Task 35: Create AI API endpoints")
    print("="*60)
    
    results = {
        "health": await test_health_endpoint(),
        "recommend": await test_recommend_endpoint(),
        "chat": await test_chat_endpoint(),
        "analyze_review": await test_analyze_review_endpoint(),
        "itinerary": await test_itinerary_endpoint()
    }
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for endpoint, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{endpoint:20s}: {status}")
    
    total = len(results)
    passed = sum(results.values())
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓ All endpoints are working correctly!")
        print("\nImplemented endpoints:")
        print("  - POST /api/recommend - Personalized recommendations")
        print("  - POST /api/chat - Conversational AI")
        print("  - POST /api/itinerary - Itinerary generation")
        print("  - POST /api/analyze-review - Sentiment analysis")
        print("  - GET /api/health - Health checks")
        return True
    else:
        print(f"\n✗ {total - passed} test(s) failed")
        return False


if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
