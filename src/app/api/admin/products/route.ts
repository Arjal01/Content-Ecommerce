import { NextRequest } from 'next/server'
import { AdminService } from '@/services/AdminService'
import { authGuard, successResponse, errorResponse, withErrorHandler } from '@/lib/api-utils'
import { ProductRepository } from '@/repositories/ProductRepository'
import { prisma } from '@/lib/db'

const adminService = new AdminService()
const productRepo = new ProductRepository()

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await authGuard(req, ['ADMIN'])
  if (auth.error) return errorResponse(auth.error, auth.status)

  const data = await req.json()

  // If no companyId is provided, use the first available company
  if (!data.companyId) {
    const companies = await prisma.company.findFirst()
    if (!companies) {
      return errorResponse('No company found. Please create a company first.', 400)
    }
    data.companyId = companies.id
  }

  const { name, description, price, discountPrice, affiliateLink } = data

  const product = await adminService.createProduct({
    name,
    description,
    price,
    discountPrice,
    affiliateLink,
    company: { connect: { id: data.companyId } }
  })
  return successResponse(product, 201)
})

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await authGuard(req, ['ADMIN'])
  if (auth.error) return errorResponse(auth.error, auth.status)

  const products = await productRepo.findAll()
  return successResponse(products)
})
