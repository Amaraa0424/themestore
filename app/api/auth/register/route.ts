import { type NextRequest, NextResponse } from "next/server"
import { userOperations, sessionOperations } from "@/lib/redis"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // SECURITY FIX: Never allow role to be set via registration
    // Only existing admins can create admin users via /api/users endpoint
    if (role && role !== 'user') {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await userOperations.findByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Always create users with 'user' role - no exceptions
    const user = await userOperations.create({
      email,
      password: hashedPassword,
      name,
      role: "user", // HARDCODED - never allow admin creation via registration
    })

    // Create session
    const sessionId = await sessionOperations.create(user.id)

    // Don't send password in response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({
      user: userWithoutPassword,
      sessionId,
      message: "Registration successful"
    })

    // Set session cookie
    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)

    // Return proper JSON error response
    if (error instanceof Error) {
      if (error.message === "User already exists") {
        return NextResponse.json({ error: "User already exists" }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
