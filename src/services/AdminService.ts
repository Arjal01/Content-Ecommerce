import { CompanyRepository } from '@/repositories/CompanyRepository'
import { ArticleRepository } from '@/repositories/ArticleRepository'
import { ProductRepository } from '@/repositories/ProductRepository'
import { Prisma } from '@prisma/client'

export class AdminService {
  private companyRepo = new CompanyRepository()
  private articleRepo = new ArticleRepository()
  private productRepo = new ProductRepository()

  // Companies
  async createCompany(data: Prisma.CompanyCreateInput) {
    return this.companyRepo.create(data)
  }

  async updateCompany(id: string, data: Prisma.CompanyUpdateInput) {
    return this.companyRepo.update(id, data)
  }

  async deleteCompany(id: string) {
    return this.companyRepo.delete(id)
  }

  // Articles
  async createArticle(data: Prisma.ArticleCreateUncheckedInput) {
    return this.articleRepo.create(data)
  }

  async updateArticle(id: string, data: Prisma.ArticleUpdateUncheckedInput) {
    return this.articleRepo.update(id, data)
  }

  async deleteArticle(id: string) {
    return this.articleRepo.delete(id)
  }

  async publishArticle(id: string, published: boolean) {
    return this.articleRepo.update(id, { published })
  }

  // Products
  async createProduct(data: Prisma.ProductCreateInput) {
    return this.productRepo.create(data)
  }

  async updateProduct(id: string, data: Prisma.ProductUpdateInput) {
    return this.productRepo.update(id, data)
  }

  async deleteProduct(id: string) {
    return this.productRepo.delete(id)
  }

  // Mapping
  async addProductToArticle(articleId: string, productId: string) {
    return this.articleRepo.addProduct(articleId, productId)
  }

  async removeProductFromArticle(articleId: string, productId: string) {
    return this.articleRepo.removeProduct(articleId, productId)
  }
}
