"""Application settings and configuration."""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    
    # OpenAI Configuration
    OPENAI_API_KEY: str
    MODEL_USED: str = "DEEPSEEK"  # DEEPSEEK or GPT
    
    # DeepSeek Configuration
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com/v1"
    
    # Database Configuration
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "derlg_tourism"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    
    # Backend API Configuration
    BACKEND_API_URL: str = "http://localhost:3001/api"
    
    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3002,http://localhost:3003"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def database_url(self) -> str:
        """Construct database URL."""
        return f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def use_gpt(self) -> bool:
        """Check if GPT should be used instead of DeepSeek."""
        return self.MODEL_USED.upper() == "GPT"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
