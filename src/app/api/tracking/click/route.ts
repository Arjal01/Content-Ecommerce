import { NextRequest } from 'next/server'
import { TrackingService } from '@/services/TrackingService'
import { successResponse, withErrorHandler } from '@/lib/api-utils'

const trackingService = new TrackingService()

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { articleId, productId, userId } = await req.json()
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const ua = req.headers.get('user-agent') || 'unknown'

  const click = await trackingService.trackClick(articleId, productId, userId, ip, ua)
  return successResponse(click, 201)
})
