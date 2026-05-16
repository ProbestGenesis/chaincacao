"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CheckCircle2, Clock, Truck, Factory, Ship, AlertCircle } from "lucide-react"
import type { HistoryEntry, LotStatus } from "@/types/api-traceability"

interface LotHistoryTimelineProps {
  history: HistoryEntry[]
  isLoading?: boolean
}

const getStatusIcon = (status: LotStatus) => {
  switch (status) {
    case "COLLECTE": return <CheckCircle2 className="size-4 text-emerald-600" />
    case "EN_TRANSIT": return <Truck className="size-4 text-blue-600" />
    case "TRANSFORME": return <Factory className="size-4 text-purple-600" />
    case "EXPORTE": return <Ship className="size-4 text-orange-600" />
    default: return <Clock className="size-4 text-muted-foreground" />
  }
}

const getStatusLabel = (status: LotStatus) => {
  switch (status) {
    case "COLLECTE": return "Collecté"
    case "EN_TRANSIT": return "En Transit"
    case "TRANSFORME": return "Transformé"
    case "EXPORTE": return "Exporté"
    default: return status
  }
}

export function LotHistoryTimeline({ history, isLoading }: LotHistoryTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
        <AlertCircle className="size-8 opacity-20" />
        <p className="text-sm">Aucun historique disponible pour ce lot.</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {history.map((entry, index) => {
        const isFirst = index === 0;
        const isLast = index === history.length - 1;
        const status = entry.value.statut as LotStatus;
        
        return (
          <div key={entry.txId} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-muted text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
              {getStatusIcon(status)}
            </div>
            
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded border bg-card shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm">
                  {getStatusLabel(status)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(entry.timestamp), "dd MMM yyyy à HH:mm", { locale: fr })}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/60 break-all truncate" title={entry.txId}>
                  Tx: {entry.txId.substring(0, 16)}...
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
