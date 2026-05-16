"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useUser } from "@/context/useUser"
import type { UserRole } from "@/types/types"
import { getRoleRoute, normalizeRole } from "@/lib/navigation/role-config"

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

    const normalizedActiveRole = activeRole ? normalizeRole(activeRole) : null
    const normalizedAllowedRoles = allowedRoles.map(r => normalizeRole(r))

    if (normalizedActiveRole && normalizedAllowedRoles.includes(normalizedActiveRole)) {
      return
    }

    const fallbackRole = user.roles.find((role) => {
      const normalized = normalizeRole(role)
      return normalizedAllowedRoles.includes(normalized)
    }) ?? user.roles[0]

    if (fallbackRole) {
      switchRole(fallbackRole)
      router.replace(getRoleRoute(fallbackRole))
    } else {
      router.replace("/auth")
    }
  }, [activeRole, allowedRoles, isLoading, router, switchRole, user])

  const normalizedActiveRole = activeRole ? normalizeRole(activeRole) : null
  const normalizedAllowedRoles = allowedRoles.map(r => normalizeRole(r))

  if (isLoading || !user || (normalizedActiveRole && !normalizedAllowedRoles.includes(normalizedActiveRole))) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Vérification de l'accès...
      </div>
    )
  }

  return <>{children}</>
}

