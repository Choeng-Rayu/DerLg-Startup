import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/dashboard/trends
 * Fetch booking trends for the last 30 days
 */
export async function GET(request: NextRequest) {
  try {
    const hotelId = request.nextUrl.searchParams.get('hotelId');
    const days = request.nextUrl.searchParams.get('days') || '30';

    if (!hotelId) {
      return NextResponse.json(
        { success: false, message: 'Hotel ID is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual API call to backend
    // Generate mock data for the last N days
    const mockTrends = generateMockTrends(parseInt(days));

    return NextResponse.json({
      success: true,
      data: mockTrends,
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}

function generateMockTrends(days: number) {
  const trends = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    trends.push({
      date: date.toISOString().split('T')[0],
      bookings: Math.floor(Math.random() * 10) + 2,
      revenue: Math.floor(Math.random() * 5000) + 1000,
    });
  }

  return trends;
}

