"""Chat assistant API routes."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from models.chat_model import ChatAssistant

router = APIRouter(prefix="/api", tags=["chat"])

# Initialize chat assistant
chat_assistant = ChatAssistant()


class ChatMessage(BaseModel):
    """Chat message model."""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    """Request model for chat."""
    message: str = Field(..., description="User's message")
    session_id: str = Field(..., description="Conversation session ID")
    conversation_history: List[ChatMessage] = Field(
        default_factory=list,
        description="Previous messages in the conversation"
    )
    context: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional context (available hotels, tours, etc.)"
    )
    stream: bool = Field(
        default=False,
        description="Whether to stream the response"
    )


class ChatResponse(BaseModel):
    """Response model for chat."""
    success: bool
    response: str
    session_id: str


@router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """
    Chat with the AI travel assistant.
    
    Supports both streaming and non-streaming responses.
    The assistant can:
    - Answer travel questions
    - Provide recommendations
    - Help plan itineraries
    - Explain cultural context
    
    Supports multiple languages: English, Khmer, Chinese
    """
    try:
        # Convert ChatMessage objects to dict format
        history = [
            {"role": msg.role, "content": msg.content}
            for msg in request.conversation_history
        ]
        
        if request.stream:
            # Return streaming response
            async def generate():
                async for chunk in chat_assistant.chat_stream(
                    user_message=request.message,
                    conversation_history=history,
                    context=request.context
                ):
                    yield chunk
            
            return StreamingResponse(
                generate(),
                media_type="text/event-stream"
            )
        else:
            # Return complete response
            response = await chat_assistant.chat(
                user_message=request.message,
                conversation_history=history,
                context=request.context
            )
            
            return ChatResponse(
                success=True,
                response=response,
                session_id=request.session_id
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat failed: {str(e)}"
        )
