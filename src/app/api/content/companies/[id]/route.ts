import { NextRequest } from 'next/server'
import { ContentService } from '@/services/ContentService'
import { successResponse, errorResponse } from '@/lib/api-utils'

const contentService = new ContentService()

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const company = await contentService.getCompanyProfile(id)
    return successResponse(company)
  } catch (error: any) {
    return errorResponse(error.message, 404)
  }
}
