import { type NextRequest, NextResponse } from "next/server"
import { productOperations } from "@/lib/redis"
import { withAdminAuth } from "@/lib/auth-middleware"

// GET remains public for browsing products
export async function GET() {
  try {
    const products = await productOperations.getAll()
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Only admins can create products
async function handlePost(request: NextRequest) {
  try {
    const productData = await request.json()
    
    // Validate required fields
    if (!productData.name || !productData.description || !productData.price || !productData.categoryId) {
      return NextResponse.json({ 
        error: "Name, description, price, and categoryId are required" 
      }, { status: 400 })
    }

    const product = await productOperations.create(productData)
    return NextResponse.json(product)
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withAdminAuth(handlePost)
