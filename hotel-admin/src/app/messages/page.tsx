'use client';

import React, { useState, useEffect } from 'react';
import { Message } from '@/types';

interface Conversation {
  id: string;
  hotelId: string;
  bookingId: string;
  guestName: string;
  guestEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const hotelInfo = localStorage.getItem('hotel_info');
      const hotelId = hotelInfo ? JSON.parse(hotelInfo).id : 'default';

      const response = await fetch(`/api/messages?hotelId=${hotelId}`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.data);
        if (data.data.length > 0) {
          setSelectedConversation(data.data[0]);
        }
      } else {
        setError('Failed to load conversations');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          senderId: 'ADMIN001',
          content: messageText,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Add message to conversation
        const updatedConversation = {
          ...selectedConversation,
          messages: [...selectedConversation.messages, data.data],
          lastMessage: messageText,
          lastMessageTime: new Date().toISOString(),
        };
        setSelectedConversation(updatedConversation);

        // Update conversations list
        setConversations(
          conversations.map((c) =>
            c.id === selectedConversation.id ? updatedConversation : c
          )
        );

        setMessageText('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Mark unread messages as read
    if (conversation.unreadCount > 0) {
      try {
        for (const message of conversation.messages) {
          if (!message.isRead) {
            await fetch(`/api/messages/${message.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isRead: true }),
            });
          }
        }
        // Update conversation unread count
        const updatedConversation = { ...conversation, unreadCount: 0 };
        setSelectedConversation(updatedConversation);
        setConversations(
          conversations.map((c) =>
            c.id === conversation.id ? updatedConversation : c
          )
        );
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 px-6 pt-6">Messages</h1>

      {error && (
        <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-1 gap-6 px-6 pb-6 overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 bg-white rounded-lg shadow overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No conversations yet</p>
            </div>
          ) : (
            <div>
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{conversation.guestName}</h3>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTime(conversation.lastMessageTime)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className="flex-1 bg-white rounded-lg shadow flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{selectedConversation.guestName}</h2>
              <p className="text-sm text-gray-600">{selectedConversation.guestEmail}</p>
              <p className="text-xs text-gray-500 mt-1">Booking ID: {selectedConversation.bookingId}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderType === 'admin' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.senderType === 'admin'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs opacity-70">
                          {formatTime(
                            typeof message.createdAt === 'string'
                              ? message.createdAt
                              : message.createdAt.toISOString()
                          )}
                        </p>
                        {message.senderType === 'admin' && (
                          <span className="text-xs opacity-70">
                            {message.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-lg shadow flex items-center justify-center">
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

