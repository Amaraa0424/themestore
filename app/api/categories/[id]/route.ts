import { type NextRequest, NextResponse } from "next/server"
import { categoryOperations } from "@/lib/redis"
import { withAdminAuth, type AuthenticatedUser } from "@/lib/auth-middleware"

// GET remains public for viewing individual categories
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const category = await categoryOperations.findById(params.id)
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }
    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Only admins can update categories
async function handlePut(request: NextRequest, user: AuthenticatedUser, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const category = await categoryOperations.update(params.id, updates)
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }
    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Only admins can delete categories
async function handleDelete(request: NextRequest, user: AuthenticatedUser, { params }: { params: { id: string } }) {
  try {
    const success = await categoryOperations.delete(params.id)
    if (!success) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const PUT = withAdminAuth(handlePut)
export const DELETE = withAdminAuth(handleDelete)
