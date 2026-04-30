import type React from "react"

import { ProtectedShell } from "@/components/layout/protected-shell"
import { RoleGuard } from "@/components/layout/role-guard"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["Agriculteur", "CoopManager", "Admin"]}>
      <ProtectedShell>{children}</ProtectedShell>
    </RoleGuard>
  )
}
