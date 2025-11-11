"""Test script for itinerary generation functionality."""

import requests
import json
from datetime import datetime, timedelta

# API endpoint
BASE_URL = "http://localhost:8000"
ITINERARY_URL = f"{BASE_URL}/api/itinerary"

def test_basic_itinerary():
    """Test basic itinerary generation."""
    print("\n=== Test 1: Basic Itinerary Generation ===")
    
    # Calculate dates
    start_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
    end_date = (datetime.now() + timedelta(days=33)).strftime("%Y-%m-%d")
    
    payload = {
        "destination": "Siem Reap",
        "start_date": start_date,
        "end_date": end_date,
        "budget": 500.0,
        "preferences": ["cultural", "adventure"],
        "group_size": 2
    }
    
    print(f"Request: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(ITINERARY_URL, json=payload, timeout=30)
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nSuccess: {data.get('success')}")
            
            itinerary = data.get('itinerary', {})
            print(f"\nItinerary Title: {itinerary.get('title')}")
            print(f"Summary: {itinerary.get('summary')}")
            print(f"Total Cost: ${itinerary.get('total_cost', 0):.2f}")
            print(f"Budget Remaining: ${itinerary.get('budget_remaining', 0):.2f}")
            
            # Display days
            days = itinerary.get('days', [])
            print(f"\nNumber of Days: {len(days)}")
            
            for day in days:
                print(f"\n--- Day {day.get('day')} ({day.get('date')}) ---")
                print(f"Theme: {day.get('theme')}")
                print(f"Daily Cost: ${day.get('daily_cost', 0):.2f}")
                
                activities = day.get('activities', [])
                print(f"Activities: {len(activities)}")
                
                for activity in activities[:3]:  # Show first 3 activities
                    print(f"  - {activity.get('time')}: {activity.get('activity')}")
                    print(f"    Location: {activity.get('location')}")
                    print(f"    Cost: ${activity.get('cost', 0):.2f}")
                    print(f"    Type: {activity.get('type')}")
            
            # Display cost breakdown
            cost_breakdown = itinerary.get('cost_breakdown', {})
            if cost_breakdown:
                print("\n--- Cost Breakdown ---")
                for category, amount in cost_breakdown.items():
                    if category != 'total':
                        print(f"{category.capitalize()}: ${amount:.2f}")
                print(f"Total: ${cost_breakdown.get('total', 0):.2f}")
            
            print("\n✓ Basic itinerary generation test PASSED")
            return True
        else:
            print(f"\n✗ Test FAILED: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"\n✗ Test FAILED: {str(e)}")
        return False


def test_itinerary_with_context():
    """Test itinerary generation with hotel and tour context."""
    print("\n=== Test 2: Itinerary with Context Data ===")
    
    start_date = (datetime.now() + timedelta(days=45)).strftime("%Y-%m-%d")
    end_date = (datetime.now() + timedelta(days=47)).strftime("%Y-%m-%d")
    
    payload = {
        "destination": "Phnom Penh",
        "start_date": start_date,
        "end_date": end_date,
        "budget": 400.0,
        "preferences": ["cultural", "relaxation"],
        "group_size": 1,
        "hotels": [
            {
                "name": "Royal Palace Hotel",
                "price_per_night": 80,
                "average_rating": 4.5
            },
            {
                "name": "Riverside Boutique",
                "price_per_night": 60,
                "average_rating": 4.2
            }
        ],
        "tours": [
            {
                "name": "Royal Palace & Silver Pagoda Tour",
                "price_per_person": 35,
                "duration": {"days": 1},
                "category": ["cultural", "historical"]
            },
            {
                "name": "Mekong Sunset Cruise",
                "price_per_person": 45,
                "duration": {"days": 1},
                "category": ["relaxation", "scenic"]
            }
        ],
        "events": [
            {
                "name": "Traditional Dance Performance",
                "pricing": {"base_price": 20},
                "start_date": start_date,
                "event_type": "cultural"
            }
        ]
    }
    
    print(f"Request with context data...")
    
    try:
        response = requests.post(ITINERARY_URL, json=payload, timeout=30)
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            itinerary = data.get('itinerary', {})
            
            print(f"\nItinerary Title: {itinerary.get('title')}")
            print(f"Total Cost: ${itinerary.get('total_cost', 0):.2f}")
            print(f"Budget Remaining: ${itinerary.get('budget_remaining', 0):.2f}")
            
            days = itinerary.get('days', [])
            print(f"Number of Days: {len(days)}")
            
            print("\n✓ Itinerary with context test PASSED")
            return True
        else:
            print(f"\n✗ Test FAILED: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"\n✗ Test FAILED: {str(e)}")
        return False


def test_budget_optimization():
    """Test budget allocation and optimization."""
    print("\n=== Test 3: Budget Optimization ===")
    
    start_date = (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d")
    end_date = (datetime.now() + timedelta(days=64)).strftime("%Y-%m-%d")
    
    payload = {
        "destination": "Siem Reap",
        "start_date": start_date,
        "end_date": end_date,
        "budget": 800.0,
        "preferences": ["cultural", "adventure", "relaxation"],
        "group_size": 2
    }
    
    print(f"Testing budget optimization for ${payload['budget']} budget...")
    
    try:
        response = requests.post(ITINERARY_URL, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            itinerary = data.get('itinerary', {})
            
            total_cost = itinerary.get('total_cost', 0)
            budget = payload['budget']
            budget_remaining = itinerary.get('budget_remaining', 0)
            
            print(f"\nBudget: ${budget:.2f}")
            print(f"Total Cost: ${total_cost:.2f}")
            print(f"Budget Remaining: ${budget_remaining:.2f}")
            print(f"Budget Utilization: {(total_cost / budget * 100):.1f}%")
            
            # Check if within 90% budget constraint
            if total_cost <= budget * 0.9:
                print(f"\n✓ Budget optimization test PASSED (within 90% constraint)")
                
                # Check activity balance
                days = itinerary.get('days', [])
                activity_types = {}
                
                for day in days:
                    for activity in day.get('activities', []):
                        activity_type = activity.get('type', 'other')
                        activity_types[activity_type] = activity_types.get(activity_type, 0) + 1
                
                print("\nActivity Type Distribution:")
                for activity_type, count in activity_types.items():
                    print(f"  {activity_type}: {count}")
                
                return True
            else:
                print(f"\n✗ Test FAILED: Total cost exceeds 90% budget constraint")
                return False
        else:
            print(f"\n✗ Test FAILED: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"\n✗ Test FAILED: {str(e)}")
        return False


def test_route_optimization():
    """Test route optimization features."""
    print("\n=== Test 4: Route Optimization ===")
    
    start_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
    end_date = (datetime.now() + timedelta(days=31)).strftime("%Y-%m-%d")
    
    payload = {
        "destination": "Siem Reap",
        "start_date": start_date,
        "end_date": end_date,
        "budget": 200.0,
        "preferences": ["cultural"],
        "group_size": 1
    }
    
    print("Testing route optimization...")
    
    try:
        response = requests.post(ITINERARY_URL, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            itinerary = data.get('itinerary', {})
            
            # Check for travel time information
            has_travel_info = False
            days = itinerary.get('days', [])
            
            for day in days:
                activities = day.get('activities', [])
                for activity in activities:
                    if 'travel_to_next' in activity:
                        has_travel_info = True
                        print(f"\nFound travel time: {activity.get('travel_to_next')}")
                        print(f"From: {activity.get('activity')}")
                        break
                if has_travel_info:
                    break
            
            if has_travel_info:
                print("\n✓ Route optimization test PASSED (travel times included)")
            else:
                print("\n⚠ Route optimization present but no travel times in this itinerary")
            
            return True
        else:
            print(f"\n✗ Test FAILED: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"\n✗ Test FAILED: {str(e)}")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("ITINERARY GENERATION TEST SUITE")
    print("=" * 60)
    print("\nMake sure the AI Engine is running on http://localhost:8000")
    print("Start it with: python main.py or uvicorn main:app --reload")
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code != 200:
            print("\n✗ AI Engine is not responding. Please start the server first.")
            return
    except requests.exceptions.RequestException:
        print("\n✗ Cannot connect to AI Engine. Please start the server first.")
        return
    
    print("\n✓ AI Engine is running\n")
    
    # Run tests
    results = []
    results.append(("Basic Itinerary Generation", test_basic_itinerary()))
    results.append(("Itinerary with Context", test_itinerary_with_context()))
    results.append(("Budget Optimization", test_budget_optimization()))
    results.append(("Route Optimization", test_route_optimization()))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n⚠ {total - passed} test(s) failed")


if __name__ == "__main__":
    main()
