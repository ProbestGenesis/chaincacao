"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useUser } from "@/context/useUser"
import type { UserRole } from "@/types/types"
import { getRoleRoute } from "@/lib/navigation/role-config"

export function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[]
  children: React.ReactNode
}) {
  const { user, activeRole, switchRole, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.replace("/auth")
      return
    }

    if (activeRole && allowedRoles.includes(activeRole)) {
      return
    }

    const fallbackRole = user.roles.find((role) => allowedRoles.includes(role)) ?? user.roles[0]
    if (fallbackRole) {
      switchRole(fallbackRole)
      router.replace(getRoleRoute(fallbackRole))
    } else {
      router.replace("/auth")
    }
  }, [activeRole, allowedRoles, isLoading, router, switchRole, user])

  if (isLoading || !user || (activeRole && !allowedRoles.includes(activeRole))) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Vérification de l'accès...
      </div>
    )
  }

  return <>{children}</>
}

