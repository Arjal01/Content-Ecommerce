import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, TokenPayload } from '@/lib/auth'

export async function authGuard(req: NextRequest, roles?: ('ADMIN' | 'USER')[]) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 }
  }

  const token = authHeader.split(' ')[1]
  const decoded = verifyToken(token) as TokenPayload | null

  if (!decoded) {
    return { error: 'Invalid token', status: 401 }
  }

  if (roles && !roles.includes(decoded.role)) {
    return { error: 'Forbidden', status: 403 }
  }

  return { user: decoded }
}

export function successResponse(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export type RouteHandler = (req: NextRequest, params?: any) => Promise<NextResponse>

export function withErrorHandler(handler: RouteHandler) {
  return async (req: NextRequest, params?: any) => {
    try {
      return await handler(req, params)
    } catch (error: any) {
      console.error('API Error:', error)
      return errorResponse(error.message || 'Internal Server Error', 500)
    }
  }
}
