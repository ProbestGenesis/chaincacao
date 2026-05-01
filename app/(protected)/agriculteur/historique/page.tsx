"use client"

import { useState } from "react"
import { useUser } from "@/context/useUser"
import { useLotsStore } from "@/store/lots"
import { useLotActionsStore } from "@/store/lot-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { LotDetailModal } from "@/components/lot/lot-detail-modal"

export default function HistoriquePage() {
  const { user } = useUser()
  const { getLotsForFarmer } = useLotsStore()
  const { getLotTimeline } = useLotActionsStore()
  const [selectedLot, setSelectedLot] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const lots = user ? getLotsForFarmer(user.userId) : []
  const sortedLots = [...lots].reverse()

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
    pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
    transferred: { label: "Transféré", color: "bg-blue-100 text-blue-800" },
    transformed: { label: "Transformé", color: "bg-orange-100 text-orange-800" },
    exported: { label: "Exporté", color: "bg-green-100 text-green-800" },
  }

  const handleOpenDetail = (lot: any) => {
    setSelectedLot(lot)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Historique des Lots</h1>
          <p className="text-muted-foreground mt-1">Suivi complet et transparent de chaque lot</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/agriculteur">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sortedLots.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {sortedLots.filter((l) => l.statut === "pending" || l.statut === "transferred").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Transformés</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {sortedLots.filter((l) => l.statut === "transformed").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Exportés</CardTitle>
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
          <CardTitle>Chronologie ({sortedLots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedLots.length > 0 ? (
              sortedLots.map((lot) => {
                const timeline = getLotTimeline(lot.lotId)
                const lastAction = timeline[timeline.length - 1]

                return (
                  <button
                    key={lot.lotId}
                    onClick={() => handleOpenDetail(lot)}
                    className="w-full border rounded-lg p-4 hover:bg-muted/50 transition text-left"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-mono font-semibold text-sm">{lot.lotId}</p>
                        <p className="text-xs text-muted-foreground">
                          Créé {new Date(lot.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusLabels[lot.statut]?.color || "bg-gray-100"}>
                          {statusLabels[lot.statut]?.label || lot.statut}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <p className="text-sm mb-2">
                      {lot.poidsKg} kg • {lot.espece} • {lot.region}
                    </p>

                    {lastAction && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded mt-2">
                        Dernière action: <span className="font-medium">{lastAction.actorName}</span> ({lastAction.actor}) - {lastAction.description}
                      </div>
                    )}

                    {timeline.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {timeline.length} action{timeline.length > 1 ? "s" : ""} enregistrée{timeline.length > 1 ? "s" : ""}
                      </div>
                    )}
                  </button>
                )
              })
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucun lot</p>
            )}
          </div>
        </CardContent>
      </Card>

      <LotDetailModal lot={selectedLot} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
