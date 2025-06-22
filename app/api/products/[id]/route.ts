import { type NextRequest, NextResponse } from "next/server"
import { productOperations } from "@/lib/redis"
import { withAdminAuth, type AuthenticatedUser } from "@/lib/auth-middleware"

// GET remains public for viewing individual products
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await productOperations.findById(params.id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Only admins can update products
async function handlePut(request: NextRequest, user: AuthenticatedUser, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    
    // Validate that price is not negative if being updated
    if (updates.price !== undefined && updates.price < 0) {
      return NextResponse.json({ error: "Price cannot be negative" }, { status: 400 })
    }

    const product = await productOperations.update(params.id, updates)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Only admins can delete products
async function handleDelete(request: NextRequest, user: AuthenticatedUser, { params }: { params: { id: string } }) {
  try {
    const success = await productOperations.delete(params.id)
    if (!success) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const PUT = withAdminAuth(handlePut)
export const DELETE = withAdminAuth(handleDelete)
