import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { authGuard, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  const auth = await authGuard(req, ['ADMIN'])
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const [clicks, orders] = await Promise.all([
      prisma.click.findMany({
        include: {
          product: { select: { name: true } },
          article: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.order.findMany({
        include: {
          product: { select: { name: true } },
          user: { select: { email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ])

    return successResponse({ clicks, orders })
  } catch (error: any) {
    return errorResponse(error.message)
  }
}
