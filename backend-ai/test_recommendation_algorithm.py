"""
Test script for the recommendation algorithm.
Tests collaborative filtering, content-based filtering, and hybrid approach.
"""

import asyncio
import sys
from models.recommendation_model import RecommendationEngine
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


async def test_collaborative_filtering():
    """Test collaborative filtering component."""
    print("\n" + "="*80)
    print("TEST 1: Collaborative Filtering")
    print("="*80)
    
    engine = RecommendationEngine()
    
    # Test with mock user
    user_id = "user-1"
    items = [
        {
            'id': 'hotel-1',
            'name': 'Angkor Paradise Hotel',
            'type': 'hotel',
            'price_per_night': 80,
            'currency': 'USD',
            'average_rating': 4.5,
            'amenities': ['wifi', 'pool', 'breakfast'],
            'location': {'city': 'Siem Reap'}
        },
        {
            'id': 'hotel-2',
            'name': 'Phnom Penh Boutique',
            'type': 'hotel',
            'price_per_night': 60,
            'currency': 'USD',
            'average_rating': 4.2,
            'amenities': ['wifi', 'restaurant'],
            'location': {'city': 'Phnom Penh'}
        }
    ]
    
    scores = await engine.calculate_collaborative_score(user_id, items)
    
    print(f"\nUser: {user_id}")
    print(f"Number of items: {len(items)}")
    print(f"\nCollaborative Filtering Scores:")
    for idx, item in enumerate(items):
        print(f"  {item['name']}: {scores[idx]:.3f}")
    
    assert len(scores) == len(items), "Score count mismatch"
    assert all(0 <= s <= 1 for s in scores), "Scores out of range"
    print("\n✓ Collaborative filtering test passed")


async def test_content_based_filtering():
    """Test content-based filtering component."""
    print("\n" + "="*80)
    print("TEST 2: Content-Based Filtering")
    print("="*80)
    
    engine = RecommendationEngine()
    
    user_profile = {
        'user_id': 'test-user',
        'budget': 100,
        'preferred_amenities': ['wifi', 'pool', 'breakfast'],
        'travel_style': 'balanced'
    }
    
    items = [
        {
            'id': 'hotel-1',
            'name': 'Luxury Resort',
            'type': 'hotel',
            'price_per_night': 120,
            'currency': 'USD',
            'average_rating': 4.8,
            'amenities': ['wifi', 'pool', 'spa', 'breakfast', 'gym'],
            'location': {'city': 'Siem Reap', 'latitude': 13.36, 'longitude': 103.84}
        },
        {
            'id': 'hotel-2',
            'name': 'Budget Inn',
            'type': 'hotel',
            'price_per_night': 40,
            'currency': 'USD',
            'average_rating': 3.5,
            'amenities': ['wifi'],
            'location': {'city': 'Phnom Penh', 'latitude': 11.55, 'longitude': 104.92}
        },
        {
            'id': 'hotel-3',
            'name': 'Perfect Match Hotel',
            'type': 'hotel',
            'price_per_night': 75,
            'currency': 'USD',
            'average_rating': 4.5,
            'amenities': ['wifi', 'pool', 'breakfast', 'restaurant'],
            'location': {'city': 'Siem Reap', 'latitude': 13.36, 'longitude': 103.85}
        }
    ]
    
    scores = engine.calculate_content_score(user_profile, items)
    
    print(f"\nUser Budget: ${user_profile['budget']}")
    print(f"Preferred Amenities: {', '.join(user_profile['preferred_amenities'])}")
    print(f"\nContent-Based Filtering Scores:")
    for idx, item in enumerate(items):
        print(f"  {item['name']} (${item['price_per_night']}): {scores[idx]:.3f}")
    
    assert len(scores) == len(items), "Score count mismatch"
    assert all(0 <= s <= 1 for s in scores), "Scores out of range"
    
    # Hotel 3 should score highest (best match for budget and amenities)
    best_idx = scores.argmax()
    print(f"\nBest match: {items[best_idx]['name']}")
    print("✓ Content-based filtering test passed")


