import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/messages
 * Fetch all conversations for a hotel
 */
export async function GET(request: NextRequest) {
  try {
    const hotelId = request.nextUrl.searchParams.get('hotelId');
    const bookingId = request.nextUrl.searchParams.get('bookingId');

    if (!hotelId) {
      return NextResponse.json(
        { success: false, message: 'Hotel ID is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual API call to backend
    const mockConversations = [
      {
        id: 'CONV001',
        hotelId,
        bookingId: 'BOOKING001',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        lastMessage: 'Can I check in early?',
        lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 2,
        messages: [
          {
            id: 'MSG001',
            conversationId: 'CONV001',
            senderId: 'GUEST001',
            senderType: 'customer',
            senderName: 'John Doe',
            content: 'Hi, I have a question about my booking',
            isRead: true,
            readAt: new Date(Date.now() - 7200000).toISOString(),
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: 'MSG002',
            conversationId: 'CONV001',
            senderId: 'ADMIN001',
            senderType: 'admin',
            senderName: 'Hotel Manager',
            content: 'Hello! How can I help you?',
            isRead: true,
            readAt: new Date(Date.now() - 6000000).toISOString(),
            createdAt: new Date(Date.now() - 6000000).toISOString(),
          },
          {
            id: 'MSG003',
            conversationId: 'CONV001',
            senderId: 'GUEST001',
            senderType: 'customer',
            senderName: 'John Doe',
            content: 'Can I check in early?',
            isRead: false,
            readAt: null,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      },
      {
        id: 'CONV002',
        hotelId,
        bookingId: 'BOOKING002',
        guestName: 'Jane Smith',
        guestEmail: 'jane@example.com',
        lastMessage: 'Thank you for the information',
        lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
        unreadCount: 0,
        messages: [],
      },
      {
        id: 'CONV003',
        hotelId,
        bookingId: 'BOOKING003',
        guestName: 'Bob Johnson',
        guestEmail: 'bob@example.com',
        lastMessage: 'Looking forward to my stay',
        lastMessageTime: new Date(Date.now() - 172800000).toISOString(),
        unreadCount: 1,
        messages: [],
      },
    ];

    if (bookingId) {
      const conversation = mockConversations.find((c) => c.bookingId === bookingId);
      return NextResponse.json({
        success: true,
        data: conversation || null,
      });
    }

    return NextResponse.json({
      success: true,
      data: mockConversations,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Send a new message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, senderId, content } = body;

    if (!conversationId || !senderId || !content) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual API call to backend
    const newMessage = {
      id: `MSG${Date.now()}`,
      conversationId,
      senderId,
      senderType: 'admin',
      senderName: 'Hotel Manager',
      content,
      isRead: false,
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully',
        data: newMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}

