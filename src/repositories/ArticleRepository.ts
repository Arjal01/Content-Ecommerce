import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export class ArticleRepository {
  async findAll(publishedOnly = true) {
    return prisma.article.findMany({
      where: publishedOnly ? { published: true } : {},
      include: {
        company: true,
        products: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(id: string) {
    return prisma.article.findUnique({
      where: { id },
      include: {
        company: true,
        products: {
          include: { product: true }
        }
      }
    })
  }

  async create(data: Prisma.ArticleCreateUncheckedInput) {
    return prisma.article.create({ data })
  }

  async update(id: string, data: Prisma.ArticleUpdateUncheckedInput) {
    return prisma.article.update({
      where: { id },
      data
    })
  }

  async delete(id: string) {
    return prisma.article.delete({ where: { id } })
  }

  async addProduct(articleId: string, productId: string) {
    return prisma.articleProduct.create({
      data: { articleId, productId }
    })
  }

  async removeProduct(articleId: string, productId: string) {
    return prisma.articleProduct.delete({
      where: {
        articleId_productId: { articleId, productId }
      }
    })
  }
}
