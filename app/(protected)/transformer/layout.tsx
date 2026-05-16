"use client"

import { usePermission } from "@/hooks/usePermission"
import { redirect } from "next/navigation"

export default function TransformerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const can = usePermission()
  
  if (can.role !== "TRANSFORMATEUR" && !can.isAdmin()) {
    redirect("/all-lots")
  }
  
  return <>{children}</>
}
