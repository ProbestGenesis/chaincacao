"use client"

import { usePermission } from "@/hooks/usePermission"
import { redirect } from "next/navigation"

export default function MinistryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const can = usePermission()
  
  if (!can.isAdmin()) {
    redirect("/all-lots")
  }
  
  return <>{children}</>
}
