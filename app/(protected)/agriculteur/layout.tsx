"use client"

import { usePermission } from "@/hooks/usePermission"
import { redirect } from "next/navigation"

export default function AgriculteurLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const can = usePermission()
  
  if (!can.isProducer()) {
    redirect("/all-lots")
  }
  
  return <>{children}</>
}