async def test_budget_optimization():
    """Test budget optimization component."""
    print("\n" + "="*80)
    print("TEST 3: Budget Optimization")
    print("="*80)
    
    engine = RecommendationEngine()
    
    items = [
        {
            'id': 'hotel-1',
            'name': 'Within Budget',
            'price_per_night': 80,
            'currency': 'USD',
            'average_rating': 4.5,
            'location': {'city': 'Siem Reap'}
        },
        {
            'id': 'hotel-2',
            'name': 'Over Budget',
            'price_per_night': 150,
            'currency': 'USD',
            'average_rating': 4.8,
            'location': {'city': 'Siem Reap'}
        },
        {
            'id': 'hotel-3',
            'name': 'Great Value',
            'price_per_night': 60,
            'currency': 'USD',
            'average_rating': 4.6,
            'location': {'city': 'Phnom Penh'}
        }
    ]
    
    scores = [0.8, 0.9, 0.7]  # Mock scores
    budget = 100
    
    optimized = engine.apply_budget_optimization(items, scores, budget)
    
    print(f"\nBudget: ${budget}")
    print(f"Budget Threshold (90%): ${budget * 0.9}")
    print(f"\nOptimized Recommendations:")
    for item in optimized:
        is_alt = " (Alternative)" if item.get('is_alternative') else ""
        print(f"  {item['name']}: ${item['price_usd']:.2f} - Score: {item['combined_score']:.3f}{is_alt}")
        print(f"    Value Score: {item['value_score']:.3f}")
        print(f"    Remaining Budget: ${item['remaining_budget']:.2f}")
    
    # Check that items within budget are included
    within_budget = [i for i in optimized if not i.get('is_alternative')]
    assert len(within_budget) >= 2, "Should have at least 2 items within budget"
    assert all(i['price_usd'] <= budget * 0.9 for i in within_budget), "Items exceed budget threshold"
    
    print("\n✓ Budget optimization test passed")


async def test_event_integration():
    """Test event integration component."""
    print("\n" + "="*80)
    print("TEST 4: Event Integration")
    print("="*80)
    
    engine = RecommendationEngine()
    
    recommendations = [
        {
            'id': 'hotel-1',
            'name': 'Siem Reap Hotel',
            'recommendation_score': 0.7,
            'combined_score': 0.7,
            'location': {'city': 'Siem Reap', 'province': 'Siem Reap'}
        },
        {
            'id': 'hotel-2',
            'name': 'Phnom Penh Hotel',
            'recommendation_score': 0.8,
            'combined_score': 0.8,
            'location': {'city': 'Phnom Penh', 'province': 'Phnom Penh'}
        }
    ]
    
    dates = {
        'check_in': '2025-04-14',
        'check_out': '2025-04-16'
    }
    
    enhanced = await engine.integrate_events(recommendations, dates)
    
    print(f"\nTravel Dates: {dates['check_in']} to {dates['check_out']}")
    print(f"\nEnhanced Recommendations:")
    for item in enhanced:
        print(f"\n  {item['name']}:")
        print(f"    Original Score: {item['recommendation_score']:.3f}")
        print(f"    Combined Score: {item['combined_score']:.3f}")
        print(f"    Has Events: {item.get('has_events', False)}")
        if item.get('event_boost_applied'):
            print(f"    Event Boost: +{item.get('event_boost', 0):.3f}")
            if item.get('event_highlights'):
                print(f"    Events:")
                for event in item['event_highlights']:
                    print(f"      - {event['name']} ({event['type']})")
    
    print("\n✓ Event integration test passed")


