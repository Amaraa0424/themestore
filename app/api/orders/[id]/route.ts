import { type NextRequest, NextResponse } from "next/server"
import { orderOperations } from "@/lib/redis"
import { withAdminAuth, type AuthenticatedUser } from "@/lib/auth-middleware"

// Only admins can view individual orders
async function handleGet(request: NextRequest, user: AuthenticatedUser, { params }: { params: { id: string } }) {
  try {
    const order = await orderOperations.findById(params.id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Only admins can update orders (e.g., change status)
async function handlePut(request: NextRequest, user: AuthenticatedUser, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    
    // Validate status if being updated
    if (updates.status && !["pending", "completed", "cancelled"].includes(updates.status)) {
      return NextResponse.json({ 
        error: "Status must be one of: pending, completed, cancelled" 
      }, { status: 400 })
    }

    // Validate amount if being updated
    if (updates.amount !== undefined && updates.amount <= 0) {
      return NextResponse.json({ error: "Amount must be positive" }, { status: 400 })
    }

    const order = await orderOperations.update(params.id, updates)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Only admins can delete orders
async function handleDelete(request: NextRequest, user: AuthenticatedUser, { params }: { params: { id: string } }) {
  try {
    const success = await orderOperations.delete(params.id)
    if (!success) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAdminAuth(handleGet)
export const PUT = withAdminAuth(handlePut)
export const DELETE = withAdminAuth(handleDelete)
