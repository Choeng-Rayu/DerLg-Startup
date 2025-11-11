"""Standalone test script for sentiment analysis functionality."""

import asyncio
import sys
import os

# Ensure we can import from the models directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Direct import to avoid config dependencies
from typing import Dict, Any, List
from sentence_transformers import SentenceTransformer
import numpy as np
import re


class SentimentAnalyzer:
    """
    Sentiment analysis system for processing customer reviews
    and extracting insights using sentence-transformers.
    """
    
    # Topic keywords for extraction
    TOPIC_KEYWORDS = {
        "cleanliness": ["clean", "dirty", "tidy", "mess", "hygiene", "spotless", "filthy"],
        "service": ["staff", "service", "helpful", "friendly", "rude", "attentive", "professional"],
        "location": ["location", "convenient", "accessible", "nearby", "distance", "central"],
        "value": ["price", "value", "worth", "expensive", "cheap", "affordable", "overpriced"],
        "comfort": ["comfortable", "bed", "room", "spacious", "cramped", "cozy", "uncomfortable"],
        "amenities": ["wifi", "pool", "breakfast", "gym", "parking", "facilities", "amenities"],
        "food": ["food", "restaurant", "breakfast", "meal", "dining", "delicious", "tasty"]
    }
    
    # Positive and negative sentiment indicators
    POSITIVE_WORDS = [
        "excellent", "amazing", "wonderful", "great", "fantastic", "perfect",
        "beautiful", "lovely", "outstanding", "superb", "exceptional", "impressive"
    ]
    
    NEGATIVE_WORDS = [
        "terrible", "awful", "horrible", "bad", "poor", "disappointing",
        "worst", "disgusting", "unacceptable", "dirty", "rude", "uncomfortable"
    ]
    
    def __init__(self):
        """Initialize the sentiment analyzer with sentence-transformers model."""
        try:
            print("Loading sentence-transformers model...")
            # Use a lightweight model for sentiment analysis
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Pre-compute embeddings for sentiment anchors
            self.positive_embedding = self.model.encode("This is excellent, amazing, and wonderful")
            self.negative_embedding = self.model.encode("This is terrible, awful, and horrible")
            self.neutral_embedding = self.model.encode("This is okay, average, and acceptable")
            
            print("✓ Model loaded successfully")
            
        except Exception as e:
            print(f"Warning: Failed to load sentiment model: {e}")
            self.model = None
    
    async def analyze_review(self, review_text: str) -> Dict[str, Any]:
        """
        Analyze sentiment and extract topics from a review.
        
        Args:
            review_text: The review text to analyze
            
        Returns:
            Dictionary containing:
                - score: Overall sentiment score (0-1)
                - classification: positive/neutral/negative
                - topics: Topic-specific sentiment scores
                - flagged: Whether review is extremely negative (score < 0.3)
        """
        if not review_text or not review_text.strip():
            return {
                "score": 0.5,
                "classification": "neutral",
                "topics": {},
                "flagged": False
            }
        
        # Calculate overall sentiment score
        score = self._calculate_sentiment_score(review_text)
        
        # Classify sentiment
        classification = self._classify_sentiment(score)
        
        # Extract topic-specific sentiments
        topics = self._extract_topic_sentiments(review_text)
        
        # Flag extremely negative reviews
        flagged = score < 0.3
        
        return {
            "score": round(score, 3),
            "classification": classification,
            "topics": topics,
            "flagged": flagged
        }
    
    def _calculate_sentiment_score(self, text: str) -> float:
        """
        Calculate overall sentiment score using semantic similarity.
        
        Args:
            text: Review text
            
        Returns:
            Sentiment score between 0 (negative) and 1 (positive)
        """
        if not self.model:
            # Fallback to keyword-based analysis
            return self._keyword_based_sentiment(text)
        
        try:
            # Get embedding for the review
            review_embedding = self.model.encode(text)
            
            # Calculate cosine similarity with sentiment anchors
            pos_similarity = self._cosine_similarity(review_embedding, self.positive_embedding)
            neg_similarity = self._cosine_similarity(review_embedding, self.negative_embedding)
            neu_similarity = self._cosine_similarity(review_embedding, self.neutral_embedding)
            
            # Normalize similarities to get a score
            # Higher positive similarity = higher score
            # Higher negative similarity = lower score
            total_similarity = pos_similarity + neg_similarity + neu_similarity
            
            if total_similarity == 0:
                return 0.5
            
            # Weight the similarities
            score = (pos_similarity * 1.0 + neu_similarity * 0.5 + neg_similarity * 0.0) / total_similarity
            
            # Adjust with keyword analysis for better accuracy
            keyword_score = self._keyword_based_sentiment(text)
            
            # Combine both approaches (70% semantic, 30% keyword)
            final_score = 0.7 * score + 0.3 * keyword_score
            
            return max(0.0, min(1.0, final_score))
            
        except Exception as e:
            print(f"Error in sentiment calculation: {e}")
            return self._keyword_based_sentiment(text)
    
    def _keyword_based_sentiment(self, text: str) -> float:
        """
        Fallback keyword-based sentiment analysis.
        
        Args:
            text: Review text
            
        Returns:
            Sentiment score between 0 and 1
        """
        text_lower = text.lower()
        
        # Count positive and negative words
        positive_count = sum(1 for word in self.POSITIVE_WORDS if word in text_lower)
        negative_count = sum(1 for word in self.NEGATIVE_WORDS if word in text_lower)
        
        # Calculate score
        total_sentiment_words = positive_count + negative_count
        
        if total_sentiment_words == 0:
            return 0.5  # Neutral if no sentiment words found
        
        score = positive_count / total_sentiment_words
        
        return score
    
    def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two vectors.
        
        Args:
            vec1: First vector
            vec2: Second vector
            
        Returns:
            Cosine similarity score
        """
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
    
    def _classify_sentiment(self, score: float) -> str:
        """
        Classify sentiment based on score.
        
        Args:
            score: Sentiment score (0-1)
            
        Returns:
            Classification: positive/neutral/negative
        """
        if score >= 0.6:
            return "positive"
        elif score >= 0.4:
            return "neutral"
        else:
            return "negative"
    
    def _extract_topic_sentiments(self, review_text: str) -> Dict[str, float]:
        """
        Extract sentiment scores for specific topics.
        
        Args:
            review_text: Full review text
            
        Returns:
            Dictionary of topic-specific sentiment scores
        """
        topics = {}
        sentences = self._split_into_sentences(review_text)
        
        for topic, keywords in self.TOPIC_KEYWORDS.items():
            # Find sentences mentioning this topic
            topic_sentences = []
            for sentence in sentences:
                sentence_lower = sentence.lower()
                if any(keyword in sentence_lower for keyword in keywords):
                    topic_sentences.append(sentence)
            
            # Calculate sentiment for topic-specific sentences
            if topic_sentences:
                topic_text = " ".join(topic_sentences)
                topic_score = self._calculate_sentiment_score(topic_text)
                topics[topic] = round(topic_score, 3)
        
        return topics
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """
        Split text into sentences.
        
        Args:
            text: Text to split
            
        Returns:
            List of sentences
        """
        # Simple sentence splitting
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    async def batch_analyze(
        self,
        reviews: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Analyze multiple reviews in batch for efficiency.
        
        Args:
            reviews: List of review texts
            
        Returns:
            List of sentiment analysis results
        """
        results = []
        for review in reviews:
            result = await self.analyze_review(review)
            results.append(result)
        return results


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
        ("a" * 100, "Very long text")
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
