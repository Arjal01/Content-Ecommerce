import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, expiryDate, isActive } = body;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(discountType && { discountType }),
        ...(discountValue !== undefined && { discountValue: new Decimal(discountValue) }),
        ...(minOrderValue !== undefined && { minOrderValue: minOrderValue ? new Decimal(minOrderValue) : null }),
        ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? new Decimal(maxDiscount) : null }),
        ...(usageLimit !== undefined && { usageLimit }),
        ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Admin update coupon error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete coupon error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
