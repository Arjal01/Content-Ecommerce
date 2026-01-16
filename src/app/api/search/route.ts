import { NextRequest, NextResponse } from 'next/server';
import { searchService } from '@/services/search.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    let result;
    switch (type) {
      case 'articles':
        result = await searchService.searchArticles({ query, page, pageSize });
        break;
      case 'products':
        result = await searchService.searchProducts({ query, page, pageSize });
        break;
      case 'companies':
        result = await searchService.searchCompanies({ query, page, pageSize });
        break;
      case 'all':
      default:
        result = await searchService.searchAll({ query, page, pageSize });
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
