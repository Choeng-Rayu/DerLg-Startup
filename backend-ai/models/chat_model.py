"""ChatGPT integration for conversational AI assistant."""

from typing import List, Dict, Any, AsyncGenerator, Optional
from openai import AsyncOpenAI
from config.settings import settings
import json


class ChatAssistant:
    """
    AI-powered chat assistant using ChatGPT-4 or DeepSeek
    for conversational travel recommendations.
    """
    
    def __init__(self):
        """Initialize the chat assistant with appropriate API client."""
        if settings.use_gpt:
            # Use OpenAI GPT-4 for production
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            self.model = "gpt-4"
        else:
            # Use DeepSeek for testing
            self.client = AsyncOpenAI(
                api_key=settings.DEEPSEEK_API_KEY,
                base_url=settings.DEEPSEEK_BASE_URL
            )
            self.model = "deepseek-chat"
        
        self.system_prompt = self._build_cambodia_tourism_prompt()
    
    def _build_cambodia_tourism_prompt(self) -> str:
        """Build comprehensive system prompt for Cambodia tourism context."""
        return """You are an expert travel assistant for DerLg.com, Cambodia's premier tourism booking platform.

**Your Role:**
You help international and domestic tourists discover and book authentic Cambodian experiences including hotels, tours, cultural events, and transportation.

**Core Responsibilities:**
1. **Personalized Recommendations**: Understand user preferences (budget, interests, travel dates, group size) and suggest relevant hotels, tours, and events
2. **Cultural Expertise**: Provide rich context about Cambodian culture, history, festivals (Khmer New Year, Water Festival, etc.), and local customs
3. **Itinerary Planning**: Create optimized day-by-day itineraries that balance cultural sites, adventure activities, and relaxation
4. **Budget Management**: Help users stay within budget by suggesting appropriate options and explaining all costs transparently
5. **Booking Assistance**: Guide users through the booking process, explain payment options (deposit, milestone, full payment with 5% discount)
6. **Real-Time Information**: Provide current information about festivals, events, weather considerations, and seasonal recommendations

**Key Cambodian Destinations to Know:**
- Siem Reap: Angkor Wat temple complex, Angkor Thom, Ta Prohm, Tonle Sap Lake
- Phnom Penh: Royal Palace, Silver Pagoda, National Museum, Central Market, Riverside
- Sihanoukville & Islands: Beaches, island hopping, water sports
- Battambang: Bamboo train, Phare Circus, colonial architecture, countryside tours
- Kampot & Kep: Pepper plantations, Bokor Mountain, crab markets, riverside relaxation
- Mondulkiri & Ratanakiri: Elephant sanctuaries, waterfalls, indigenous culture, jungle trekking

**Cultural Events & Festivals:**
- Khmer New Year (April): Traditional celebrations, water blessings, family gatherings
- Water Festival (November): Boat races on Tonle Sap River, full moon celebrations
- Pchum Ben (September/October): Ancestor worship, temple visits, traditional offerings
- Royal Ploughing Ceremony (May): Agricultural blessing ceremony
- Angkor Wat International Half Marathon (December)

**Communication Style:**
- Be warm, friendly, and enthusiastic about Cambodia
- Use clear, simple language appropriate for international tourists
- Provide specific examples and practical tips
- Always mention pricing when discussing options
- Respect cultural sensitivities and provide appropriate guidance
- Support multi-language conversations (English, Khmer, Chinese)

**Language Support:**
- Detect the user's preferred language from their messages
- Respond in the same language (English, Khmer, or Chinese)
- Maintain cultural context and local terminology when translating
- Include basic local phrases when relevant (e.g., "សួស្តី" - Hello in Khmer)

**Booking Information:**
- Payment options: 50-70% deposit, milestone payments (50%/25%/25%), or full payment with 5% discount
- Cancellation policy: Full refund 30+ days before, 50% refund 7-30 days, deposit retained within 7 days
- All payments protected by escrow system
- Free airport pickup available with full payment bookings

**Important Guidelines:**
- Always prioritize user safety and authentic experiences
- Suggest appropriate clothing for temple visits (covered shoulders and knees)
- Mention weather considerations (rainy season May-October, cool season November-February)
- Recommend booking popular sites early to avoid crowds
- Suggest hiring local guides for deeper cultural understanding
- Be transparent about all costs - no hidden fees

Remember: Your goal is to help tourists have an unforgettable, authentic Cambodian experience while staying within their budget and respecting local culture."""
    
    async def chat(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        context: Dict[str, Any] = None,
        language: Optional[str] = None
    ) -> str:
        """
        Generate a chat response (non-streaming).
        
        Args:
            user_message: The user's message
            conversation_history: Previous messages in the conversation
            context: Additional context (available hotels, tours, etc.)
            language: Preferred language (english, khmer, chinese) - auto-detected if not provided
            
        Returns:
            AI assistant's response
        """
        # Detect language if not provided
        if not language:
            language = self._detect_language(user_message, conversation_history)
        
        messages = self._build_messages(
            user_message,
            conversation_history,
            context,
            language
        )
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7,
            max_tokens=2000
        )
        
        return response.choices[0].message.content
    
    async def chat_stream(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        context: Dict[str, Any] = None,
        language: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Generate a streaming chat response.
        
        Args:
            user_message: The user's message
            conversation_history: Previous messages in the conversation
            context: Additional context (available hotels, tours, etc.)
            language: Preferred language (english, khmer, chinese) - auto-detected if not provided
            
        Yields:
            Chunks of the AI assistant's response
        """
        # Detect language if not provided
        if not language:
            language = self._detect_language(user_message, conversation_history)
        
        messages = self._build_messages(
            user_message,
            conversation_history,
            context,
            language
        )
        
        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7,
            max_tokens=2000,
            stream=True
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    
    def _detect_language(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]]
    ) -> str:
        """
        Detect the language from user message or conversation history.
        
        Args:
            user_message: Current user message
            conversation_history: Previous messages
            
        Returns:
            Detected language: 'english', 'khmer', or 'chinese'
        """
        # Check for Khmer characters (Unicode range: 1780-17FF)
        if any('\u1780' <= char <= '\u17FF' for char in user_message):
            return 'khmer'
        
        # Check for Chinese characters (Unicode ranges: 4E00-9FFF, 3400-4DBF)
        if any('\u4E00' <= char <= '\u9FFF' or '\u3400' <= char <= '\u4DBF' for char in user_message):
            return 'chinese'
        
        # Check conversation history if current message is ambiguous
        for msg in reversed(conversation_history[-3:]):  # Check last 3 messages
            if msg.get('role') == 'user':
                content = msg.get('content', '')
                if any('\u1780' <= char <= '\u17FF' for char in content):
                    return 'khmer'
                if any('\u4E00' <= char <= '\u9FFF' or '\u3400' <= char <= '\u4DBF' for char in content):
                    return 'chinese'
        
        # Default to English
        return 'english'
    
    def _build_messages(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        context: Dict[str, Any] = None,
        language: str = 'english'
    ) -> List[Dict[str, str]]:
        """
        Build the messages array for the API request.
        
        Args:
            user_message: Current user message
            conversation_history: Previous messages
            context: Additional context
            language: User's preferred language
            
        Returns:
            Formatted messages array
        """
        messages = [
            {"role": "system", "content": self.system_prompt}
        ]
        
        # Add language instruction
        language_instruction = self._get_language_instruction(language)
        if language_instruction:
            messages.append({
                "role": "system",
                "content": language_instruction
            })
        
        # Add context if available
        if context:
            context_message = self._format_context(context)
            if context_message:
                messages.append({
                    "role": "system",
                    "content": context_message
                })
        
        # Add conversation history (limit to last 10 messages to manage token usage)
        messages.extend(conversation_history[-10:])
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        return messages
    
    def _get_language_instruction(self, language: str) -> str:
        """
        Get language-specific instruction for the AI.
        
        Args:
            language: Target language
            
        Returns:
            Language instruction string
        """
        instructions = {
            'khmer': """IMPORTANT: Respond in Khmer language (ភាសាខ្មែរ). 
Use appropriate Khmer script and maintain cultural context.
Include relevant Khmer phrases and local terminology.""",
            'chinese': """重要提示：请用中文回复。
保持文化背景的准确性，使用适当的中文表达方式。
在适当的时候包含相关的当地术语。""",
            'english': """Respond in clear, friendly English.
Use simple language appropriate for international tourists."""
        }
        return instructions.get(language.lower(), instructions['english'])
    
    def _format_context(self, context: Dict[str, Any]) -> str:
        """
        Format context information into a system message.
        
        Args:
            context: Context dictionary
            
        Returns:
            Formatted context string
        """
        context_parts = ["**Current Available Options:**"]
        has_content = False
        
        if context.get("available_hotels"):
            hotels = context["available_hotels"]
            hotel_list = []
            for hotel in hotels[:5]:
                name = hotel.get('name', 'Unknown')
                price = hotel.get('price_per_night', 'N/A')
                location = hotel.get('location', '')
                hotel_list.append(f"- {name} ({location}) - ${price}/night")
            if hotel_list:
                context_parts.append("\nHotels:")
                context_parts.extend(hotel_list)
                has_content = True
        
        if context.get("available_tours"):
            tours = context["available_tours"]
            tour_list = []
            for tour in tours[:5]:
                name = tour.get('name', 'Unknown')
                price = tour.get('price', 'N/A')
                duration = tour.get('duration', '')
                tour_list.append(f"- {name} ({duration}) - ${price}")
            if tour_list:
                context_parts.append("\nTours:")
                context_parts.extend(tour_list)
                has_content = True
        
        if context.get("upcoming_events"):
            events = context["upcoming_events"]
            event_list = []
            for event in events[:3]:
                name = event.get('name', 'Unknown')
                date = event.get('date', '')
                location = event.get('location', '')
                event_list.append(f"- {name} at {location} on {date}")
            if event_list:
                context_parts.append("\nUpcoming Events:")
                context_parts.extend(event_list)
                has_content = True
        
        if context.get("user_preferences"):
            prefs = context["user_preferences"]
            pref_parts = []
            if prefs.get("budget"):
                pref_parts.append(f"Budget: ${prefs['budget']}")
            if prefs.get("interests"):
                pref_parts.append(f"Interests: {', '.join(prefs['interests'])}")
            if prefs.get("travel_dates"):
                pref_parts.append(f"Travel dates: {prefs['travel_dates']}")
            if prefs.get("group_size"):
                pref_parts.append(f"Group size: {prefs['group_size']} people")
            if pref_parts:
                context_parts.append("\nUser Preferences:")
                context_parts.extend([f"- {p}" for p in pref_parts])
                has_content = True
        
        if context.get("user_budget"):
            context_parts.append(f"\nUser's Budget: ${context['user_budget']}")
            has_content = True
        
        if context.get("booking_history"):
            bookings = context["booking_history"]
            if bookings:
                context_parts.append(f"\nUser has {len(bookings)} previous booking(s)")
                has_content = True
        
        return "\n".join(context_parts) if has_content else ""
