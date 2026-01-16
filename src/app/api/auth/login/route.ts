import { NextRequest } from 'next/server'
import { AuthService } from '@/services/AuthService'
import { successResponse, errorResponse } from '@/lib/api-utils'

const authService = new AuthService()

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return errorResponse('Email and password are required')

    const result = await authService.login(email, password)
    return successResponse(result)
  } catch (error: any) {
    return errorResponse(error.message)
  }
}
