import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export class OrderRepository {
  async createOrder(data: Prisma.OrderCreateInput) {
    return prisma.order.create({ data })
  }

  async createClick(data: Prisma.ClickCreateInput) {
    return prisma.click.create({ data })
  }

  async getStats() {
    const clicks = await prisma.click.count()
    const orders = await prisma.order.count()
    const revenue = await prisma.order.aggregate({
      _sum: {
        amount: true
      }
    })
    return { clicks, orders, revenue: revenue._sum.amount || 0 }
  }
}
