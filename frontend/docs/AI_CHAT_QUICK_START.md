# AI Chat Assistant - Quick Start Guide

## Overview
The AI Chat Assistant provides three types of AI-powered travel assistance to help users plan their Cambodia trips.

## Accessing the Chat
- **URL**: `/chat-ai`
- **Navigation**: Click "AI Assistant" in the main header
- **Authentication**: Required (redirects to login if not authenticated)

## Three AI Types

### 1. Streaming Chat (Default)
**Best for**: Natural conversations and detailed planning

**Features**:
- Real-time streaming responses
- Character-by-character display
- Full conversation context
- Multi-turn dialogues

**Example Prompts**:
```
"What are the best hotels in Siem Reap?"
"Plan a 3-day trip to Angkor Wat with a $500 budget"
"Tell me about Khmer New Year celebrations"
"I need family-friendly activities in Phnom Penh"
```

### 2. Quick Recommendations
**Best for**: Fast, form-based suggestions

**How to Use**:
1. Click "Show Quick Form" button
2. Fill in the form:
   - **Destination** (optional): e.g., "Siem Reap", "Phnom Penh"
   - **Budget** (required): Total budget in USD
   - **Check-in Date** (optional): Start date
   - **Check-out Date** (optional): End date
   - **Guests** (default: 2): Number of travelers
3. Click "Get Recommendations"
4. View instant suggestions with booking links

**Example Form**:
```
Destination: Siem Reap
Budget: $800
Check-in: 2024-12-15
Check-out: 2024-12-20
Guests: 2
```

### 3. Event-Based Planner
**Best for**: Festival and cultural event planning

**Features**:
- Festival-focused recommendations
- Cultural event integration
- Seasonal activity suggestions
- Event timing optimization

**Example Prompts**:
```
"What festivals are happening in April?"
"Plan my trip around Water Festival"
"Show me cultural events in Phnom Penh"
```

## User Interface

### Layout
```
┌─────────────────────────────────────────────────┐
│  Header: AI Travel Assistant                    │
├──────────────┬──────────────────────────────────┤
│  Sidebar     │  Chat Area                       │
│              │                                  │
│  AI Types:   │  ┌────────────────────────────┐ │
│  • Streaming │  │ Welcome Message            │ │
│  • Quick     │  │ Example Prompts            │ │
│  • Event     │  └────────────────────────────┘ │
│              │                                  │
│  Actions:    │  [Messages appear here]         │
│  • Clear     │                                  │
│              │  ┌────────────────────────────┐ │
│              │  │ Input: Type message...     │ │
│              │  │ [Send Button]              │ │
│              │  └────────────────────────────┘ │
└──────────────┴──────────────────────────────────┘
```

### Message Display
- **User Messages**: Blue background, right-aligned
- **AI Messages**: Gray background, left-aligned
- **Timestamps**: Below each message
- **Formatting**: Supports bold text and links

### Quick Form (When Visible)
```
┌─────────────────────────────────────────────────┐
│  Quick Recommendation Form                      │
├─────────────────────────────────────────────────┤
│  Destination: [____________]  Budget: [_____]   │
│  Check-in: [__________]  Check-out: [________]  │
│  Guests: [__]                                   │
│  [Get Recommendations Button]                   │
└─────────────────────────────────────────────────┘
```

## Features

### Message Formatting
The chat supports markdown-like formatting:

**Bold Text**:
```
Input: "**Important**: Book early for best prices"
Output: Important: Book early for best prices (bold)
```

**Links**:
```
Input: "Check out [this hotel](/hotels/123)"
Output: Check out this hotel (clickable link)
```

### Recommendations Format
When AI provides recommendations, they appear as:
```
Based on your preferences, here are my top recommendations:

1. **Angkor Palace Resort & Spa**
   - Price: $120/night
   - Rating: 4.5 ⭐
   - Beautiful resort near Angkor Wat with pool...
   - [View Details](/hotels/abc123)

2. **Golden Temple Hotel**
   - Price: $85/night
   - Rating: 4.2 ⭐
   - Centrally located with great amenities...
   - [View Details](/hotels/def456)
```

### Auto-Scroll
- Automatically scrolls to latest message
- Smooth scrolling animation
- Maintains scroll position when typing

