"""Test script to verify AI Engine setup."""

import sys
import os

def test_imports():
    """Test that all required packages can be imported."""
    print("Testing imports...")
    
    try:
        import fastapi
        print("✓ FastAPI imported successfully")
    except ImportError as e:
        print(f"✗ FastAPI import failed: {e}")
        return False
    
    try:
        import uvicorn
        print("✓ Uvicorn imported successfully")
    except ImportError as e:
        print(f"✗ Uvicorn import failed: {e}")
        return False
    
    try:
        import openai
        print("✓ OpenAI imported successfully")
    except ImportError as e:
        print(f"✗ OpenAI import failed: {e}")
        return False
    
    try:
        import sklearn
        print("✓ scikit-learn imported successfully")
    except ImportError as e:
        print(f"✗ scikit-learn import failed: {e}")
        return False
    
    try:
        from sentence_transformers import SentenceTransformer
        print("✓ sentence-transformers imported successfully")
    except ImportError as e:
        print(f"✗ sentence-transformers import failed: {e}")
        return False
    
    try:
        from pydantic_settings import BaseSettings
        print("✓ pydantic-settings imported successfully")
    except ImportError as e:
        print(f"✗ pydantic-settings import failed: {e}")
        return False
    
    return True


def test_config():
    """Test configuration loading."""
    print("\nTesting configuration...")
    
    try:
        from config.settings import settings
        print(f"✓ Settings loaded successfully")
        print(f"  - Environment: {settings.ENVIRONMENT}")
        print(f"  - Model: {'GPT-4' if settings.use_gpt else 'DeepSeek'}")
        print(f"  - Port: {settings.PORT}")
        return True
    except Exception as e:
        print(f"✗ Configuration loading failed: {e}")
        return False


def test_models():
    """Test model initialization."""
    print("\nTesting models...")
    
    try:
        from models import RecommendationEngine, SentimentAnalyzer, ChatAssistant
        
        rec_engine = RecommendationEngine()
        print("✓ RecommendationEngine initialized")
        
        sentiment = SentimentAnalyzer()
        print("✓ SentimentAnalyzer initialized")
        
        chat = ChatAssistant()
        print("✓ ChatAssistant initialized")
        
        return True
    except Exception as e:
        print(f"✗ Model initialization failed: {e}")
        return False


def test_routes():
    """Test route imports."""
    print("\nTesting routes...")
    
    try:
        from routes import (
            recommend_router,
            chat_router,
            analyze_router,
            health_router
        )
        print("✓ All routes imported successfully")
        return True
    except Exception as e:
        print(f"✗ Route import failed: {e}")
        return False


def test_utils():
    """Test utility imports."""
    print("\nTesting utilities...")
    
    try:
        from utils import DataProcessor, FeatureExtractor, setup_logger
        
        processor = DataProcessor()
        print("✓ DataProcessor initialized")
        
        extractor = FeatureExtractor()
        print("✓ FeatureExtractor initialized")
        
        logger = setup_logger("test")
        print("✓ Logger initialized")
        
        return True
    except Exception as e:
        print(f"✗ Utility initialization failed: {e}")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("DerLg AI Engine Setup Verification")
    print("=" * 60)
    
    # Check Python version
    print(f"\nPython version: {sys.version}")
    if sys.version_info < (3, 10):
        print("⚠ Warning: Python 3.10+ is recommended")
    
    # Check .env file
    if not os.path.exists(".env"):
        print("\n⚠ Warning: .env file not found. Using .env.example values.")
    
    # Run tests
    tests = [
        ("Imports", test_imports),
        ("Configuration", test_config),
        ("Models", test_models),
        ("Routes", test_routes),
        ("Utilities", test_utils)
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ {name} test crashed: {e}")
            results.append((name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓ All tests passed! AI Engine is ready to run.")
        print("\nTo start the server, run:")
        print("  python main.py")
        return 0
    else:
        print("\n✗ Some tests failed. Please install missing dependencies:")
        print("  pip install -r requirements.txt")
        return 1


if __name__ == "__main__":
    sys.exit(main())
