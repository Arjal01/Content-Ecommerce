import { NextRequest } from 'next/server'
import { AdminService } from '@/services/AdminService'
import { authGuard, successResponse, errorResponse } from '@/lib/api-utils'
import { CompanyRepository } from '@/repositories/CompanyRepository'

const adminService = new AdminService()
const companyRepo = new CompanyRepository()

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authGuard(req, ['ADMIN'])
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const { id } = await params
    const company = await companyRepo.findById(id)
    if (!company) return errorResponse('Company not found', 404)
    return successResponse(company)
  } catch (error: any) {
    return errorResponse(error.message)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authGuard(req, ['ADMIN'])
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const { id } = await params
    const data = await req.json()
    const company = await adminService.updateCompany(id, data)
    return successResponse(company)
  } catch (error: any) {
    return errorResponse(error.message)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authGuard(req, ['ADMIN'])
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const { id } = await params
    await adminService.deleteCompany(id)
    return successResponse({ message: 'Company deleted' })
  } catch (error: any) {
    return errorResponse(error.message)
  }
}
