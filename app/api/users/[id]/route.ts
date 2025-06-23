import { type NextRequest, NextResponse } from "next/server"
import { userOperations } from "@/lib/redis"
import { withAuth, withAdminAuth, type AuthenticatedUser } from "@/lib/auth-middleware"
import bcrypt from "bcryptjs"

// Users can view their own profile, admins can view any user
async function handleGet(request: NextRequest, user: AuthenticatedUser, { params }: { params: { id: string } }) {
  try {
    // Users can only view their own profile unless they're admin
    if (user.role !== 'admin' && user.id !== params.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const targetUser = await userOperations.findById(params.id)
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = targetUser
    return NextResponse.json(safeUser)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Users can update their own profile, admins can update any user
async function handlePut(request: NextRequest, user: AuthenticatedUser, { params }: { params: { id: string } }) {
  try {
    // Users can only update their own profile unless they're admin
    if (user.role !== 'admin' && user.id !== params.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const updates = await request.json()

    // Only admins can change roles
    if (updates.role && user.role !== 'admin') {
      return NextResponse.json({ error: "Only admins can change user roles" }, { status: 403 })
    }

    // Users cannot promote themselves to admin
    if (updates.role === 'admin' && user.id === params.id && user.role !== 'admin') {
      return NextResponse.json({ error: "Cannot promote yourself to admin" }, { status: 403 })
    }

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12)
    }

    const updatedUser = await userOperations.update(params.id, updates)
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = updatedUser
    return NextResponse.json(safeUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Only admins can delete users
async function handleDelete(request: NextRequest, user: AuthenticatedUser, { params }: { params: { id: string } }) {
  try {
    // Prevent admins from deleting themselves
    if (user.id === params.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const success = await userOperations.delete(params.id)
    if (!success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(handleGet)
export const PUT = withAuth(handlePut)
export const DELETE = withAdminAuth(handleDelete)
