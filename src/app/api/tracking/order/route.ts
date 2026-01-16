import { NextRequest } from 'next/server'
import { TrackingService } from '@/services/TrackingService'
import { successResponse, withErrorHandler } from '@/lib/api-utils'

const trackingService = new TrackingService()

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { productId, userId, amount } = await req.json()
  const order = await trackingService.trackOrder(productId, userId, amount)
  return successResponse(order, 201)
})
