import { NextRequest, NextResponse } from 'next/server';

/**
 * PUT /api/messages/[id]
 * Mark message as read
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params;
    const body = await request.json();
    const { isRead } = body;

    // TODO: Replace with actual API call to backend
    const updatedMessage = {
      id: messageId,
      isRead: isRead !== undefined ? isRead : true,
      readAt: isRead ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Message updated successfully',
      data: updatedMessage,
    });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update message' },
      { status: 500 }
    );
  }
}

