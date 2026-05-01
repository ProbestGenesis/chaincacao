"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider } from "@/context/UserContext"
import { Toaster } from "@/components/ui/sonner"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>
        {children}
        <Toaster />
      </UserProvider>
    </ThemeProvider>
  )
}
