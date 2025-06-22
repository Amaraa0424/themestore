import { type NextRequest, NextResponse } from "next/server"
import { categoryOperations } from "@/lib/redis"
import { withAdminAuth, type AuthenticatedUser } from "@/lib/auth-middleware"

// GET remains public for browsing categories
export async function GET() {
  try {
    const categories = await categoryOperations.getAll()
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Only admins can create categories
async function handlePost(request: NextRequest, user: AuthenticatedUser) {
  try {
    const categoryData = await request.json()
    
    // Validate required fields
    if (!categoryData.name || !categoryData.description) {
      return NextResponse.json({ 
        error: "Name and description are required" 
      }, { status: 400 })
    }

    const category = await categoryOperations.create(categoryData)
    return NextResponse.json(category)
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withAdminAuth(handlePost)
