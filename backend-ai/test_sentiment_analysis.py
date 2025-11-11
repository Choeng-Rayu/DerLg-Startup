"""Test script for sentiment analysis functionality."""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import directly without going through __init__
from models.sentiment_model import SentimentAnalyzer


async def test_sentiment_analysis():
    """Test the sentiment analysis implementation."""
    
    print("=" * 60)
    print("Testing Sentiment Analysis Implementation")
    print("=" * 60)
    
    # Initialize analyzer
    analyzer = SentimentAnalyzer()
    
    # Test cases with different sentiments
    test_reviews = [
        {
            "text": "This hotel was absolutely amazing! The staff was incredibly friendly and helpful. The room was spotless and very comfortable. The location was perfect, close to all attractions. Excellent value for money!",
            "expected": "positive"
        },
        {
            "text": "The hotel was okay. Nothing special but nothing terrible either. Average service and decent rooms.",
            "expected": "neutral"
        },
        {
            "text": "Terrible experience! The room was dirty and smelled bad. Staff was rude and unhelpful. The location was inconvenient. Completely overpriced for what you get. Would not recommend!",
            "expected": "negative"
        },
        {
            "text": "Great location near the city center. The breakfast was delicious and the pool was clean. However, the wifi was slow and the room was a bit cramped.",
            "expected": "positive"
        },
        {
            "text": "Worst hotel ever! Disgusting conditions, awful service, and unacceptable cleanliness. This place should be shut down!",
            "expected": "negative"
        }
    ]
    
    print("\n" + "=" * 60)
    print("Test 1: Overall Sentiment Classification")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for i, test in enumerate(test_reviews, 1):
        print(f"\nTest Case {i}:")
        print(f"Review: {test['text'][:80]}...")
        print(f"Expected: {test['expected']}")
        
        result = await analyzer.analyze_review(test['text'])
        
        print(f"Score: {result['score']:.3f}")
        print(f"Classification: {result['classification']}")
        print(f"Flagged: {result['flagged']}")
        
        if result['classification'] == test['expected']:
            print("✓ PASSED")
            passed += 1
        else:
            print("✗ FAILED")
            failed += 1
    
    print(f"\nOverall Sentiment Tests: {passed} passed, {failed} failed")
    
    # Test topic extraction
    print("\n" + "=" * 60)
    print("Test 2: Topic-Specific Sentiment Extraction")
    print("=" * 60)
    
    topic_review = """
    The hotel had excellent service with very friendly staff. 
    However, the cleanliness was poor - the room was dirty and the bathroom was filthy.
    The location was perfect, right in the city center.
    The food at the restaurant was delicious but overpriced.
    """
    
    print(f"\nReview: {topic_review.strip()}")
    
    result = await analyzer.analyze_review(topic_review)
    
    print(f"\nOverall Score: {result['score']:.3f}")
    print(f"Classification: {result['classification']}")
    print("\nTopic-Specific Sentiments:")
    
    for topic, score in result['topics'].items():
        classification = "positive" if score >= 0.6 else "neutral" if score >= 0.4 else "negative"
        print(f"  - {topic.capitalize()}: {score:.3f} ({classification})")
    
    # Test flagging of extremely negative reviews
    print("\n" + "=" * 60)
    print("Test 3: Flagging Extremely Negative Reviews")
    print("=" * 60)
    
    extremely_negative = "Absolutely horrible! Disgusting, dirty, terrible service, awful experience. The worst hotel I've ever stayed at!"
    
    print(f"\nReview: {extremely_negative}")
    
    result = await analyzer.analyze_review(extremely_negative)
    
    print(f"\nScore: {result['score']:.3f}")
    print(f"Classification: {result['classification']}")
    print(f"Flagged for Admin: {result['flagged']}")
    
    if result['flagged'] and result['score'] < 0.3:
        print("✓ PASSED - Review correctly flagged")
    else:
        print("✗ FAILED - Review should be flagged")
    
    # Test batch analysis
    print("\n" + "=" * 60)
    print("Test 4: Batch Analysis")
    print("=" * 60)
    
    batch_reviews = [
        "Great hotel, loved it!",
        "Terrible experience, very disappointed.",
        "It was okay, nothing special."
    ]
    
    print(f"\nAnalyzing {len(batch_reviews)} reviews in batch...")
    
    batch_results = await analyzer.batch_analyze(batch_reviews)
    
    print(f"\nResults:")
    for i, (review, result) in enumerate(zip(batch_reviews, batch_results), 1):
        print(f"{i}. '{review}' -> {result['classification']} (score: {result['score']:.3f})")
    
    # Test edge cases
    print("\n" + "=" * 60)
    print("Test 5: Edge Cases")
    print("=" * 60)
    
    edge_cases = [
        ("", "Empty string"),
        ("   ", "Whitespace only"),
        ("Good", "Single word"),
        ("a" * 1000, "Very long text")
    ]
    
    for text, description in edge_cases:
        print(f"\nTesting: {description}")
        try:
            result = await analyzer.analyze_review(text)
            print(f"✓ Handled successfully - Score: {result['score']:.3f}, Classification: {result['classification']}")
        except Exception as e:
            print(f"✗ Error: {e}")
    
    print("\n" + "=" * 60)
    print("All Tests Completed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_sentiment_analysis())
