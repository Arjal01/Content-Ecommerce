import { NextResponse } from 'next/server';
import { subscriptionService } from '@/services/subscription.service';

export async function GET() {
  try {
    const plans = await subscriptionService.getPlans();
    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}
