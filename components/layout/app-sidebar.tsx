"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { LogOut, Repeat, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useUser } from "@/context/useUser"
import { cn } from "@/lib/utils"
import { getRoleConfig } from "@/lib/navigation/role-config"

export function AppSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, activeRole, switchRole, logout } = useUser()
  const config = getRoleConfig(activeRole)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/50 p-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UserRound className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              ChainCacao
            </p>
            <p className="truncate text-xs text-sidebar-foreground/70">
              {config.label}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {config.items.map((item) => {
                const [itemPath, itemQuery] = item.href.split("?")
                const activeQuery = new URLSearchParams(itemQuery ?? "")
                const active =
                  pathname === itemPath &&
                  Array.from(activeQuery.entries()).every(
                    ([key, value]) => searchParams.get(key) === value
                  )
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={item.href} className="flex items-center gap-2">
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && user.roles.length > 1 && (
          <SidebarGroup>
            <SidebarGroupContent className="space-y-2">
              <p className="px-3 text-xs uppercase tracking-[0.18em] text-sidebar-foreground/60">
                Changer de rôle
              </p>
              <div className="flex flex-wrap gap-2 px-3">
                {user.roles.map((role) => (
                  <Button
                    key={role}
                    type="button"
                    variant={role === activeRole ? "default" : "outline"}
                    size="sm"
                    className="h-8 rounded-full"
                    onClick={() => switchRole(role)}
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <Button asChild className="w-full justify-start gap-2 rounded-xl">
          <Link href={config.ctaHref}>
            <Repeat className="size-4" />
            {config.ctaLabel}
          </Link>
        </Button>

        <div className="space-y-1">
          {config.footerItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className={cn("w-full justify-start gap-2 rounded-xl")}
              >
                <Link href={item.href}>
                  <Icon className="size-4" />
                  {item.title}
                </Link>
              </Button>
            )
          })}
        </div>

        <Button variant="ghost" className="w-full justify-start gap-2 rounded-xl" onClick={logout}>
          <LogOut className="size-4" />
          Déconnexion
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
