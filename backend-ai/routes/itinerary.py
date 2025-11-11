"""Itinerary generation API routes."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from models.itinerary_model import ItineraryModel

router = APIRouter(prefix="/api", tags=["itinerary"])

# Initialize itinerary model
itinerary_model = ItineraryModel()


class ItineraryRequest(BaseModel):
    """Request model for itinerary generation."""
    destination: str = Field(..., description="Target destination (e.g., 'Siem Reap')")
    start_date: str = Field(..., description="Trip start date (YYYY-MM-DD)")
    end_date: str = Field(..., description="Trip end date (YYYY-MM-DD)")
    budget: float = Field(..., gt=0, description="Total budget in USD")
    preferences: List[str] = Field(
        default_factory=list,
        description="Activity preferences (e.g., ['cultural', 'adventure'])"
    )
    group_size: int = Field(default=1, ge=1, description="Number of travelers")
    hotels: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="Available hotels data"
    )
    tours: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="Available tours data"
    )
    events: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="Available events data"
    )


class ItineraryResponse(BaseModel):
    """Response model for itinerary generation."""
    success: bool
    itinerary: Dict[str, Any]


@router.post("/itinerary", response_model=ItineraryResponse)
async def generate_itinerary(request: ItineraryRequest):
    """
    Generate an optimized travel itinerary.
    
    This endpoint creates a detailed day-by-day itinerary that:
    - Optimizes routes to minimize travel time
    - Balances activity types (cultural, adventure, relaxation)
    - Allocates budget across days and activities
    - Considers opening hours and travel time
    - Provides transparent cost breakdowns
    
    The algorithm:
    1. Analyzes available hotels, tours, and events
    2. Creates optimal daily schedules
    3. Calculates routes with Google Maps integration
    4. Ensures budget constraints are met
    5. Balances activity types based on preferences
    """
    try:
        itinerary = itinerary_model.generate_itinerary(
            destination=request.destination,
            start_date=request.start_date,
            end_date=request.end_date,
            budget=request.budget,
            preferences=request.preferences,
            group_size=request.group_size,
            hotels=request.hotels,
            tours=request.tours,
            events=request.events
        )
        
        return ItineraryResponse(
            success=True,
            itinerary=itinerary
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate itinerary: {str(e)}"
        )
