import { NextRequest, NextResponse } from 'next/server';

/**
 * PUT /api/rooms/[id]
 * Update a room
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const body = await request.json();
    const { price, capacity, availability, description, roomType } = body;

    // Validation
    if (price !== undefined && price <= 0) {
      return NextResponse.json(
        { success: false, message: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    if (capacity !== undefined && (capacity < 1 || capacity > 20)) {
      return NextResponse.json(
        { success: false, message: 'Capacity must be between 1 and 20 guests' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual API call to backend
    const updatedRoom = {
      id: roomId,
      roomType: roomType || 'Standard Room',
      price: price || 50,
      capacity: capacity || 2,
      availability: availability || 0,
      description: description || '',
      images: [],
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Room updated successfully',
      data: updatedRoom,
    });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update room' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rooms/[id]
 * Delete a room
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;

    // TODO: Replace with actual API call to backend
    return NextResponse.json({
      success: true,
      message: 'Room deleted successfully',
      data: { id: roomId },
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete room' },
      { status: 500 }
    );
  }
}

