"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import type { LucideIcon } from "lucide-react"

type Stat = {
  label: string
  value: string
  note?: string
  icon: LucideIcon
}

export function SimpleRolePage({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  stats,
  highlights,
}: {
  eyebrow?: string
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  stats: Stat[]
  highlights: string[]
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actionLabel={actionLabel}
        actionHref={actionHref}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Points de suivi</h2>
            <Badge variant="secondary">Synthèse rapide</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {highlights.map((item) => (
              <div key={item} className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
          {actionLabel && actionHref ? (
            <Button asChild className="rounded-xl">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
