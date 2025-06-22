import { NextRequest } from 'next/server'
import { sessionOperations, userOperations } from './redis'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser> {
  // Get session ID from Authorization header or cookie
  const authHeader = request.headers.get('authorization')
  const sessionId = authHeader?.replace('Bearer ', '') || 
                   request.cookies.get('sessionId')?.value

  if (!sessionId) {
    throw new AuthError('No session provided', 401)
  }

  // Verify session
  const userId = await sessionOperations.get(sessionId)
  if (!userId) {
    throw new AuthError('Invalid or expired session', 401)
  }

  // Get user details
  const user = await userOperations.findById(userId)
  if (!user) {
    throw new AuthError('User not found', 401)
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  return await authenticateRequest(request)
}

export async function requireAdmin(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await authenticateRequest(request)
  
  if (user.role !== 'admin') {
    throw new AuthError('Admin access required', 403)
  }
  
  return user
}

export function withAuth<T extends any[]>(
  handler: (request: NextRequest, user: AuthenticatedUser, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    try {
      const user = await requireAuth(request)
      return await handler(request, user, ...args)
    } catch (error) {
      if (error instanceof AuthError) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: error.statusCode,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      console.error('Auth middleware error:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

export function withAdminAuth<T extends any[]>(
  handler: (request: NextRequest, user: AuthenticatedUser, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    try {
      const user = await requireAdmin(request)
      return await handler(request, user, ...args)
    } catch (error) {
      if (error instanceof AuthError) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: error.statusCode,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      console.error('Admin auth middleware error:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
} 