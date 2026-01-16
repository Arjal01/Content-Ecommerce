import { NextRequest, NextResponse } from 'next/server';
import { payoutService } from '@/services/payout.service';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || undefined;

    const [balances, history] = await Promise.all([
      payoutService.getAllVendorBalances(),
      payoutService.getPayoutHistory(companyId),
    ]);

    return NextResponse.json({ balances, history });
  } catch (error) {
    console.error('Admin get payouts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { companyId, amount, notes } = body;

    if (!companyId || !amount) {
      return NextResponse.json({ error: 'companyId and amount are required' }, { status: 400 });
    }

    const payout = await payoutService.createPayout(companyId, amount, notes);

    return NextResponse.json({ payout });
  } catch (error) {
    console.error('Admin create payout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payout' },
      { status: 500 }
    );
  }
}
