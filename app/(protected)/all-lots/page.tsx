"use client"

import { useState } from "react"
import Link from "next/link"

import { RoleGuard } from "@/components/layout/role-guard"
import { LotDetailModal } from "@/components/lot/lot-detail-modal"
import { LotWorkflowTimeline } from "@/components/lot/lot-workflow-timeline"
import { useLotActionsStore } from "@/store/lot-actions"
import { useLotsStore } from "@/store/lots"
import { useUser } from "@/context/useUser"
import type { Lot } from "@/types/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowRight, ChevronRight, Search } from "lucide-react"

const allowedRoles = [
  "CoopManager",
  "Transformer",
  "Exporter",
  "CarrierUser",
  "Verifier",
  "Importer",
  "MinistryAnalyst",
  "Admin",
] as const

export default function AllLotsPage() {
  return (
    <RoleGuard allowedRoles={[...allowedRoles]}>
      <AllLotsContent />
    </RoleGuard>
  )
}

function AllLotsContent() {
  const { lots } = useLotsStore()
  const { getLotTimeline } = useLotActionsStore()
  const { activeRole } = useUser()
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLots = lots.filter(
    (lot) =>
      lot.lotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.espece.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.coopName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
    pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
    transferred: { label: "Transféré", color: "bg-blue-100 text-blue-800" },
    transformed: { label: "Transformé", color: "bg-orange-100 text-orange-800" },
    exported: { label: "Exporté", color: "bg-green-100 text-green-800" },
  }

  const metrics = [
    { label: "Lots visibles", value: filteredLots.length },
    {
      label: "Traçables",
      value: filteredLots.filter((lot) => getLotTimeline(lot.lotId).length > 0).length,
    },
    {
      label: "Exportés",
      value: filteredLots.filter((lot) => lot.statut === "exported").length,
    },
    {
      label: "Validations",
      value: filteredLots.reduce((count, lot) => count + getLotTimeline(lot.lotId).length, 0),
    },
  ]

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 rounded-3xl border bg-gradient-to-br from-background to-muted/30 p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="rounded-full">
            {activeRole}
          </Badge>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Transparence totale du lot
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tous les lots</h1>
            <p className="max-w-2xl text-muted-foreground">
              Consultation globale des lots, de chaque validation acteur par acteur, jusqu’au
              contrôle importateur via QR code.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/importer/conformite">
              Aller à la conformité
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par ID, espèce, région ou coopérative..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lots visibles ({filteredLots.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredLots.length > 0 ? (
            filteredLots.map((lot) => {
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
                          <p className="text-sm text-muted-foreground">
                            {lot.poidsKg} kg • {lot.espece} • {lot.region} • {lot.coopName}
                          </p>
                        </div>
                        <Badge className={statusLabels[lot.statut]?.color || "bg-gray-100"}>
                          {statusLabels[lot.statut]?.label || lot.statut}
                        </Badge>
                      </div>

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
                          Aucun évènement enregistré sur ce lot.
                        </p>
                      )}
                    </div>

                    <div className="w-full max-w-xl">
                      <LotWorkflowTimeline lot={lot} timeline={timeline} compact />
                    </div>

                    <div className="flex items-center justify-end text-muted-foreground">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </button>
              )
            })
          ) : (
            <p className="py-10 text-center text-muted-foreground">Aucun lot trouvé</p>
          )}
        </CardContent>
      </Card>

      <LotDetailModal lot={selectedLot} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
