import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchParams {
  query: string;
  page?: number;
  pageSize?: number;
}

export const searchService = {
  async searchArticles(params: SearchParams): Promise<SearchResult<Prisma.ArticleGetPayload<{ include: { company: true; products: { include: { product: true } } } }>>> {
    const { query, page = 1, pageSize = 10 } = params;
    const skip = (page - 1) * pageSize;

    const searchQuery = query.split(' ').filter(Boolean).join(' & ');

    const [items, total] = await Promise.all([
      prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Article"
        WHERE "searchVector" @@ to_tsquery('english', ${searchQuery})
        AND published = true
        ORDER BY ts_rank("searchVector", to_tsquery('english', ${searchQuery})) DESC
        LIMIT ${pageSize} OFFSET ${skip}
      `.then(async (results) => {
        const ids = results.map(r => r.id);
        if (ids.length === 0) return [];
        return prisma.article.findMany({
          where: { id: { in: ids }, published: true },
          include: {
            company: true,
            products: { include: { product: true } },
          },
        });
      }),
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM "Article"
        WHERE "searchVector" @@ to_tsquery('english', ${searchQuery})
        AND published = true
      `.then(result => Number(result[0]?.count || 0)),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async searchProducts(params: SearchParams): Promise<SearchResult<Prisma.ProductGetPayload<{ include: { company: true } }>>> {
    const { query, page = 1, pageSize = 10 } = params;
    const skip = (page - 1) * pageSize;

    const searchQuery = query.split(' ').filter(Boolean).join(' & ');

    const [items, total] = await Promise.all([
      prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Product"
        WHERE "searchVector" @@ to_tsquery('english', ${searchQuery})
        AND "isActive" = true
        ORDER BY ts_rank("searchVector", to_tsquery('english', ${searchQuery})) DESC
        LIMIT ${pageSize} OFFSET ${skip}
      `.then(async (results) => {
        const ids = results.map(r => r.id);
        if (ids.length === 0) return [];
        return prisma.product.findMany({
          where: { id: { in: ids }, isActive: true },
          include: { company: true },
        });
      }),
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM "Product"
        WHERE "searchVector" @@ to_tsquery('english', ${searchQuery})
        AND "isActive" = true
      `.then(result => Number(result[0]?.count || 0)),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async searchCompanies(params: SearchParams): Promise<SearchResult<Prisma.CompanyGetPayload<{}>>> {
    const { query, page = 1, pageSize = 10 } = params;
    const skip = (page - 1) * pageSize;

    const searchQuery = query.split(' ').filter(Boolean).join(' & ');

    const [items, total] = await Promise.all([
      prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Company"
        WHERE "searchVector" @@ to_tsquery('english', ${searchQuery})
        ORDER BY ts_rank("searchVector", to_tsquery('english', ${searchQuery})) DESC
        LIMIT ${pageSize} OFFSET ${skip}
      `.then(async (results) => {
        const ids = results.map(r => r.id);
        if (ids.length === 0) return [];
        return prisma.company.findMany({
          where: { id: { in: ids } },
        });
      }),
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM "Company"
        WHERE "searchVector" @@ to_tsquery('english', ${searchQuery})
      `.then(result => Number(result[0]?.count || 0)),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async searchAll(params: SearchParams) {
    const [articles, products, companies] = await Promise.all([
      this.searchArticles({ ...params, pageSize: 5 }),
      this.searchProducts({ ...params, pageSize: 5 }),
      this.searchCompanies({ ...params, pageSize: 5 }),
    ]);

    return {
      articles,
      products,
      companies,
    };
  },

  async adminSearchUsers(params: SearchParams) {
    const { query, page = 1, pageSize = 10 } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.UserWhereInput = {
      OR: [
        { email: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async adminSearchOrders(params: SearchParams & { status?: string }) {
    const { query, page = 1, pageSize = 10, status } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.OrderWhereInput = {
      AND: [
        {
          OR: [
            { orderNumber: { contains: query, mode: 'insensitive' } },
            { user: { email: { contains: query, mode: 'insensitive' } } },
          ],
        },
        status ? { status: status as Prisma.EnumOrderStatusFilter['equals'] } : {},
      ],
    };

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
          items: { include: { product: true } },
          payment: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async adminSearchPayments(params: SearchParams & { status?: string }) {
    const { query, page = 1, pageSize = 10, status } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.PaymentWhereInput = {
      AND: [
        {
          OR: [
            { stripePaymentIntentId: { contains: query, mode: 'insensitive' } },
            { order: { orderNumber: { contains: query, mode: 'insensitive' } } },
          ],
        },
        status ? { status: status as Prisma.EnumPaymentStatusFilter['equals'] } : {},
      ],
    };

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: {
            include: {
              user: { select: { id: true, email: true, name: true } },
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async adminSearchSubscriptions(params: SearchParams & { status?: string }) {
    const { query, page = 1, pageSize = 10, status } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.SubscriptionWhereInput = {
      AND: [
        {
          OR: [
            { user: { email: { contains: query, mode: 'insensitive' } } },
            { stripeSubscriptionId: { contains: query, mode: 'insensitive' } },
          ],
        },
        status ? { status: status as Prisma.EnumSubscriptionStatusFilter['equals'] } : {},
      ],
    };

    const [items, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
          plan: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscription.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async updateSearchVectors() {
    await prisma.$executeRaw`
      UPDATE "Article" SET "searchVector" = to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
    `;
    await prisma.$executeRaw`
      UPDATE "Product" SET "searchVector" = to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
    `;
    await prisma.$executeRaw`
      UPDATE "Company" SET "searchVector" = to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
    `;
  },
};
