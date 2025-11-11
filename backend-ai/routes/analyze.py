"""Sentiment analysis API routes."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List
from models.sentiment_model import SentimentAnalyzer

router = APIRouter(prefix="/api", tags=["analysis"])

# Initialize sentiment analyzer
sentiment_analyzer = SentimentAnalyzer()


class ReviewAnalysisRequest(BaseModel):
    """Request model for review analysis."""
    review_text: str = Field(..., description="Review text to analyze")


class BatchReviewAnalysisRequest(BaseModel):
    """Request model for batch review analysis."""
    reviews: List[str] = Field(..., description="List of review texts to analyze")


class SentimentResponse(BaseModel):
    """Response model for sentiment analysis."""
    success: bool
    score: float = Field(..., description="Sentiment score (0-1)")
    classification: str = Field(..., description="positive/neutral/negative")
    topics: Dict[str, float] = Field(
        default_factory=dict,
        description="Topic-specific sentiment scores"
    )
    flagged: bool = Field(
        default=False,
        description="True if review is extremely negative (score < 0.3)"
    )


class BatchSentimentResponse(BaseModel):
    """Response model for batch sentiment analysis."""
    success: bool
    results: List[Dict[str, Any]]
    total: int


@router.post("/analyze-review", response_model=SentimentResponse)
async def analyze_review(request: ReviewAnalysisRequest):
    """
    Analyze sentiment of a customer review.
    
    Returns:
    - Overall sentiment score (0-1)
    - Classification (positive/neutral/negative)
    - Topic-specific sentiment (cleanliness, service, location, etc.)
    - Flagged status for extremely negative reviews (score < 0.3)
    
    Reviews with score < 0.3 are flagged for admin attention.
    """
    try:
        result = await sentiment_analyzer.analyze_review(request.review_text)
        
        return SentimentResponse(
            success=True,
            score=result["score"],
            classification=result["classification"],
            topics=result["topics"],
            flagged=result["flagged"]
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Sentiment analysis failed: {str(e)}"
        )


@router.post("/analyze-reviews-batch", response_model=BatchSentimentResponse)
async def analyze_reviews_batch(request: BatchReviewAnalysisRequest):
    """
    Analyze sentiment of multiple reviews in batch.
    
    More efficient than analyzing reviews one by one.
    Useful for processing historical reviews or bulk analysis.
    """
    try:
        results = await sentiment_analyzer.batch_analyze(request.reviews)
        
        return BatchSentimentResponse(
            success=True,
            results=results,
            total=len(results)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Batch sentiment analysis failed: {str(e)}"
        )