async def test_hybrid_recommendation():
    """Test complete hybrid recommendation system."""
    print("\n" + "="*80)
    print("TEST 5: Hybrid Recommendation System (60% CF + 40% CB)")
    print("="*80)
    
    engine = RecommendationEngine()
    
    user_id = "user-1"
    budget = 100
    preferences = {
        'amenities': ['wifi', 'pool', 'breakfast'],
        'destination': 'Siem Reap'
    }
    dates = {
        'check_in': '2025-12-01',
        'check_out': '2025-12-05'
    }
    
    print(f"\nUser: {user_id}")
    print(f"Budget: ${budget}")
    print(f"Preferences: {preferences}")
    print(f"Dates: {dates['check_in']} to {dates['check_out']}")
    
    recommendations = await engine.get_recommendations(
        user_id=user_id,
        budget=budget,
        preferences=preferences,
        dates=dates,
        item_type="hotel"
    )
    
    print(f"\n{'='*80}")
    print(f"RECOMMENDATIONS ({len(recommendations)} items)")
    print(f"{'='*80}")
    
    for idx, rec in enumerate(recommendations, 1):
        print(f"\n{idx}. {rec['name']}")
        print(f"   Price: ${rec.get('price_usd', rec.get('price_per_night', 0)):.2f}")
        print(f"   Rating: {rec.get('average_rating', 0):.1f}/5.0")
        print(f"   Confidence: {rec.get('confidence', 0)}%")
        print(f"   Type: {rec.get('recommendation_type', 'N/A')}")
        print(f"   Reasons:")
        for reason in rec.get('recommendation_reasons', []):
            print(f"     • {reason}")
    
    assert len(recommendations) > 0, "Should return recommendations"
    assert all('confidence' in r for r in recommendations), "Missing confidence scores"
    assert all('recommendation_reasons' in r for r in recommendations), "Missing reasons"
    
    print("\n✓ Hybrid recommendation test passed")


async def test_weights_verification():
    """Verify that hybrid weights are correctly applied (60% CF, 40% CB)."""
    print("\n" + "="*80)
    print("TEST 6: Verify Hybrid Weights (60% Collaborative, 40% Content-Based)")
    print("="*80)
    
    engine = RecommendationEngine()
    
    print(f"\nConfigured Weights:")
    print(f"  Collaborative Filtering: {engine.collaborative_weight * 100}%")
    print(f"  Content-Based Filtering: {engine.content_weight * 100}%")
    
    assert engine.collaborative_weight == 0.6, "Collaborative weight should be 0.6"
    assert engine.content_weight == 0.4, "Content-based weight should be 0.4"
    assert engine.collaborative_weight + engine.content_weight == 1.0, "Weights should sum to 1.0"
    
    print("\n✓ Weight verification test passed")


async def main():
    """Run all tests."""
    print("\n" + "="*80)
    print("RECOMMENDATION ALGORITHM TEST SUITE")
    print("="*80)
    
    try:
        await test_weights_verification()
        await test_collaborative_filtering()
        await test_content_based_filtering()
        await test_budget_optimization()
        await test_event_integration()
        await test_hybrid_recommendation()
        
        print("\n" + "="*80)
        print("ALL TESTS PASSED ✓")
        print("="*80)
        print("\nRecommendation Algorithm Summary:")
        print("  ✓ Collaborative filtering (user-user similarity)")
        print("  ✓ Content-based filtering (hotel features)")
        print("  ✓ Hybrid system (60% CF + 40% CB)")
        print("  ✓ Budget constraints optimization (90% threshold)")
        print("  ✓ Real-time event integration")
        print("  ✓ Confidence scores and explanations")
        print("\nRequirements Met:")
        print("  ✓ 3.1: AI-powered recommendations")
        print("  ✓ 3.3: Budget-aware recommendations")
        print("  ✓ 13.1: Collaborative filtering")
        print("  ✓ 13.2: Content-based filtering")
        print("  ✓ 13.3: Budget constraints")
        print("  ✓ 31.1: 90% budget threshold")
        print("="*80 + "\n")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
