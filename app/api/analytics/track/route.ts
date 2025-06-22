import { type NextRequest, NextResponse } from "next/server"
import { analyticsOperations } from "@/lib/redis"

// Get IP address with better extraction
const getClientIP = (request: NextRequest): string => {
  // Try different headers for IP address
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const cfConnectingIp = request.headers.get("cf-connecting-ip") // Cloudflare
  const xClientIp = request.headers.get("x-client-ip")

  // Parse forwarded header (can contain multiple IPs)
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim())
    // Return the first non-private IP
    for (const ip of ips) {
      if (!ip.startsWith("192.168.") && !ip.startsWith("10.") && !ip.startsWith("172.") && ip !== "127.0.0.1") {
        return ip
      }
    }
    return ips[0] // Fallback to first IP
  }

  // Try other headers
  if (cfConnectingIp) return cfConnectingIp
  if (realIp) return realIp
  if (xClientIp) return xClientIp

  return "unknown"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, userAgent, referrer, sessionId, userId } = body

    const ip = getClientIP(request)

    await analyticsOperations.trackPageView({
      path: path || "/",
      userAgent: userAgent || "",
      ip: ip,
      referrer: referrer || "",
      timestamp: new Date().toISOString(),
      sessionId: sessionId || "",
      userId: userId || "",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking page view:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
