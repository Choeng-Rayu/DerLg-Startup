import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/promo-codes
 * Fetch all promo codes for a hotel
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
    const mockPromoCodes = [
      {
        id: 'PROMO001',
        hotelId,
        code: 'SUMMER20',
        discountPercentage: 20,
        discountAmount: null,
        expirationDate: '2024-12-31',
        usageLimit: 100,
        usageCount: 45,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'PROMO002',
        hotelId,
        code: 'WELCOME10',
        discountPercentage: 10,
        discountAmount: null,
        expirationDate: '2024-12-15',
        usageLimit: 50,
        usageCount: 50,
        isActive: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'PROMO003',
        hotelId,
        code: 'LOYALTY15',
        discountPercentage: 15,
        discountAmount: null,
        expirationDate: '2025-06-30',
        usageLimit: 200,
        usageCount: 12,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockPromoCodes,
    });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch promo codes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/promo-codes
 * Create a new promo code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotelId, code, discountPercentage, discountAmount, expirationDate, usageLimit } = body;

    // Validation
    if (!hotelId || !code || (!discountPercentage && !discountAmount)) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (discountPercentage && (discountPercentage < 0 || discountPercentage > 100)) {
      return NextResponse.json(
        { success: false, message: 'Discount percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (discountAmount && discountAmount < 0) {
      return NextResponse.json(
        { success: false, message: 'Discount amount must be positive' },
        { status: 400 }
      );
    }

    if (usageLimit && usageLimit < 1) {
      return NextResponse.json(
        { success: false, message: 'Usage limit must be at least 1' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual API call to backend
    const newPromoCode = {
      id: `PROMO${Date.now()}`,
      hotelId,
      code: code.toUpperCase(),
      discountPercentage: discountPercentage || null,
      discountAmount: discountAmount || null,
      expirationDate,
      usageLimit: usageLimit || null,
      usageCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Promo code created successfully',
        data: newPromoCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create promo code' },
      { status: 500 }
    );
  }
}

