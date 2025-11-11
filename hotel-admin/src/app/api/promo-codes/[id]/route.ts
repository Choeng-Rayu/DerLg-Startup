import { NextRequest, NextResponse } from 'next/server';

/**
 * PUT /api/promo-codes/[id]
 * Update a promo code
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promoCodeId } = await params;
    const body = await request.json();
    const { discountPercentage, discountAmount, expirationDate, usageLimit, isActive } = body;

    // Validation
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
    const updatedPromoCode = {
      id: promoCodeId,
      discountPercentage: discountPercentage || null,
      discountAmount: discountAmount || null,
      expirationDate,
      usageLimit: usageLimit || null,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Promo code updated successfully',
      data: updatedPromoCode,
    });
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update promo code' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/promo-codes/[id]
 * Delete a promo code
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promoCodeId } = await params;

    // TODO: Replace with actual API call to backend
    return NextResponse.json({
      success: true,
      message: 'Promo code deleted successfully',
      data: { id: promoCodeId },
    });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete promo code' },
      { status: 500 }
    );
  }
}

