"use client"

import type { Lot } from "@/types/types"
import type { LotAction } from "@/store/lot-actions"
import { useLotActionsStore } from "@/store/lot-actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { translateStatus } from "@/lib/status-helper"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  MapPin,
  PackageOpen,
  ShieldCheck,
  Truck,
  Warehouse,
} from "lucide-react"

type TimelineProps = {
  lot: Lot
  timeline: LotAction[]
  compact?: boolean
}

const roleStyles: Record<string, string> = {
  Agriculteur: "bg-emerald-100 text-emerald-800",
  CoopManager: "bg-sky-100 text-sky-800",
  Transformer: "bg-orange-100 text-orange-800",
  Exporter: "bg-violet-100 text-violet-800",
  CarrierUser: "bg-indigo-100 text-indigo-800",
  Verifier: "bg-rose-100 text-rose-800",
  Importer: "bg-pink-100 text-pink-800",
  MinistryAnalyst: "bg-slate-100 text-slate-800",
  Admin: "bg-slate-200 text-slate-900",
}

const phaseMeta: Record<
  LotAction["phase"],
  { label: string; icon: typeof PackageOpen; accent: string }
> = {
  recolte: { label: "Récolte", icon: MapPin, accent: "border-emerald-200 bg-emerald-50" },
  transfert: { label: "Transfert", icon: Truck, accent: "border-sky-200 bg-sky-50" },
  regroupement: { label: "Regroupement", icon: Warehouse, accent: "border-amber-200 bg-amber-50" },
  transport: { label: "Transport", icon: Truck, accent: "border-indigo-200 bg-indigo-50" },
  transformation: { label: "Transformation", icon: CheckCircle2, accent: "border-orange-200 bg-orange-50" },
  controle: { label: "Contrôle", icon: ShieldCheck, accent: "border-violet-200 bg-violet-50" },
  import: { label: "Import", icon: FileCheck2, accent: "border-pink-200 bg-pink-50" },
  commentaire: { label: "Commentaire", icon: ArrowRight, accent: "border-slate-200 bg-slate-50" },
}

export function LotWorkflowTimeline({ lot, timeline, compact = false }: TimelineProps) {
  const { registerActionOnChain } = useLotActionsStore()
  const actions = [...timeline].sort((a, b) => a.timestamp - b.timestamp)
  const latest = actions[actions.length - 1]
  const uniqueActors = Array.from(new Set(actions.map((action) => action.actor)))

  const formatDate = (timestamp: number) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp))

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      <div className={cn("grid gap-3", compact ? "md:grid-cols-3" : "md:grid-cols-4")}>
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Avancement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold">{translateStatus(lot.statut)}</p>
            <p className="text-xs text-muted-foreground">
              {actions.length} validation{actions.length > 1 ? "s" : ""} enregistrée
              {actions.length > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Acteurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold">{uniqueActors.length}</p>
            <p className="text-xs text-muted-foreground">
              {uniqueActors.length > 1 ? "intervenants" : "intervenant"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Synchronisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge variant={lot.syncStatus === "synced" ? "default" : "secondary"}>
              {translateStatus(lot.syncStatus)}
            </Badge>
            <p className="text-xs text-muted-foreground">État de réplication hors chaîne</p>
          </CardContent>
        </Card>

        {!compact && (
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Dernière étape
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-lg font-semibold">
                {latest ? phaseMeta[latest.phase].label : "Aucune"}
              </p>
              <p className="text-xs text-muted-foreground">
                {latest ? latest.actorName : "En attente de validation"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {actions.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
          Aucun évènement n’a encore été enregistré sur ce lot.
        </div>
      ) : (
        <ScrollArea className={cn("pr-3", compact ? "h-[360px]" : "h-[520px]")}>
          <div className="space-y-3">
            {actions.map((action, index) => {
              const phase = phaseMeta[action.phase]
              const PhaseIcon = phase.icon

              return (
                <div
                  key={action.actionId}
                  className={cn(
                    "rounded-2xl border p-4 shadow-sm",
                    phase.accent,
                    compact && "p-3"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/80 ring-1 ring-border">
                      <PhaseIcon className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold">{phase.label}</p>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                        <Badge className={roleStyles[action.actor] ?? "bg-slate-100 text-slate-800"}>
                          {action.actor}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{action.actorName}</span>
                        <span>•</span>
                        <span>{formatDate(action.timestamp)}</span>
                        <span>•</span>
                        <span>{action.action}</span>
                      </div>

                      {action.metadata && Object.keys(action.metadata).length > 0 && (
                        <div className="rounded-xl bg-background/70 p-3 text-xs text-muted-foreground">
                          <pre className="whitespace-pre-wrap font-mono">
                            {JSON.stringify(action.metadata, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        {action.chainStatus === "recorded" ? (
                          <>
                            <Badge variant="secondary">Chaîne :</Badge>
                            {action.chainHash ? (
                              <span className="text-xs font-mono text-muted-foreground">
                                {action.chainHash}
                              </span>
                            ) : null}
                          </>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => registerActionOnChain(action.actionId)}
                          >
                            Enregistrer dans la chaîne
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {!compact && index < actions.length - 1 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock3 className="size-3.5" />
                      Étape transmise à l’acteur suivant
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
