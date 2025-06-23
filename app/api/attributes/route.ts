import { type NextRequest, NextResponse } from "next/server"
import { attributeOperations } from "@/lib/redis"
import { withAdminAuth } from "@/lib/auth-middleware"

// GET remains public for browsing attributes
export async function GET() {
  try {
    const attributes = await attributeOperations.getAll()
    return NextResponse.json(attributes)
  } catch (error) {
    console.error("Error fetching attributes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Only admins can create attributes
async function handlePost(request: NextRequest) {
  try {
    const attributeData = await request.json()
    
    // Validate required fields
    if (!attributeData.name || !attributeData.description) {
      return NextResponse.json({ 
        error: "Name and description are required" 
      }, { status: 400 })
    }

    const attribute = await attributeOperations.create(attributeData)
    return NextResponse.json(attribute)
  } catch (error) {
    console.error("Error creating attribute:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withAdminAuth(handlePost)
