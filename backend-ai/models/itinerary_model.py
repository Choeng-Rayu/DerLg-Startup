"""Itinerary generation model for creating optimized travel plans."""

import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
from openai import OpenAI
from utils.logger import logger
from config.settings import settings


class ItineraryModel:
    """Model for generating optimized travel itineraries."""
    
    def __init__(self):
        """Initialize the itinerary model."""
        # Initialize OpenAI client based on settings
        if settings.use_gpt:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
            self.model = "gpt-4"
            logger.info("Initialized ItineraryModel with GPT-4")
        else:
            self.client = OpenAI(
                api_key=settings.DEEPSEEK_API_KEY,
                base_url="https://api.deepseek.com"
            )
            self.model = "deepseek-chat"
            logger.info("Initialized ItineraryModel with DeepSeek")
    
    def generate_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        budget: float,
        preferences: List[str],
        group_size: int = 1,
        hotels: Optional[List[Dict[str, Any]]] = None,
        tours: Optional[List[Dict[str, Any]]] = None,
        events: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Generate an optimized itinerary based on user preferences.
        
        Args:
            destination: Target destination (e.g., "Siem Reap", "Phnom Penh")
            start_date: Trip start date (YYYY-MM-DD)
            end_date: Trip end date (YYYY-MM-DD)
            budget: Total budget in USD
            preferences: List of activity preferences (e.g., ["cultural", "adventure"])
            group_size: Number of travelers
            hotels: Available hotels data
            tours: Available tours data
            events: Available events data
            
        Returns:
            Dictionary containing the complete itinerary with day-by-day plans
        """
        try:
            # Calculate trip duration
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            duration_days = (end - start).days + 1
            
            # Calculate daily budget
            daily_budget = budget / duration_days
            
            # Build context for AI
            context = self._build_context(
                destination=destination,
                duration_days=duration_days,
                daily_budget=daily_budget,
                budget=budget,
                preferences=preferences,
                group_size=group_size,
                hotels=hotels,
                tours=tours,
                events=events
            )
            
            # Generate itinerary using AI
            system_prompt = self._get_system_prompt()
            user_prompt = self._build_user_prompt(
                destination=destination,
                start_date=start_date,
                end_date=end_date,
                duration_days=duration_days,
                budget=budget,
                daily_budget=daily_budget,
                preferences=preferences,
                group_size=group_size,
                context=context
            )
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=3000
            )
            
            # Parse AI response
            ai_response = response.choices[0].message.content
            itinerary = self._parse_itinerary_response(
                ai_response=ai_response,
                start_date=start_date,
                duration_days=duration_days,
                budget=budget
            )
            
            # Optimize routes if locations are provided
            if itinerary.get("days"):
                itinerary = self._optimize_routes(itinerary)
            
            # Add cost breakdown
            itinerary["cost_breakdown"] = self._calculate_cost_breakdown(itinerary)
            
            logger.info(f"Generated itinerary for {destination} ({duration_days} days)")
            return itinerary
            
        except Exception as e:
            logger.error(f"Error generating itinerary: {str(e)}")
            raise
    
    def _build_context(
        self,
        destination: str,
        duration_days: int,
        daily_budget: float,
        budget: float,
        preferences: List[str],
        group_size: int,
        hotels: Optional[List[Dict[str, Any]]],
        tours: Optional[List[Dict[str, Any]]],
        events: Optional[List[Dict[str, Any]]]
    ) -> str:
        """Build context information for the AI."""
        context_parts = []
        
        # Add available hotels
        if hotels:
            hotel_info = []
            for h in hotels[:5]:  # Limit to top 5
                if isinstance(h, dict):
                    name = h.get('name', 'Unknown')
                    price = h.get('price_per_night', 0)
                    rating = h.get('average_rating', 0)
                    hotel_info.append(f"- {name}: ${price}/night, Rating: {rating}/5")
            if hotel_info:
                context_parts.append(f"Available Hotels:\n" + "\n".join(hotel_info))
        
        # Add available tours
        if tours:
            tour_info = []
            for t in tours[:10]:  # Limit to top 10
                if isinstance(t, dict):
                    name = t.get('name', 'Unknown')
                    price = t.get('price_per_person', 0)
                    duration = t.get('duration', {})
                    if isinstance(duration, dict):
                        days = duration.get('days', 1)
                    elif isinstance(duration, str):
                        days = duration
                    else:
                        days = 1
                    category = t.get('category', [])
                    if isinstance(category, list):
                        category_str = ', '.join(category)
                    else:
                        category_str = str(category)
                    tour_info.append(f"- {name}: ${price}/person, Duration: {days} day(s), Category: {category_str}")
            if tour_info:
                context_parts.append(f"Available Tours:\n" + "\n".join(tour_info))
        
        # Add available events
        if events:
            event_info = []
            for e in events[:5]:  # Limit to top 5
                if isinstance(e, dict):
                    name = e.get('name', 'Unknown')
                    pricing = e.get('pricing', {})
                    if isinstance(pricing, dict):
                        price = pricing.get('base_price', 0)
                    else:
                        price = 0
                    start_date = e.get('start_date', 'TBD')
                    event_type = e.get('event_type', 'cultural')
                    event_info.append(f"- {name}: ${price}/person, Date: {start_date}, Type: {event_type}")
            if event_info:
                context_parts.append(f"Available Events:\n" + "\n".join(event_info))
        
        return "\n\n".join(context_parts) if context_parts else "No specific options provided."
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for itinerary generation."""
        return """You are an expert travel planner specializing in Cambodia tourism. 
Your task is to create detailed, optimized day-by-day itineraries that:

1. Maximize traveler experience while staying within budget
2. Balance different activity types (cultural, adventure, relaxation)
3. Consider travel time between locations
4. Include meal breaks and rest periods
5. Provide transparent cost breakdowns
6. Suggest optimal routes to minimize transportation time

Format your response as a structured JSON with the following format:
{
  "title": "Trip title",
  "summary": "Brief overview",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "Cultural Exploration",
      "activities": [
        {
          "time": "09:00",
          "activity": "Activity name",
          "location": "Location name",
          "duration": "2 hours",
          "cost": 25.00,
          "description": "Brief description",
          "type": "cultural|adventure|relaxation|meal|transportation"
        }
      ],
      "daily_cost": 150.00,
      "notes": "Any special notes for the day"
    }
  ],
  "total_cost": 450.00,
  "budget_remaining": 50.00
}

Be specific, practical, and ensure all costs are realistic for Cambodia."""
    
    def _build_user_prompt(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        duration_days: int,
        budget: float,
        daily_budget: float,
        preferences: List[str],
        group_size: int,
        context: str
    ) -> str:
        """Build the user prompt for itinerary generation."""
        preferences_str = ", ".join(preferences) if preferences else "general sightseeing"
        
        prompt = f"""Create a detailed {duration_days}-day itinerary for {destination}, Cambodia.

Trip Details:
- Destination: {destination}
- Start Date: {start_date}
- End Date: {end_date}
- Duration: {duration_days} days
- Total Budget: ${budget:.2f} USD
- Daily Budget: ${daily_budget:.2f} USD
- Group Size: {group_size} person(s)
- Preferences: {preferences_str}

{context}

Requirements:
1. Create a day-by-day plan with specific activities and timings
2. Balance activity types based on preferences
3. Stay within 90% of the total budget (${budget * 0.9:.2f})
4. Include breakfast, lunch, and dinner in the schedule
5. Consider travel time between locations
6. Provide cost estimates for each activity
7. Suggest the best route to minimize travel time
8. Include rest periods and free time

Please generate a comprehensive itinerary in JSON format."""
        
        return prompt
    
    def _parse_itinerary_response(
        self,
        ai_response: str,
        start_date: str,
        duration_days: int,
        budget: float
    ) -> Dict[str, Any]:
        """Parse the AI response into a structured itinerary."""
        try:
            # Try to extract JSON from the response
            # Look for JSON block in markdown code blocks
            if "```json" in ai_response:
                json_start = ai_response.find("```json") + 7
                json_end = ai_response.find("```", json_start)
                json_str = ai_response[json_start:json_end].strip()
            elif "```" in ai_response:
                json_start = ai_response.find("```") + 3
                json_end = ai_response.find("```", json_start)
                json_str = ai_response[json_start:json_end].strip()
            else:
                # Try to find JSON object directly
                json_start = ai_response.find("{")
                json_end = ai_response.rfind("}") + 1
                json_str = ai_response[json_start:json_end].strip()
            
            itinerary = json.loads(json_str)
            
            # Ensure dates are set correctly
            start = datetime.strptime(start_date, "%Y-%m-%d")
            for i, day in enumerate(itinerary.get("days", [])):
                day_date = start + timedelta(days=i)
                day["date"] = day_date.strftime("%Y-%m-%d")
                day["day"] = i + 1
            
            # Ensure budget fields exist
            if "total_cost" not in itinerary:
                total_cost = sum(day.get("daily_cost", 0) for day in itinerary.get("days", []))
                itinerary["total_cost"] = total_cost
            
            if "budget_remaining" not in itinerary:
                itinerary["budget_remaining"] = budget - itinerary.get("total_cost", 0)
            
            return itinerary
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {str(e)}")
            # Return a basic structure if parsing fails
            return {
                "title": f"Trip Itinerary",
                "summary": "Unable to generate detailed itinerary",
                "days": [],
                "total_cost": 0,
                "budget_remaining": budget,
                "error": "Failed to parse itinerary"
            }
    
    def _optimize_routes(self, itinerary: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize routes between activities to minimize travel time.
        This is a placeholder for Google Maps integration.
        """
        # TODO: Integrate with Google Maps API for actual route optimization
        # For now, just add travel time estimates between activities
        
        for day in itinerary.get("days", []):
            activities = day.get("activities", [])
            for i in range(len(activities) - 1):
                current = activities[i]
                next_activity = activities[i + 1]
                
                # Add estimated travel time (placeholder logic)
                if current.get("type") != "transportation":
                    # Estimate 15-30 minutes between locations
                    travel_time = "15-30 minutes"
                    current["travel_to_next"] = travel_time
        
        return itinerary
    
    def _calculate_cost_breakdown(self, itinerary: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate detailed cost breakdown by category."""
        breakdown = {
            "accommodation": 0,
            "tours": 0,
            "meals": 0,
            "transportation": 0,
            "events": 0,
            "other": 0
        }
        
        for day in itinerary.get("days", []):
            for activity in day.get("activities", []):
                cost = activity.get("cost", 0)
                activity_type = activity.get("type", "other")
                
                if activity_type == "meal":
                    breakdown["meals"] += cost
                elif activity_type == "transportation":
                    breakdown["transportation"] += cost
                elif activity_type in ["cultural", "adventure"]:
                    breakdown["tours"] += cost
                elif "event" in activity.get("activity", "").lower():
                    breakdown["events"] += cost
                elif "hotel" in activity.get("activity", "").lower():
                    breakdown["accommodation"] += cost
                else:
                    breakdown["other"] += cost
        
        breakdown["total"] = sum(breakdown.values())
        return breakdown
