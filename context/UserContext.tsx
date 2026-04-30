"use client"

import React, { createContext, useCallback, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { User, UserRole } from "../types/types"
import { useUsersStore } from "@/store/users"
import { getRoleRoute } from "@/lib/navigation/role-config"

export interface UserContextType {
  user: User | null
  activeRole: UserRole | null
  setUser: (user: User) => void
  logout: () => void
  switchRole: (role: UserRole) => void
  canAccess: (requiredRole: UserRole) => boolean
  isLoading: boolean
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: React.ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUserState] = useState<User | null>(null)
  const [activeRole, setActiveRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const {
    getCurrentUser,
    setCurrentUser,
    setCurrentRole,
    currentRole,
    currentUserId,
  } = useUsersStore()

  useEffect(() => {
    const current = getCurrentUser()
    if (current) {
      setUserState(current)
      setActiveRole(currentRole ?? current.roles[0] ?? null)
      if (currentUserId !== current.userId) {
        setCurrentUser(current.userId, currentRole ?? current.roles[0] ?? null)
      }
    }
    setIsLoading(false)
  }, [currentRole, currentUserId, getCurrentUser, setCurrentUser])

  useEffect(() => {
    if (isLoading) return

    const isAuthPath = pathname?.startsWith("/auth")
    const isLoginPage = pathname === "/auth" || pathname === "/auth/"
    const hasUser = user !== null

    if (!hasUser && !isAuthPath) {
      router.push("/auth")
    } else if (hasUser && isLoginPage) {
      const roleBasedRoute = getRoleRoute(activeRole ?? user.roles[0])
      router.push(roleBasedRoute)
    }
  }, [activeRole, isLoading, pathname, router, user])

  const setUser = useCallback(
    (newUser: User) => {
      setUserState(newUser)
      setCurrentUser(newUser.userId, newUser.roles[0] ?? null)
      setActiveRole(newUser.roles[0] ?? null)
      setCurrentRole(newUser.roles[0] ?? null)
    },
    [setCurrentRole, setCurrentUser]
  )

  const logout = useCallback(() => {
    setUserState(null)
    setActiveRole(null)
    setCurrentRole(null)
    router.push("/auth")
  }, [router, setCurrentRole])

  const switchRole = useCallback(
    (role: UserRole) => {
      if (user && user.roles.includes(role)) {
        setActiveRole(role)
        setCurrentRole(role)
        setCurrentUser(user.userId, role)
      }
    },
    [setCurrentRole, setCurrentUser, user]
  )

  const canAccess = useCallback(
    (requiredRole: UserRole) => {
      if (!user) return false
      return user.roles.includes(requiredRole) || user.roles.includes("Admin")
    },
    [user]
  )

  const value: UserContextType = {
    user,
    activeRole,
    setUser,
    logout,
    switchRole,
    canAccess,
    isLoading,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
