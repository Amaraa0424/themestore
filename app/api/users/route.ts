import { type NextRequest, NextResponse } from "next/server"
import { userOperations } from "@/lib/redis"
import { withAdminAuth, type AuthenticatedUser } from "@/lib/auth-middleware"
import bcrypt from "bcryptjs"

// Only admins can view all users
async function handleGet() {
  try {
    const users = await userOperations.getAll()
    // Remove passwords from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const safeUsers = users.map(({ password: _, ...user }) => user)
    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Only admins can create new users
async function handlePost(request: NextRequest, user: AuthenticatedUser) {
  try {
    const userData = await request.json()
    const { email, password, name, role } = userData

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    // Only admins can create admin users
    if (role === 'admin' && user.role !== 'admin') {
      return NextResponse.json({ error: "Only admins can create admin users" }, { status: 403 })
    }

    // Check if user already exists
    const existingUser = await userOperations.findByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = await userOperations.create({
      email,
      password: hashedPassword,
      name,
      role: role || "user",
    })

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = newUser
    return NextResponse.json(safeUser)
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAdminAuth(handleGet)
export const POST = withAdminAuth(handlePost)
