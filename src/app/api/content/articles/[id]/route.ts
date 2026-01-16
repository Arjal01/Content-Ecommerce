import { NextRequest } from 'next/server'
import { ContentService } from '@/services/ContentService'
import { successResponse, withErrorHandler } from '@/lib/api-utils'

const contentService = new ContentService()

export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const article = await contentService.getArticleDetails(id)
  return successResponse(article)
})
