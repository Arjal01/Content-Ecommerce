import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services/order.service';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { items, couponCode, buyerState, shippingAddress, billingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    const order = await orderService.createOrder({
      userId: payload.userId,
      items,
      couponCode,
      buyerState,
      shippingAddress,
      billingAddress,
    });

    const { razorpayOrderId, amount, currency, keyId } = await orderService.createRazorpayOrder(order.id);

    return NextResponse.json({
      order,
      razorpayOrderId,
      amount,
      currency,
      keyId,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}
