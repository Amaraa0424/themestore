import { type NextRequest, NextResponse } from "next/server"
import { attributeOperations } from "@/lib/redis"
import { withAdminAuth, type AuthenticatedUser } from "@/lib/auth-middleware"

// GET remains public for viewing individual attributes
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const attribute = await attributeOperations.findById(params.id)
    if (!attribute) {
      return NextResponse.json({ error: "Attribute not found" }, { status: 404 })
    }
    return NextResponse.json(attribute)
  } catch (error) {
    console.error("Error fetching attribute:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Only admins can update attributes
async function handlePut(request: NextRequest, user: AuthenticatedUser, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const attribute = await attributeOperations.update(params.id, updates)
    if (!attribute) {
      return NextResponse.json({ error: "Attribute not found" }, { status: 404 })
    }
    return NextResponse.json(attribute)
  } catch (error) {
    console.error("Error updating attribute:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Only admins can delete attributes
async function handleDelete(request: NextRequest, user: AuthenticatedUser, { params }: { params: { id: string } }) {
  try {
    const success = await attributeOperations.delete(params.id)
    if (!success) {
      return NextResponse.json({ error: "Attribute not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting attribute:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const PUT = withAdminAuth(handlePut)
export const DELETE = withAdminAuth(handleDelete)
