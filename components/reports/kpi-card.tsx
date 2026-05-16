"use client"
 
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
 
interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  icon: LucideIcon
  trend?: {
    value: string
    positive?: boolean
    stable?: boolean
    warning?: boolean
  }
  className?: string
  colorVariant?: "emerald" | "blue" | "amber" | "slate"
}
 
export function KPICard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend, 
  className,
  colorVariant = "slate"
}: KPICardProps) {
  const variants = {
    emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-50",
    blue: "bg-blue-50/50 border-blue-100 text-blue-900 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-50",
    amber: "bg-amber-50/50 border-amber-100 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-50",
    slate: "bg-slate-50/50 border-slate-100 text-slate-900 dark:bg-slate-950/20 dark:border-slate-800 dark:text-slate-50",
  }
 
  const iconVariants = {
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    slate: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  }
 
  return (
    <Card className={cn("overflow-hidden border shadow-sm transition-all hover:shadow-md", variants[colorVariant], className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className={cn("p-2 rounded-xl", iconVariants[colorVariant])}>
            <Icon className="size-5" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border",
              trend.stable 
                ? "bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400" 
                : trend.warning
                  ? "bg-amber-100 border-amber-200 text-amber-600 dark:bg-amber-900/30 dark:border-amber-800/50 dark:text-amber-500"
                  : trend.positive 
                    ? "bg-emerald-100 border-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-500" 
                    : "bg-rose-100 border-rose-200 text-rose-600 dark:bg-rose-900/30 dark:border-rose-800/50 dark:text-rose-500"
            )}>
              {trend.stable ? <Minus className="size-3" /> : trend.warning ? <TrendingDown className="size-3" /> : trend.positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {trend.value}
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
