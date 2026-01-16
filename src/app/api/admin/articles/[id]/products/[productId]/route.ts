import { NextRequest } from 'next/server'
import { AdminService } from '@/services/AdminService'
import { authGuard, successResponse, errorResponse } from '@/lib/api-utils'

const adminService = new AdminService()

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const auth = await authGuard(req, ['ADMIN'])
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const { id, productId } = await params
    await adminService.removeProductFromArticle(id, productId)
    return successResponse({ message: 'Product removed from article' })
  } catch (error: any) {
    return errorResponse(error.message)
  }
}
