import { type NextRequest, NextResponse } from "next/server"
import { analyticsOperations } from "@/lib/redis"
import { withAdminAuth } from "@/lib/auth-middleware"

// Only admins can view analytics
async function handleGet(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get("days") || "7")
    
    // Validate days parameter
    if (days < 1 || days > 365) {
      return NextResponse.json({ 
        error: "Days parameter must be between 1 and 365" 
      }, { status: 400 })
    }

    const analytics = await analyticsOperations.getAnalytics(days)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAdminAuth(handleGet)
