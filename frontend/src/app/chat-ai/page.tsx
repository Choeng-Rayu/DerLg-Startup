'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import { aiApi, getAuthToken } from '@/lib/api';
import { ChatMessage, AIType } from '@/types';

export default function ChatAIPage() {
  const router = useRouter();
  const [aiType, setAiType] = useState<AIType>('streaming');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  // Quick recommendation form state
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [quickFormData, setQuickFormData] = useState({
    destination: '',
    budget: '',
    checkIn: '',
    checkOut: '',
    guests: '2',
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Check authentication
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login?redirect=/chat-ai');
    }
  }, [router]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle streaming chat
  const handleStreamingChat = async (message: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000'}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
          conversation_history: messages.map(m => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      // Create assistant message placeholder
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'assistant') {
                      lastMessage.content += parsed.content;
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    }
  };

  // Handle non-streaming chat
  const handleRegularChat = async (message: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await aiApi.post<{ response: string; session_id: string }>(
        '/chat',
        {
          message,
          session_id: sessionId,
          conversation_history: messages.map(m => ({ role: m.role, content: m.content })),
          stream: false,
        },
        token
      );

      if (response.success && response.data) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: response.data!.response,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error(response.error?.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    }
  };

  // Handle quick recommendations
  const handleQuickRecommendation = async () => {
    const token = getAuthToken();
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await aiApi.post<{ recommendations: any[]; total: number }>(
        '/recommend',
        {
          user_id: 'current_user', // This should come from auth context
          budget: parseFloat(quickFormData.budget),
          destination: quickFormData.destination || undefined,
          check_in: quickFormData.checkIn || undefined,
          check_out: quickFormData.checkOut || undefined,
          preferences: {
            guests: parseInt(quickFormData.guests),
          },
        },
        token
      );

      if (response.success && response.data) {
        const recommendations = response.data.recommendations;
        
        // Add user message
        const userMessage = `I'm looking for recommendations in ${quickFormData.destination || 'Cambodia'} with a budget of $${quickFormData.budget} for ${quickFormData.guests} guests${quickFormData.checkIn ? ` from ${quickFormData.checkIn} to ${quickFormData.checkOut}` : ''}.`;
        
        setMessages(prev => [
          ...prev,
          {
            role: 'user',
            content: userMessage,
            timestamp: new Date(),
          },
        ]);

        // Format recommendations as assistant message
        let recommendationText = `Based on your preferences, here are my top recommendations:\n\n`;
        
        recommendations.forEach((rec, index) => {
          recommendationText += `${index + 1}. **${rec.name}**\n`;
          recommendationText += `   - Price: $${rec.price}\n`;
          recommendationText += `   - Rating: ${rec.rating || 'N/A'} ⭐\n`;
          if (rec.description) {
            recommendationText += `   - ${rec.description.substring(0, 100)}...\n`;
          }
          recommendationText += `   - [View Details](/hotels/${rec.id})\n\n`;
        });

        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: recommendationText,
            timestamp: new Date(),
          },
        ]);

        setShowQuickForm(false);
        setQuickFormData({
          destination: '',
          budget: '',
          checkIn: '',
          checkOut: '',
          guests: '2',
        });
      }
    } catch (error) {
      console.error('Quick recommendation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      if (aiType === 'streaming') {
        await handleStreamingChat(inputMessage);
      } else {
        await handleRegularChat(inputMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format message content with markdown-like formatting
  const formatMessage = (content: string) => {
    // Convert **text** to bold
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert [text](url) to links
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');
    
    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    
    return formatted;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Travel Assistant</h1>
          <p className="text-gray-600">
            Get personalized recommendations and plan your perfect Cambodia trip with AI assistance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-900">AI Type</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <button
                    onClick={() => setAiType('streaming')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      aiType === 'streaming'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">Streaming Chat</div>
                    <div className="text-sm opacity-75">Real-time conversation</div>
                  </button>

                  <button
                    onClick={() => setAiType('quick')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      aiType === 'quick'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">Quick Recommendations</div>
                    <div className="text-sm opacity-75">Instant suggestions</div>
                  </button>

                  <button
                    onClick={() => setAiType('event-based')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      aiType === 'event-based'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">Event Planner</div>
                    <div className="text-sm opacity-75">Festival-based trips</div>
                  </button>
                </div>

                {aiType === 'quick' && (
                  <div className="mt-4">
                    <Button
                      onClick={() => setShowQuickForm(!showQuickForm)}
                      variant="outline"
                      size="sm"
                      fullWidth
                    >
                      {showQuickForm ? 'Hide Form' : 'Show Quick Form'}
                    </Button>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    onClick={() => {
                      setMessages([]);
                      setInputMessage('');
                    }}
                    variant="ghost"
                    size="sm"
                    fullWidth
                  >
                    Clear Chat
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              {/* Quick Recommendation Form */}
              {showQuickForm && aiType === 'quick' && (
                <div className="p-4 bg-blue-50 border-b border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Recommendation Form</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label="Destination"
                      placeholder="e.g., Siem Reap, Phnom Penh"
                      value={quickFormData.destination}
                      onChange={(e) => setQuickFormData(prev => ({ ...prev, destination: e.target.value }))}
                    />
                    <Input
                      label="Budget (USD)"
                      type="number"
                      placeholder="e.g., 500"
                      value={quickFormData.budget}
                      onChange={(e) => setQuickFormData(prev => ({ ...prev, budget: e.target.value }))}
                      required
                    />
                    <Input
                      label="Check-in Date"
                      type="date"
                      value={quickFormData.checkIn}
                      onChange={(e) => setQuickFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                    />
                    <Input
                      label="Check-out Date"
                      type="date"
                      value={quickFormData.checkOut}
                      onChange={(e) => setQuickFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                    />
                    <Input
                      label="Number of Guests"
                      type="number"
                      min="1"
                      value={quickFormData.guests}
                      onChange={(e) => setQuickFormData(prev => ({ ...prev, guests: e.target.value }))}
                    />
                  </div>
                  <div className="mt-3">
                    <Button
                      onClick={handleQuickRecommendation}
                      isLoading={isLoading}
                      disabled={!quickFormData.budget}
                      fullWidth
                    >
                      Get Recommendations
                    </Button>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-12">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-semibold mb-2">Welcome to AI Travel Assistant</h3>
                    <p className="text-sm">
                      Ask me anything about Cambodia travel, hotels, tours, or let me help you plan your perfect trip!
                    </p>
                    <div className="mt-6 space-y-2 text-sm text-left max-w-md mx-auto">
                      <p className="font-medium">Try asking:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>"What are the best hotels in Siem Reap?"</li>
                        <li>"Plan a 3-day trip to Angkor Wat with a $500 budget"</li>
                        <li>"What festivals are happening in Cambodia this month?"</li>
                        <li>"Recommend family-friendly activities in Phnom Penh"</li>
                      </ul>
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                      />
                      <div
                        className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && aiType !== 'streaming' && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    Send
                  </Button>
                </form>
                <p className="text-xs text-gray-500 mt-2">
                  {aiType === 'streaming' && 'Streaming mode: Real-time responses'}
                  {aiType === 'quick' && 'Quick mode: Instant recommendations'}
                  {aiType === 'event-based' && 'Event mode: Festival-based planning'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
