"use client"

/**
 * Client-side initialization component
 * Initializes token refresh, permission checks, and other client-side logic
 */

import { useTokenRefresh } from "@/hooks/useTokenRefresh"
import { useUser } from "@/context/useUser"
import { useEffect } from "react"

export function ClientSideInit() {
  // Initialize token refresh for authenticated users
  useTokenRefresh()

  // Monitor user state changes
  const { user, isLoading } = useUser()

  useEffect(() => {
    if (!isLoading && !user) {
      // User is logged out - could add cleanup logic here
      console.log("[ClientInit] User logged out")
    }
  }, [user, isLoading])

  return null
}
