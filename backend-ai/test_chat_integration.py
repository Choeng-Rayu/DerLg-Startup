"""Test script for ChatGPT-4 and DeepSeek integration."""

import asyncio
import sys
from models.chat_model import ChatAssistant
from config.settings import settings


async def test_chat_assistant():
    """Test the chat assistant with various scenarios."""
    
    print("=" * 80)
    print("CHAT ASSISTANT INTEGRATION TEST")
    print("=" * 80)
    print()
    
    # Display configuration
    print("Configuration:")
    print(f"  Model Used: {settings.MODEL_USED}")
    print(f"  Using GPT: {settings.use_gpt}")
    if settings.use_gpt:
        print(f"  Model: gpt-4")
        print(f"  API Key: {settings.OPENAI_API_KEY[:10]}..." if settings.OPENAI_API_KEY else "  API Key: NOT SET")
    else:
        print(f"  Model: deepseek-chat")
        print(f"  API Key: {settings.DEEPSEEK_API_KEY[:10]}..." if settings.DEEPSEEK_API_KEY else "  API Key: NOT SET")
        print(f"  Base URL: {settings.DEEPSEEK_BASE_URL}")
    print()
    
    # Initialize chat assistant
    print("Initializing chat assistant...")
    assistant = ChatAssistant()
    print("✓ Chat assistant initialized successfully")
    print()
    
    # Test 1: Basic English conversation
    print("-" * 80)
    print("TEST 1: Basic English Conversation")
    print("-" * 80)
    try:
        user_message = "Hi! I'm planning a 3-day trip to Cambodia with a budget of $500. What do you recommend?"
        print(f"User: {user_message}")
        print()
        
        response = await assistant.chat(
            user_message=user_message,
            conversation_history=[],
            context={
                "user_budget": 500,
                "user_preferences": {
                    "budget": 500,
                    "travel_dates": "3 days"
                }
            }
        )
        
        print(f"Assistant: {response[:300]}...")
        print()
        print("✓ English conversation test passed")
    except Exception as e:
        print(f"✗ English conversation test failed: {str(e)}")
        return False
    print()
    
    # Test 2: Streaming response
    print("-" * 80)
    print("TEST 2: Streaming Response")
    print("-" * 80)
    try:
        user_message = "Tell me about Angkor Wat"
        print(f"User: {user_message}")
        print()
        print("Assistant (streaming): ", end="", flush=True)
        
        chunk_count = 0
        async for chunk in assistant.chat_stream(
            user_message=user_message,
            conversation_history=[
                {"role": "user", "content": "Hi! I'm planning a trip to Cambodia"},
                {"role": "assistant", "content": "Great! I'd be happy to help you plan your Cambodia trip."}
            ]
        ):
            print(chunk, end="", flush=True)
            chunk_count += 1
            if chunk_count > 50:  # Limit output for testing
                print("...", end="", flush=True)
                break
        
        print()
        print()
        print(f"✓ Streaming response test passed ({chunk_count} chunks received)")
    except Exception as e:
        print(f"✗ Streaming response test failed: {str(e)}")
        return False
    print()
    
    # Test 3: Conversation context maintenance
    print("-" * 80)
    print("TEST 3: Conversation Context Maintenance")
    print("-" * 80)
    try:
        conversation_history = [
            {"role": "user", "content": "I want to visit temples in Siem Reap"},
            {"role": "assistant", "content": "Siem Reap is home to the magnificent Angkor Wat temple complex. I recommend visiting Angkor Wat, Angkor Thom, and Ta Prohm."}
        ]
        
        user_message = "How much time should I spend there?"
        print("Previous conversation:")
        for msg in conversation_history:
            print(f"  {msg['role'].title()}: {msg['content'][:80]}...")
        print()
        print(f"User: {user_message}")
        print()
        
        response = await assistant.chat(
            user_message=user_message,
            conversation_history=conversation_history
        )
        
        print(f"Assistant: {response[:300]}...")
        print()
        print("✓ Context maintenance test passed")
    except Exception as e:
        print(f"✗ Context maintenance test failed: {str(e)}")
        return False
    print()
    
    # Test 4: Multi-language support (Chinese)
    print("-" * 80)
    print("TEST 4: Multi-Language Support (Chinese)")
    print("-" * 80)
    try:
        user_message = "你好！我想去柬埔寨旅游"
        print(f"User: {user_message}")
        print()
        
        response = await assistant.chat(
            user_message=user_message,
            conversation_history=[],
            language="chinese"
        )
        
        print(f"Assistant: {response[:200]}...")
        print()
        print("✓ Chinese language test passed")
    except Exception as e:
        print(f"✗ Chinese language test failed: {str(e)}")
        return False
    print()
    
    # Test 5: Language detection
    print("-" * 80)
    print("TEST 5: Language Detection")
    print("-" * 80)
    try:
        # Test English detection
        lang = assistant._detect_language("Hello, I want to visit Cambodia", [])
        print(f"  'Hello, I want to visit Cambodia' -> {lang}")
        assert lang == "english", f"Expected 'english', got '{lang}'"
        
        # Test Chinese detection
        lang = assistant._detect_language("你好，我想去柬埔寨", [])
        print(f"  '你好，我想去柬埔寨' -> {lang}")
        assert lang == "chinese", f"Expected 'chinese', got '{lang}'"
        
        # Test Khmer detection
        lang = assistant._detect_language("សួស្តី", [])
        print(f"  'សួស្តី' -> {lang}")
        assert lang == "khmer", f"Expected 'khmer', got '{lang}'"
        
        print()
        print("✓ Language detection test passed")
    except Exception as e:
        print(f"✗ Language detection test failed: {str(e)}")
        return False
    print()
    
    # Test 6: Context formatting
    print("-" * 80)
    print("TEST 6: Context Formatting")
    print("-" * 80)
    try:
        context = {
            "available_hotels": [
                {"name": "Angkor Palace Resort", "location": "Siem Reap", "price_per_night": 80},
                {"name": "Raffles Grand Hotel", "location": "Phnom Penh", "price_per_night": 150}
            ],
            "available_tours": [
                {"name": "Angkor Wat Sunrise Tour", "duration": "Full day", "price": 45},
                {"name": "Tonle Sap Lake Tour", "duration": "Half day", "price": 30}
            ],
            "upcoming_events": [
                {"name": "Water Festival", "date": "November 2024", "location": "Phnom Penh"}
            ],
            "user_preferences": {
                "budget": 500,
                "interests": ["temples", "culture"],
                "travel_dates": "December 2024",
                "group_size": 2
            }
        }
        
        formatted = assistant._format_context(context)
        print("Formatted context:")
        print(formatted)
        print()
        
        # Verify key elements are present
        assert "Angkor Palace Resort" in formatted
        assert "Angkor Wat Sunrise Tour" in formatted
        assert "Water Festival" in formatted
        assert "Budget: $500" in formatted
        
        print("✓ Context formatting test passed")
    except Exception as e:
        print(f"✗ Context formatting test failed: {str(e)}")
        return False
    print()
    
    # Test 7: System prompt verification
    print("-" * 80)
    print("TEST 7: System Prompt Verification")
    print("-" * 80)
    try:
        system_prompt = assistant.system_prompt
        
        # Verify key elements in system prompt
        required_elements = [
            "DerLg.com",
            "Cambodia",
            "Angkor Wat",
            "Khmer New Year",
            "payment options",
            "deposit",
            "milestone",
            "English, Khmer, Chinese"
        ]
        
        missing_elements = []
        for element in required_elements:
            if element not in system_prompt:
                missing_elements.append(element)
        
        if missing_elements:
            print(f"✗ Missing elements in system prompt: {', '.join(missing_elements)}")
            return False
        
        print("System prompt contains all required elements:")
        for element in required_elements:
            print(f"  ✓ {element}")
        print()
        print("✓ System prompt verification passed")
    except Exception as e:
        print(f"✗ System prompt verification failed: {str(e)}")
        return False
    print()
    
    # Summary
    print("=" * 80)
    print("ALL TESTS PASSED ✓")
    print("=" * 80)
    print()
    print("Summary:")
    print("  ✓ Chat assistant initialization")
    print("  ✓ Basic English conversation")
    print("  ✓ Streaming response functionality")
    print("  ✓ Conversation context maintenance")
    print("  ✓ Multi-language support (Chinese)")
    print("  ✓ Language detection (English, Chinese, Khmer)")
    print("  ✓ Context formatting")
    print("  ✓ System prompt verification")
    print()
    print(f"Current configuration: Using {settings.MODEL_USED}")
    print()
    
    return True


async def main():
    """Main test function."""
    try:
        success = await test_chat_assistant()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Test suite failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
