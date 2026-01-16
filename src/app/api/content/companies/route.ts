import { CompanyRepository } from '@/repositories/CompanyRepository'
import { successResponse } from '@/lib/api-utils'

const companyRepo = new CompanyRepository()

export async function GET() {
  const companies = await companyRepo.findAll()
  return successResponse(companies)
}
