"""Health check API routes."""

from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from config.settings import settings

router = APIRouter(prefix="/api", tags=["health"])


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    timestamp: str
    environment: str
    model_used: str
    version: str = "1.0.0"


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    
    Returns the current status of the AI Engine service.
    Useful for monitoring and load balancer health checks.
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        environment=settings.ENVIRONMENT,
        model_used="GPT-4" if settings.use_gpt else "DeepSeek"
    )
