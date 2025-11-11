"""API routes package."""

from .recommend import router as recommend_router
from .chat import router as chat_router
from .analyze import router as analyze_router
from .health import router as health_router
from .itinerary import router as itinerary_router

__all__ = [
    "recommend_router",
    "chat_router",
    "analyze_router",
    "health_router",
    "itinerary_router",
]
