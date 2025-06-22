"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Generate or get session ID
    let sessionId = localStorage.getItem("analytics_session")
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("analytics_session", sessionId)
    }

    // Get user ID if logged in
    const userData = localStorage.getItem("user")
    const userId = userData ? JSON.parse(userData).id : undefined

    // Track page view
    const trackPageView = async () => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname || "/",
            userAgent: navigator?.userAgent || "",
            referrer: document?.referrer || "",
            sessionId: sessionId || "",
            userId: userId || "",
          }),
        })
      } catch (error) {
        console.error("Failed to track page view:", error)
      }
    }

    trackPageView()
  }, [pathname])

  return null
}
