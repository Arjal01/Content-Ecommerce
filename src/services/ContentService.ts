import { ArticleRepository } from '@/repositories/ArticleRepository'
import { CompanyRepository } from '@/repositories/CompanyRepository'

export class ContentService {
  private articleRepo = new ArticleRepository()
  private companyRepo = new CompanyRepository()

  async getFeed() {
    return this.articleRepo.findAll(true)
  }

  async getArticleDetails(id: string) {
    const article = await this.articleRepo.findById(id)
    if (!article || !article.published) throw new Error('Article not found')
    return article
  }

  async getCompanyProfile(id: string) {
    const company = await this.companyRepo.findById(id)
    if (!company) throw new Error('Company not found')
    return company
  }
}
