import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export class ProductRepository {
  async findAll() {
    return prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id }
    })
  }

  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data })
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data
    })
  }

  async delete(id: string) {
    return prisma.product.delete({ where: { id } })
  }
}
