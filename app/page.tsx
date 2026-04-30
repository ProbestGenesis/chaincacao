"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/useUser"
import { getRoleRoute } from "@/lib/navigation/role-config"

export default function Page() {
  const router = useRouter()
  const { user, activeRole, isLoading } = useUser()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.replace("/auth")
      return
    }

    router.replace(getRoleRoute(activeRole ?? user.roles[0]))
  }, [activeRole, isLoading, router, user])

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">Redirection en cours...</p>
    </div>
  )
}
