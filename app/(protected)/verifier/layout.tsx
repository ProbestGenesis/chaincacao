"use client"

import { usePermission } from "@/hooks/usePermission"
import { redirect } from "next/navigation"

export default function VerifierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const can = usePermission()
  
  if (can.role !== "CERTIF" && !can.isAdmin()) {
    redirect("/all-lots")
  }
  
  return <>{children}</>
}
