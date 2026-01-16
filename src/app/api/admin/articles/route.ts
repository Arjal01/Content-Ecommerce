import { NextRequest } from 'next/server'
import { AdminService } from '@/services/AdminService'
import { authGuard, successResponse, errorResponse } from '@/lib/api-utils'
import { ArticleRepository } from '@/repositories/ArticleRepository'

const adminService = new AdminService()
const articleRepo = new ArticleRepository()

export async function POST(req: NextRequest) {
  const auth = await authGuard(req, ['ADMIN'])
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const data = await req.json()
    const article = await adminService.createArticle(data)
    return successResponse(article, 201)
  } catch (error: any) {
    return errorResponse(error.message)
  }
}

export async function GET(req: NextRequest) {
  const auth = await authGuard(req, ['ADMIN'])
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const articles = await articleRepo.findAll(false)
    return successResponse(articles)
  } catch (error: any) {
    return errorResponse(error.message)
  }
}
