"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"

import { LotDetailModal } from "@/components/lot/lot-detail-modal"
import { LotWorkflowTimeline } from "@/components/lot/lot-workflow-timeline"
import { useLotActionsStore } from "@/store/lot-actions"
import { useLotsStore } from "@/store/lots"
import { useUser } from "@/context/useUser"
import type { Lot } from "@/types/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HistoriquePage() {
  const { user } = useUser()
  const { getLotsForFarmer } = useLotsStore()
  const { getLotTimeline } = useLotActionsStore()
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const lots = user ? getLotsForFarmer(user.userId) : []
  const sortedLots = [...lots].sort((a, b) => b.updatedAt - a.updatedAt)

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
    pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
    transferred: { label: "Transféré", color: "bg-blue-100 text-blue-800" },
    transformed: { label: "Transformé", color: "bg-orange-100 text-orange-800" },
    exported: { label: "Exporté", color: "bg-green-100 text-green-800" },
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary" className="rounded-full">
            Traçabilité du producteur
          </Badge>
          <h1 className="mt-2 text-3xl font-bold">Historique des lots</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Chaque lot conserve l’état d’avancement, les validations de chaque acteur et les
            preuves associées à son parcours.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/agriculteur">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sortedLots.length}</p>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {
                sortedLots.filter(
                  (l) => l.statut === "pending" || l.statut === "transferred"
                ).length
              }
            </p>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Transformés</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {sortedLots.filter((l) => l.statut === "transformed").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Exportés</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {sortedLots.filter((l) => l.statut === "exported").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chronologie des lots</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedLots.length > 0 ? (
            sortedLots.map((lot) => {
              const timeline = getLotTimeline(lot.lotId)
              const lastAction = timeline[timeline.length - 1]

              return (
                <button
                  key={lot.lotId}
                  onClick={() => {
                    setSelectedLot(lot)
                    setModalOpen(true)
                  }}
                  className="w-full rounded-2xl border p-4 text-left transition hover:border-primary/60 hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-sm font-semibold">{lot.lotId}</p>
                          <p className="text-xs text-muted-foreground">
                            Créé le {new Date(lot.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusLabels[lot.statut]?.color || "bg-gray-100"}>
                            {statusLabels[lot.statut]?.label || lot.statut}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <p className="text-sm">
                        {lot.poidsKg} kg • {lot.espece} • {lot.region}
                      </p>

                      {lastAction ? (
                        <div className="rounded-xl border bg-background/80 p-3 text-sm">
                          <p className="font-medium">Dernière validation</p>
                          <p className="text-muted-foreground">
                            {lastAction.phase} • {lastAction.actorName} ({lastAction.actor})
                          </p>
                          <p className="mt-1">{lastAction.description}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Aucune validation enregistrée.
                        </p>
                      )}
                    </div>

                    <div className="w-full max-w-xl">
                      <LotWorkflowTimeline lot={lot} timeline={timeline} compact />
                    </div>
                  </div>
                </button>
              )
            })
          ) : (
            <p className="py-10 text-center text-muted-foreground">Aucun lot créé pour le moment</p>
          )}
        </CardContent>
      </Card>

      <LotDetailModal lot={selectedLot} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
