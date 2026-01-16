import { NextRequest } from 'next/server'
import { AdminService } from '@/services/AdminService'
import { authGuard, successResponse, errorResponse } from '@/lib/api-utils'

const adminService = new AdminService()

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authGuard(req, ['ADMIN'])
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const { id } = await params
    const { productId } = await req.json()
    await adminService.addProductToArticle(id, productId)
    return successResponse({ message: 'Product added to article' }, 201)
  } catch (error: any) {
    return errorResponse(error.message)
  }
}
