import { NextRequest, NextResponse } from 'next/server';

/**
 * PUT /api/bookings/[id]
 * Update booking status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await request.json();
    const { bookingStatus, reason } = body;

    if (!bookingStatus) {
      return NextResponse.json(
        { success: false, message: 'Booking status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(bookingStatus)) {
      return NextResponse.json(
        { success: false, message: 'Invalid booking status' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual API call to backend
    // TODO: Send email notification to guest
    // TODO: Process refund if status is 'rejected'

    const updatedBooking = {
      id: bookingId,
      bookingStatus,
      reason: reason || '',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: `Booking ${bookingStatus} successfully`,
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings/[id]
 * Get booking details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;

    // TODO: Replace with actual API call to backend
    const mockBooking = {
      id: bookingId,
      guestName: 'John Doe',
      guestEmail: 'john@example.com',
      guestPhone: '+855 12 345 678',
      roomType: 'Deluxe Room',
      checkInDate: '2024-12-15',
      checkOutDate: '2024-12-18',
      totalAmount: 240,
      paymentStatus: 'paid',
      bookingStatus: 'pending',
      specialRequests: 'High floor preferred',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockBooking,
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

