"use client"

import { usePermission } from "@/hooks/usePermission"
import { redirect } from "next/navigation"

export default function ExporterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const can = usePermission()
  
  // Only Exporter or Admin can access exporter section
  if (can.role !== "EXPORTATEUR" && !can.isAdmin()) {
    redirect("/all-lots")
  }
  
  return <>{children}</>
}
