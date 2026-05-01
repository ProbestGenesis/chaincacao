"use client"

import type React from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { useUser } from "@/context/useUser"
import { getRoleConfig } from "@/lib/navigation/role-config"
import { cn } from "@/lib/utils"

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { user, activeRole, isLoading } = useUser()
  const config = getRoleConfig(activeRole)

  if (isLoading || !user) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          Chargement de l'espace sécurisé...
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{config.label}</p>
            <p className="truncate text-xs text-muted-foreground">{config.description}</p>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex">
            {activeRole ?? config.role}
          </Badge>
        </header>

        <main className={cn("min-h-[calc(100svh-57px)] p-4 sm:p-6")}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

