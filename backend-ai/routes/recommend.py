"""Recommendation API routes."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from models.recommendation_model import RecommendationEngine

router = APIRouter(prefix="/api", tags=["recommendations"])

# Initialize recommendation engine
recommendation_engine = RecommendationEngine()


class RecommendationRequest(BaseModel):
    """Request model for recommendations."""
    user_id: str = Field(..., description="User identifier")
    budget: float = Field(..., gt=0, description="Maximum budget in USD")
    destination: Optional[str] = Field(None, description="Preferred destination")
    check_in: Optional[str] = Field(None, description="Check-in date (ISO format)")
    check_out: Optional[str] = Field(None, description="Check-out date (ISO format)")
    preferences: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="User preferences (amenities, location, etc.)"
    )


class RecommendationResponse(BaseModel):
    """Response model for recommendations."""
    success: bool
    recommendations: List[Dict[str, Any]]
    total: int


@router.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Generate personalized hotel and tour recommendations.
    
    This endpoint uses a hybrid recommendation algorithm combining:
    - Collaborative filtering (60%)
    - Content-based filtering (40%)
    - Budget optimization
    - Real-time event integration
    """
    try:
        dates = {}
        if request.check_in and request.check_out:
            dates = {
                "check_in": request.check_in,
                "check_out": request.check_out
            }
        
        recommendations = await recommendation_engine.get_recommendations(
            user_id=request.user_id,
            budget=request.budget,
            preferences=request.preferences,
            dates=dates
        )
        
        return RecommendationResponse(
            success=True,
            recommendations=recommendations,
            total=len(recommendations)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate recommendations: {str(e)}"
        )
