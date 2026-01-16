import { NextRequest, NextResponse } from 'next/server';
import { payoutService } from '@/services/payout.service';
import { verifyToken } from '@/lib/auth';

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
    const { bankReference } = body;

    const result = await payoutService.processPayout(id, bankReference);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin process payout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process payout' },
      { status: 500 }
    );
  }
}
