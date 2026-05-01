"use client"

import { useState } from "react"

import { useLotsStore } from "@/store/lots"
import { useLotActionsStore } from "@/store/lot-actions"
import { useUser } from "@/context/useUser"
import { LotDetailModal } from "@/components/lot/lot-detail-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle2, Clock3, PackageOpen, RefreshCw, Truck } from "lucide-react"
import Link from "next/link"
import type { Lot } from "@/types/types"
import { translateStatus } from "@/lib/status-helper"

export function TransformerDashboard() {
  const { user, activeRole } = useUser()
  const { lots } = useLotsStore()
  const { getLotTimeline, actions } = useLotActionsStore()
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null)
  const [lotDetailOpen, setLotDetailOpen] = useState(false)

  const transformerLots = lots.filter((lot) =>
    ["pending", "transferred", "transformed", "exported"].includes(lot.statut)
  )

  const pendingLots = transformerLots.filter((lot) => lot.statut === "pending")
  const transferredLots = transformerLots.filter((lot) => lot.statut === "transferred")
  const transformedLots = transformerLots.filter((lot) => lot.statut === "transformed")
  const totalWeight = transformerLots.reduce((sum, lot) => sum + lot.poidsKg, 0)
  const totalSourceActions = transformerLots.reduce(
    (sum, lot) => sum + getLotTimeline(lot.lotId).length,
    0
  )
  const recentActions = [...actions]
    .filter((action) =>
      ["Agriculteur", "CoopManager", "Transformer", "Exporter", "Verifier", "Importer"].includes(action.actor)
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)

  const lotSnapshots = transformerLots
    .map((lot) => {
      const timeline = getLotTimeline(lot.lotId)
      const lastEvent = timeline[timeline.length - 1]
      return {
        lot,
        timeline,
        lastEvent,
        timestamp: lastEvent?.timestamp ?? lot.updatedAt,
      }
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)

  const pipelineCards = [
    {
      label: "À réceptionner",
      value: pendingLots.length,
      note: "Lots en attente de prise en charge",
      icon: PackageOpen,
      tone: "text-amber-600",
    },
    {
      label: "À transformer",
      value: transferredLots.length,
      note: "Lots déjà transférés vers l’atelier",
      icon: Truck,
      tone: "text-blue-600",
    },
    {
      label: "Transformés",
      value: transformedLots.length,
      note: "Lots prêts pour contrôle / export",
      icon: CheckCircle2,
      tone: "text-green-600",
    },
    {
      label: "Événements",
      value: recentActions.length,
      note: "Dernières mutations de la chaîne",
      icon: Clock3,
      tone: "text-slate-600",
    },
  ]

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="rounded-full bg-white/10 text-white hover:bg-white/15">
            {activeRole ?? "Transformer"}
          </Badge>
          <span className="text-xs uppercase tracking-[0.18em] text-white/60">
            Suivi temps réel des lots
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-white/60">
              {user ? `Connecté en tant que ${user.nomAffiche}` : "Session Transformer active"}
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Tableau de bord du transformateur
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Ici, on suit les lots reçus, transférés et transformés. Toute nouvelle création ou
              tout mouvement enregistré dans le store apparaît automatiquement.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="rounded-full bg-white text-slate-900 hover:bg-white/90">
              <Link href="/transformer">
                <RefreshCw className="h-4 w-4" />
                Rafraîchir
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              <Link href="/agriculteur/historique">
                Voir la chaîne
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {pipelineCards.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/70">{item.label}</p>
                  <Icon className={`h-4 w-4 ${item.tone}`} />
                </div>
                <p className="mt-3 text-3xl font-bold">{item.value}</p>
                <p className="mt-1 text-xs text-white/60">{item.note}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lots visibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{transformerLots.length}</div>
            <p className="text-xs text-muted-foreground mt-1">lots à suivre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Poids total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalWeight}</div>
            <p className="text-xs text-muted-foreground mt-1">kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Actions enregistrées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSourceActions}</div>
            <p className="text-xs text-muted-foreground mt-1">validations / mouvements</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lots à traiter</CardTitle>
            <CardDescription>
              Les lots se mettent à jour automatiquement selon les créations et transferts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transformerLots.length > 0 ? (
              <div className="space-y-3">
                {transformerLots.slice(0, 6).map((lot) => {
                  const timeline = getLotTimeline(lot.lotId)
                  const lastEvent = timeline[timeline.length - 1]

                  return (
                    <button
                      key={lot.lotId}
                      type="button"
                      onClick={() => {
                        setSelectedLot(lot)
                        setLotDetailOpen(true)
                      }}
                      className="w-full rounded-2xl border p-4 text-left transition hover:border-primary/50 hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-sm font-semibold">{lot.lotId}</p>
                          <p className="text-sm text-muted-foreground">
                            {lot.espece} • {lot.poidsKg} kg • {lot.region}
                          </p>
                        </div>
                        <Badge variant="secondary">{translateStatus(lot.statut)}</Badge>
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Créé par</p>
                          <p className="text-sm font-medium">{lot.createdBy}</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Synchronisation</p>
                          <p className="text-sm font-medium">{lot.syncStatus}</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Étapes</p>
                          <p className="text-sm font-medium">{timeline.length}</p>
                        </div>
                      </div>

                      {lastEvent ? (
                        <div className="mt-3 rounded-xl border bg-background/80 p-3 text-sm">
                          <p className="font-medium">Dernier mouvement</p>
                          <p className="text-muted-foreground">
                            {lastEvent.phase} • {lastEvent.actorName} ({lastEvent.actor})
                          </p>
                          <p className="mt-1">{lastEvent.description}</p>
                        </div>
                      ) : null}
                      <div className="mt-3 flex items-center justify-end text-xs font-medium text-muted-foreground">
                        Ouvrir et agir
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun lot en cours</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dernières évolutions</CardTitle>
            <CardDescription>Mini-historique par lot avec le dernier acteur</CardDescription>
          </CardHeader>
          <CardContent>
            {lotSnapshots.length > 0 ? (
              <div className="space-y-3">
                {lotSnapshots.map(({ lot, lastEvent }) => (
                  <div key={lot.lotId} className="rounded-2xl border bg-muted/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{lot.lotId}</p>
                        <p className="text-xs text-muted-foreground">
                          {translateStatus(lot.statut)} • {lot.poidsKg} kg
                        </p>
                      </div>
                      <Badge variant="outline">{lastEvent?.actor ?? "Aucun"}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {lastEvent
                        ? `${lastEvent.phase} par ${lastEvent.actorName}`
                        : "Aucun événement enregistré"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {lastEvent
                        ? new Date(lastEvent.timestamp).toLocaleString("fr-FR")
                        : "En attente de mouvement"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun lot à afficher</p>
            )}
          </CardContent>
        </Card>
      </div>

      <LotDetailModal lot={selectedLot} open={lotDetailOpen} onOpenChange={setLotDetailOpen} />
    </div>
  )
}
