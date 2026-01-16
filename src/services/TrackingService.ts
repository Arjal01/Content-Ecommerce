import { prisma } from '@/lib/db'
import { OrderStatus } from '@prisma/client'

export class TrackingService {
  async trackClick(articleId: string, productId: string, userId?: string, ip?: string, ua?: string) {
    return prisma.click.create({
      data: {
        articleId,
        productId,
        userId,
        ipAddress: ip,
        userAgent: ua
      }
    })
  }

  async trackOrder(productId: string, userId: string, amount: number) {
    return prisma.order.create({
      data: {
        productId,
        userId,
        amount,
        status: OrderStatus.COMPLETED
      }
    })
  }

  async getAnalytics() {
    const clicks = await prisma.click.count()
    const orders = await prisma.order.count()
    const revenue = await prisma.order.aggregate({
      _sum: { amount: true }
    })

    return { clicks, orders, totalRevenue: revenue._sum.amount || 0 }
  }
}
