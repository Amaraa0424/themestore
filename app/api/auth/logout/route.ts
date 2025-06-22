import { type NextRequest, NextResponse } from "next/server"
import { sessionOperations } from "@/lib/redis"

export async function POST(request: NextRequest) {
  try {
    // Get session ID from Authorization header or cookie
    const authHeader = request.headers.get('authorization')
    const sessionId = authHeader?.replace('Bearer ', '') || 
                     request.cookies.get('sessionId')?.value

    if (sessionId) {
      // Delete the session
      await sessionOperations.delete(sessionId)
    }

    // Create response
    const response = NextResponse.json({ message: "Logged out successfully" })
    
    // Clear session cookie
    response.cookies.set('sessionId', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