### Session Management
- Each chat session has a unique ID
- Conversation history preserved during session
- Clear chat resets the session

## API Integration

### Backend Requirements
The chat connects to the AI backend service:

**Base URL**: `NEXT_PUBLIC_AI_API_URL` (default: http://localhost:8000)

**Endpoints Used**:
1. `POST /api/chat` - Streaming and non-streaming chat
2. `POST /api/recommend` - Quick recommendations

### Request Examples

**Streaming Chat**:
```typescript
POST /api/chat
{
  "message": "What are the best hotels in Siem Reap?",
  "session_id": "session_1234567890_abc",
  "conversation_history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ],
  "stream": true
}
```

**Quick Recommendations**:
```typescript
POST /api/recommend
{
  "user_id": "current_user",
  "budget": 800,
  "destination": "Siem Reap",
  "check_in": "2024-12-15",
  "check_out": "2024-12-20",
  "preferences": {
    "guests": 2
  }
}
```

## Usage Tips

### Getting Started
1. **First Time**: Start with streaming chat to explore capabilities
2. **Quick Search**: Use quick recommendations when you know your budget
3. **Event Planning**: Switch to event-based for festival trips

### Best Practices
- Be specific in your questions
- Mention your budget for better recommendations
- Include dates for availability checking
- Ask follow-up questions for clarification
- Use the quick form for structured searches

### Example Conversations

**Planning a Trip**:
```
User: "I want to visit Angkor Wat. What should I know?"
AI: "Angkor Wat is Cambodia's most famous temple complex..."

User: "How many days do I need?"
AI: "I recommend 3-4 days to explore the main temples..."

User: "Can you recommend hotels near Angkor Wat?"
AI: "Here are some great options near the temples..."
```

**Budget Planning**:
```
User: "I have $1000 for a week in Cambodia. Is that enough?"
AI: "Yes! $1000 is a good budget for a week..."

User: "Break down the costs for me"
AI: "Here's a typical breakdown:
- Accommodation: $300-400
- Food: $150-200
- Tours: $200-250
- Transportation: $100
- Miscellaneous: $150-200"
```

## Troubleshooting

### Common Issues

**"Please login to access AI Assistant"**
- Solution: Click login and authenticate first

**Messages not streaming**
- Check: AI backend is running
- Check: Network connection
- Try: Refresh the page

**Recommendations not appearing**
- Verify: Budget field is filled
- Check: Valid number format
- Try: Submit form again

**Links not working**
- Verify: Hotel IDs are valid
- Check: Navigation is enabled
- Try: Right-click and open in new tab

### Error Messages

**"Sorry, I encountered an error"**
- The AI backend may be unavailable
- Check backend logs
- Try again in a moment

**"AI service network error"**
- Network connectivity issue
- Verify AI_API_URL is correct
- Check firewall settings

## Mobile Experience

### Responsive Design
- Optimized for screens 320px and up
- Touch-friendly buttons and inputs
- Collapsible sidebar on mobile
- Full-screen chat area

### Mobile Tips
- Use landscape mode for better typing
- Tap AI type buttons to switch modes
- Scroll up to see conversation history
- Use quick form for faster input

## Keyboard Shortcuts

- **Enter**: Send message
- **Escape**: Clear input (when empty)
- **Ctrl/Cmd + K**: Focus input field

## Privacy & Data

### What's Stored
- Conversation history (session only)
- Session ID (temporary)
- User preferences (if logged in)

### What's Not Stored
- Messages are not persisted to database
- Chat history clears on page refresh
- No tracking of conversation content

## Next Steps

After getting recommendations:
1. Click hotel links to view details
2. Check availability and pricing
3. Proceed to booking
4. Add to wishlist for later

## Support

For issues or questions:
- Check backend logs
- Verify environment variables
- Review API documentation
- Contact development team

## Future Enhancements

Planned features:
- Save conversation history
- Export chat transcripts
- Voice input/output
- Image upload for visual queries
- Multi-language UI
- Suggested prompts
- One-click booking from chat
- Real-time typing indicators

---

**Version**: 1.0  
**Last Updated**: 2024  
**Component**: Frontend - AI Chat Assistant
