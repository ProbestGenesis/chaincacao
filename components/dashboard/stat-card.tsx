"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: string
  note?: string
  icon: LucideIcon
  tone?: "default" | "dark"
}) {
  return (
    <Card className={cn("gap-3 border-0 shadow-sm", tone === "dark" && "bg-foreground text-background")}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex size-12 items-center justify-center rounded-2xl bg-muted", tone === "dark" && "bg-background/10")}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
          {note ? <p className={cn("text-xs text-muted-foreground", tone === "dark" && "text-background/70")}>{note}</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}
