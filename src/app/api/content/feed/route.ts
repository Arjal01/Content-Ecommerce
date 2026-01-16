import { NextRequest } from 'next/server'
import { ContentService } from '@/services/ContentService'
import { successResponse, withErrorHandler } from '@/lib/api-utils'

const contentService = new ContentService()

export const GET = withErrorHandler(async (req: NextRequest) => {
  const articles = await contentService.getFeed()
  return successResponse(articles)
})
