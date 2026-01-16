import { NextRequest, NextResponse } from 'next/server';
import { searchService } from '@/services/search.service';
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
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'users';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status') || undefined;

    let result;
    switch (type) {
      case 'users':
        result = await searchService.adminSearchUsers({ query, page, pageSize });
        break;
      case 'orders':
        result = await searchService.adminSearchOrders({ query, page, pageSize, status });
        break;
      case 'payments':
        result = await searchService.adminSearchPayments({ query, page, pageSize, status });
        break;
      case 'subscriptions':
        result = await searchService.adminSearchSubscriptions({ query, page, pageSize, status });
        break;
      default:
        return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
