"use client"

import Link from "next/link"

import { useUser } from "@/context/useUser"
import { useUsersStore } from "@/store/users"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, LogOut, Repeat, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function AppTopbar() {
  const { user, activeRole, logout, switchAccount, switchRole } = useUser()
  const { users } = useUsersStore()

  const initials = user?.nomAffiche
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const currentUserRoleCount = user?.roles.length ?? 0

  return (
    <header className="flex items-center justify-between gap-4 border-b bg-background px-4 py-3 sm:px-6">
      <div className="flex-1 max-w-sm">
        <Input
          placeholder="Rechercher un lot, chauffeur ou produit..."
          className="h-9 rounded-full bg-muted/30"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-10 gap-3 rounded-full px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-none">{user?.nomAffiche}</p>
                <p className="mt-1 text-xs text-muted-foreground">{activeRole}</p>
              </div>
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-80 p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user?.nomAffiche}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {user?.roles.map((role) => (
                      <Badge
                        key={role}
                        variant={role === activeRole ? "default" : "secondary"}
                        className="rounded-full"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/*currentUserRoleCount > 1 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Basculer de rôle
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user?.roles.map((role) => (
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
                </div>
              )*/}

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Changer de compte
                </p>
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {users.map((account) => {
                    const isCurrent = account.userId === user?.userId

                    return (
                      <button
                        key={account.userId}
                        type="button"
                        onClick={() => switchAccount(account.userId)}
                        className={cn(
                          "w-full rounded-2xl border p-3 text-left transition hover:border-primary/60 hover:bg-muted/50",
                          isCurrent && "border-primary bg-primary/5"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {account.nomAffiche}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {account.email}
                            </p>
                          </div>
                          <Badge variant={isCurrent ? "default" : "secondary"} className="rounded-full">
                            {isCurrent ? "Actif" : "Ouvrir"}
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {account.roles.map((role) => (
                            <Badge key={role} variant="outline" className="rounded-full text-[10px]">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="justify-start rounded-xl">
                  <Link href="/settings">
                    <User className="h-4 w-4" />
                    Profil
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  className="justify-start rounded-xl"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
