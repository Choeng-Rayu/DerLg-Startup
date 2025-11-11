import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/dashboard/kpis
 * Fetch dashboard KPIs for hotel admin
 */
export async function GET(request: NextRequest) {
  try {
    // Get hotel ID from query params or auth token
    const hotelId = request.nextUrl.searchParams.get('hotelId');

    if (!hotelId) {
      return NextResponse.json(
        { success: false, message: 'Hotel ID is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual API call to backend
    // For now, return mock data
    const mockKpis = {
      success: true,
      data: {
        totalBookings: 156,
        dailyBookings: 5,
        monthlyBookings: 42,
        yearlyBookings: 156,
        totalRevenue: 45600,
        averageOccupancyRate: 72.5,
        averageCustomerRating: 4.6,
        pendingBookings: 3,
      },
    };

    return NextResponse.json(mockKpis);
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch KPIs' },
      { status: 500 }
    );
  }
}

