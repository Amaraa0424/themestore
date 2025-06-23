import { type NextRequest, NextResponse } from "next/server"
import { orderOperations } from "@/lib/redis"
import { withAdminAuth } from "@/lib/auth-middleware"

// Only admins can view all orders
async function handleGet() {
  try {
    const orders = await orderOperations.getAll()
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST remains public for customers to create orders
export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    
    // Validate required fields
    const { productId, customerName, customerEmail, customerPhone, amount } = orderData
    
    if (!productId || !customerName || !customerEmail || !customerPhone || !amount) {
      return NextResponse.json({ 
        error: "ProductId, customerName, customerEmail, customerPhone, and amount are required" 
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be positive" }, { status: 400 })
    }

    // Set default values
    const order = await orderOperations.create({
      ...orderData,
      status: "pending",
      date: new Date().toISOString(),
      userId: orderData.userId || "", // Optional user ID if logged in
    })
    
    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAdminAuth(handleGet)
