"use client"

import { useState } from "react"
import { useLotsStore } from "@/store/lots"
import { useLotActionsStore } from "@/store/lot-actions"
import { useUser } from "@/context/useUser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight, Search } from "lucide-react"
import { LotDetailModal } from "@/components/lot/lot-detail-modal"
import { LotActionsPanel } from "@/components/lot/lot-actions-panel"

export default function AllLotsPage() {
  const { lots } = useLotsStore()
  const { getLotTimeline } = useLotActionsStore()
  const { activeRole } = useUser()
  const [selectedLot, setSelectedLot] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionsPanelOpen, setActionsPanelOpen] = useState(false)

  const filteredLots = lots.filter((lot) =>
    lot.lotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.espece.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.region.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const handleOpenActions = (lot: any) => {
    setSelectedLot(lot)
    setActionsPanelOpen(true)
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Tous les Lots</h1>
        <p className="text-muted-foreground mt-1">
          Suivi transparent de tous les lots - Rôle: {activeRole}
        </p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par ID, espèce ou région..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(statusLabels).map(([status, { label, color }]) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {filteredLots.filter((l) => l.statut === status).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lots Disponibles ({filteredLots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredLots.length > 0 ? (
              filteredLots.map((lot) => {
                const timeline = getLotTimeline(lot.lotId)
                const lastAction = timeline[timeline.length - 1]

                return (
                  <div
                    key={lot.lotId}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-mono font-semibold text-sm">{lot.lotId}</p>
                        <p className="text-sm">
                          {lot.poidsKg} kg • {lot.espece} • {lot.region} • {lot.coopName}
                        </p>
                      </div>
                      <Badge className={statusLabels[lot.statut]?.color || "bg-gray-100"}>
                        {statusLabels[lot.statut]?.label || lot.statut}
                      </Badge>
                    </div>

                    {lastAction && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded mb-3">
                        Dernière: <span className="font-medium">{lastAction.actorName}</span> ({lastAction.actor})
                        <br />
                        {lastAction.description}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetail(lot)}
                        className="flex-1"
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOpenActions(lot)}
                        className="flex-1"
                      >
                        Agir
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucun lot trouvé</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <LotDetailModal lot={selectedLot} open={modalOpen} onOpenChange={setModalOpen} />

      {/* Actions Panel Modal */}
      {selectedLot && actionsPanelOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Actions sur {selectedLot.lotId}</CardTitle>
                <button
                  onClick={() => setActionsPanelOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <LotActionsPanel lot={selectedLot} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
