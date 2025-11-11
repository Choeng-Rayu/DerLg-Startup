import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/bookings
 * Fetch all bookings for a hotel
 */
export async function GET(request: NextRequest) {
  try {
    const hotelId = request.nextUrl.searchParams.get('hotelId');
    const status = request.nextUrl.searchParams.get('status');

    if (!hotelId) {
      return NextResponse.json(
        { success: false, message: 'Hotel ID is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual API call to backend
    const mockBookings = [
      {
        id: 'BK001',
        hotelId,
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        guestPhone: '+855 12 345 678',
        roomType: 'Deluxe Room',
        checkInDate: '2024-12-15',
        checkOutDate: '2024-12-18',
        totalAmount: 240,
        paymentStatus: 'paid',
        bookingStatus: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'BK002',
        hotelId,
        guestName: 'Jane Smith',
        guestEmail: 'jane@example.com',
        guestPhone: '+855 98 765 432',
        roomType: 'Standard Room',
        checkInDate: '2024-12-20',
        checkOutDate: '2024-12-22',
        totalAmount: 100,
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'BK003',
        hotelId,
        guestName: 'Bob Johnson',
        guestEmail: 'bob@example.com',
        guestPhone: '+855 11 222 333',
        roomType: 'Suite',
        checkInDate: '2024-12-25',
        checkOutDate: '2024-12-27',
        totalAmount: 300,
        paymentStatus: 'pending',
        bookingStatus: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];

    // Filter by status if provided
    const filtered = status
      ? mockBookings.filter((b) => b.bookingStatus === status)
      : mockBookings;

    return NextResponse.json({
      success: true,
      data: filtered,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

