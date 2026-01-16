import { prisma } from '@/lib/db'
import { Company, Prisma } from '@prisma/client'

export class CompanyRepository {
  async findAll() {
    return prisma.company.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(id: string) {
    return prisma.company.findUnique({
      where: { id },
      include: { articles: true }
    })
  }

  async create(data: Prisma.CompanyCreateInput) {
    return prisma.company.create({ data })
  }

  async update(id: string, data: Prisma.CompanyUpdateInput) {
    return prisma.company.update({
      where: { id },
      data
    })
  }

  async delete(id: string) {
    return prisma.company.delete({ where: { id } })
  }
}
