"""Main FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from routes import (
    recommend_router,
    chat_router,
    analyze_router,
    health_router,
    itinerary_router
)
from utils.logger import logger

# Create FastAPI application
app = FastAPI(
    title="DerLg AI Recommendation Engine",
    description="AI-powered recommendation and chat assistant for Cambodia tourism",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health_router)
app.include_router(recommend_router)
app.include_router(chat_router)
app.include_router(analyze_router)
app.include_router(itinerary_router)


@app.on_event("startup")
async def startup_event():
    """Execute on application startup."""
    logger.info("Starting DerLg AI Engine...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Model: {'GPT-4' if settings.use_gpt else 'DeepSeek'}")
    logger.info("AI Engine started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Execute on application shutdown."""
    logger.info("Shutting down AI Engine...")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "DerLg AI Recommendation Engine",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=not settings.is_production,
        log_level=settings.LOG_LEVEL.lower()
    )
