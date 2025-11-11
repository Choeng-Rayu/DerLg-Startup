import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/dashboard/room-performance
 * Fetch top-performing room types
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
    const mockRoomPerformance = [
      {
        roomType: 'Deluxe Suite',
        bookings: 45,
        revenue: 18000,
        occupancyRate: 85,
      },
      {
        roomType: 'Standard Room',
        bookings: 62,
        revenue: 15500,
        occupancyRate: 78,
      },
      {
        roomType: 'Family Room',
        bookings: 28,
        revenue: 8400,
        occupancyRate: 65,
      },
      {
        roomType: 'Penthouse',
        bookings: 12,
        revenue: 9600,
        occupancyRate: 92,
      },
      {
        roomType: 'Budget Room',
        bookings: 9,
        revenue: 1800,
        occupancyRate: 45,
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockRoomPerformance,
    });
  } catch (error) {
    console.error('Error fetching room performance:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch room performance' },
      { status: 500 }
    );
  }
}

