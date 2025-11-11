import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/rooms
 * Fetch all rooms for a hotel
 */
export async function GET(request: NextRequest) {
  try {
    const hotelId = request.nextUrl.searchParams.get('hotelId');

    if (!hotelId) {
      return NextResponse.json(
        { success: false, message: 'Hotel ID is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual API call to backend
    const mockRooms = [
      {
        id: '1',
        hotelId,
        roomType: 'Standard Room',
        price: 50,
        capacity: 2,
        availability: 5,
        description: 'Comfortable room with basic amenities',
        images: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        hotelId,
        roomType: 'Deluxe Room',
        price: 80,
        capacity: 3,
        availability: 3,
        description: 'Spacious room with premium amenities',
        images: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        hotelId,
        roomType: 'Suite',
        price: 150,
        capacity: 4,
        availability: 2,
        description: 'Luxury suite with separate living area',
        images: [],
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockRooms,
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rooms
 * Create a new room
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotelId, roomType, price, capacity, availability, description } = body;

    // Validation
    if (!hotelId || !roomType || price === undefined || !capacity) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { success: false, message: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    if (capacity < 1 || capacity > 20) {
      return NextResponse.json(
        { success: false, message: 'Capacity must be between 1 and 20 guests' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual API call to backend
    const newRoom = {
      id: Date.now().toString(),
      hotelId,
      roomType,
      price,
      capacity,
      availability: availability || 0,
      description: description || '',
      images: [],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Room created successfully',
        data: newRoom,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create room' },
      { status: 500 }
    );
  }
}

