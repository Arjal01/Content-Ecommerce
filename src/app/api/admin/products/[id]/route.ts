import { NextRequest } from 'next/server'
import { AdminService } from '@/services/AdminService'
import { authGuard, successResponse, errorResponse } from '@/lib/api-utils'
import { ProductRepository } from '@/repositories/ProductRepository'

const adminService = new AdminService()
const productRepo = new ProductRepository()

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authGuard(req, ['ADMIN'])
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const { id } = await params
    const product = await productRepo.findById(id)
    if (!product) return errorResponse('Product not found', 404)
    return successResponse(product)
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
    const product = await adminService.updateProduct(id, data)
    return successResponse(product)
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
    await adminService.deleteProduct(id)
    return successResponse({ message: 'Product deleted' })
  } catch (error: any) {
    return errorResponse(error.message)
  }
}
