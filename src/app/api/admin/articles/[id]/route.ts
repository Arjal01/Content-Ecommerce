import { NextRequest } from 'next/server'
import { AdminService } from '@/services/AdminService'
import { authGuard, successResponse, errorResponse } from '@/lib/api-utils'
import { ArticleRepository } from '@/repositories/ArticleRepository'

const adminService = new AdminService()
const articleRepo = new ArticleRepository()

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authGuard(req, ['ADMIN'])
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const { id } = await params
    const article = await articleRepo.findById(id)
    if (!article) return errorResponse('Article not found', 404)
    return successResponse(article)
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
    const article = await adminService.updateArticle(id, data)
    return successResponse(article)
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
    await adminService.deleteArticle(id)
    return successResponse({ message: 'Article deleted' })
  } catch (error: any) {
    return errorResponse(error.message)
  }
}
