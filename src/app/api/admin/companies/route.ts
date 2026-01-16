import { NextRequest } from 'next/server'
import { AdminService } from '@/services/AdminService'
import { authGuard, successResponse, errorResponse } from '@/lib/api-utils'
import { CompanyRepository } from '@/repositories/CompanyRepository'

const adminService = new AdminService()
const companyRepo = new CompanyRepository()

export async function POST(req: NextRequest) {
  const auth = await authGuard(req, ['ADMIN'])
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const data = await req.json()
    const company = await adminService.createCompany(data)
    return successResponse(company, 201)
  } catch (error: any) {
    return errorResponse(error.message)
  }
}

export async function GET(req: NextRequest) {
  const auth = await authGuard(req, ['ADMIN'])
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const companies = await companyRepo.findAll()
    return successResponse(companies)
  } catch (error: any) {
    return errorResponse(error.message)
  }
}
