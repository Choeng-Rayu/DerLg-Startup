"""Test script for sentiment analysis API endpoint."""

import httpx
import asyncio
import json


async def test_sentiment_api():
    """Test the sentiment analysis API endpoint."""
    
    base_url = "http://localhost:8000"
    
    print("=" * 60)
    print("Testing Sentiment Analysis API Endpoint")
    print("=" * 60)
    
    async with httpx.AsyncClient() as client:
        # Test 1: Single review analysis
        print("\n" + "=" * 60)
        print("Test 1: Analyze Single Review")
        print("=" * 60)
        
        review_data = {
            "review_text": "This hotel was absolutely amazing! The staff was incredibly friendly and helpful. The room was spotless and very comfortable."
        }
        
        print(f"\nRequest: POST {base_url}/api/analyze-review")
        print(f"Body: {json.dumps(review_data, indent=2)}")
        
        try:
            response = await client.post(
                f"{base_url}/api/analyze-review",
                json=review_data,
                timeout=30.0
            )
            
            print(f"\nStatus Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("\nResponse:")
                print(json.dumps(result, indent=2))
                print("\n✓ Test 1 PASSED")
            else:
                print(f"\n✗ Test 1 FAILED: {response.text}")
                
        except Exception as e:
            print(f"\n✗ Test 1 FAILED: {e}")
        
        # Test 2: Negative review with flagging
        print("\n" + "=" * 60)
        print("Test 2: Analyze Extremely Negative Review")
        print("=" * 60)
        
        negative_review = {
            "review_text": "Worst hotel ever! Disgusting conditions, terrible service, awful experience. The room was filthy and the staff was rude."
        }
        
        print(f"\nRequest: POST {base_url}/api/analyze-review")
        print(f"Body: {json.dumps(negative_review, indent=2)}")
        
        try:
            response = await client.post(
                f"{base_url}/api/analyze-review",
                json=negative_review,
                timeout=30.0
            )
            
            print(f"\nStatus Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("\nResponse:")
                print(json.dumps(result, indent=2))
                
                if result.get("flagged"):
                    print("\n✓ Test 2 PASSED - Review correctly flagged")
                else:
                    print("\n✗ Test 2 FAILED - Review should be flagged")
            else:
                print(f"\n✗ Test 2 FAILED: {response.text}")
                
        except Exception as e:
            print(f"\n✗ Test 2 FAILED: {e}")
        
        # Test 3: Batch analysis
        print("\n" + "=" * 60)
        print("Test 3: Batch Review Analysis")
        print("=" * 60)
        
        batch_data = {
            "reviews": [
                "Great hotel, loved it!",
                "Terrible experience, very disappointed.",
                "It was okay, nothing special."
            ]
        }
        
        print(f"\nRequest: POST {base_url}/api/analyze-reviews-batch")
        print(f"Body: {json.dumps(batch_data, indent=2)}")
        
        try:
            response = await client.post(
                f"{base_url}/api/analyze-reviews-batch",
                json=batch_data,
                timeout=30.0
            )
            
            print(f"\nStatus Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("\nResponse:")
                print(json.dumps(result, indent=2))
                print("\n✓ Test 3 PASSED")
            else:
                print(f"\n✗ Test 3 FAILED: {response.text}")
                
        except Exception as e:
            print(f"\n✗ Test 3 FAILED: {e}")
        
        # Test 4: Review with topic extraction
        print("\n" + "=" * 60)
        print("Test 4: Topic Extraction")
        print("=" * 60)
        
        topic_review = {
            "review_text": "The hotel had excellent service with very friendly staff. However, the cleanliness was poor - the room was dirty. The location was perfect, right in the city center. The food was delicious but overpriced."
        }
        
        print(f"\nRequest: POST {base_url}/api/analyze-review")
        print(f"Body: {json.dumps(topic_review, indent=2)}")
        
        try:
            response = await client.post(
                f"{base_url}/api/analyze-review",
                json=topic_review,
                timeout=30.0
            )
            
            print(f"\nStatus Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("\nResponse:")
                print(json.dumps(result, indent=2))
                
                if result.get("topics") and len(result["topics"]) > 0:
                    print("\n✓ Test 4 PASSED - Topics extracted successfully")
                else:
                    print("\n✗ Test 4 FAILED - No topics extracted")
            else:
                print(f"\n✗ Test 4 FAILED: {response.text}")
                
        except Exception as e:
            print(f"\n✗ Test 4 FAILED: {e}")
    
    print("\n" + "=" * 60)
    print("API Tests Completed!")
    print("=" * 60)


if __name__ == "__main__":
    print("\nNote: Make sure the AI Engine server is running on http://localhost:8000")
    print("Start it with: uvicorn main:app --reload --port 8000\n")
    
    try:
        asyncio.run(test_sentiment_api())
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
    except Exception as e:
        print(f"\n\nError running tests: {e}")
