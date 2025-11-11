import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/hotel/profile
 * Fetch hotel profile
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
    const mockHotel = {
      success: true,
      data: {
        id: hotelId,
        name: 'Sample Hotel',
        description: 'A beautiful hotel in the heart of the city',
        address: '123 Main Street',
        city: 'Phnom Penh',
        country: 'Cambodia',
        phone: '+855 23 123 456',
        email: 'hotel@example.com',
        website: 'https://example.com',
        images: [],
        amenities: ['WiFi', 'Pool', 'Restaurant', 'Gym'],
        starRating: 4,
      },
    };

    return NextResponse.json(mockHotel);
  } catch (error) {
    console.error('Error fetching hotel profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch hotel profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/hotel/profile
 * Update hotel profile
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotelId, ...updateData } = body;

    if (!hotelId) {
      return NextResponse.json(
        { success: false, message: 'Hotel ID is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual API call to backend
    // Validate required fields
    if (!updateData.name || !updateData.email) {
      return NextResponse.json(
        { success: false, message: 'Name and email are required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hotel profile updated successfully',
      data: { id: hotelId, ...updateData },
    });
  } catch (error) {
    console.error('Error updating hotel profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update hotel profile' },
      { status: 500 }
    );
  }
}

