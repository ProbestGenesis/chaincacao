"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Search } from "lucide-react"

import { RoleGuard } from "@/components/layout/role-guard"
import { LotDetailModal } from "@/components/lot/lot-detail-modal"
import { useLotActionsStore } from "@/store/lot-actions"
import { useLotsStore } from "@/store/lots"
import { useUser } from "@/context/useUser"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function TransformerLotsPage() {
  return (
    <RoleGuard allowedRoles={["Transformer"]}>
      <TransformerLotsContent />
    </RoleGuard>
  )
}

function TransformerLotsContent() {
  const { user } = useUser()
  const { lots } = useLotsStore()
  const { getLotTimeline } = useLotActionsStore()
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const transformerLots = useMemo(
    () =>
      lots.filter((lot) =>
        ["pending", "transferred", "verified", "transformed", "exported"].includes(lot.statut)
      ),
    [lots]
  )

  const filteredLots = transformerLots.filter(
    (lot) =>
      lot.lotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.espece.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.coopName.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const selectedLot = selectedLotId
    ? lots.find((lot) => lot.lotId === selectedLotId) ?? null
    : null

  const metrics = [
    {
      label: "Lots visibles",
      value: transformerLots.length,
      note: "Lots qui concernent l’atelier",
    },
    {
      label: "À réceptionner",
      value: transformerLots.filter((lot) => lot.statut === "pending").length,
      note: "Entrées en attente",
    },
    {
      label: "À transformer",
      value: transformerLots.filter((lot) => lot.statut === "transferred").length,
      note: "Déjà transférés",
    },
    {
      label: "Historique",
      value: transformerLots.reduce((sum, lot) => sum + getLotTimeline(lot.lotId).length, 0),
      note: "Actions et validations",
    },
  ]

  const boardColumns = [
    {
      key: "pending",
      title: "À réceptionner",
      subtitle: "Lots en attente de prise en charge",
      color: "bg-yellow-100 text-yellow-800",
      lots: filteredLots.filter((lot) => lot.statut === "pending"),
    },
    {
      key: "transferred",
      title: "À transformer",
      subtitle: "Réception confirmée",
      color: "bg-blue-100 text-blue-800",
      lots: filteredLots.filter((lot) => lot.statut === "transferred"),
    },
    {
      key: "verified",
      title: "Contrôle qualité",
      subtitle: "Validation intermédiaire",
      color: "bg-violet-100 text-violet-800",
      lots: filteredLots.filter((lot) => lot.statut === "verified"),
    },
    {
      key: "transformed",
      title: "Transformés",
      subtitle: "Prêts pour contrôle final",
      color: "bg-orange-100 text-orange-800",
      lots: filteredLots.filter((lot) => lot.statut === "transformed" || lot.statut === "exported"),
    },
  ]

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary" className="rounded-full">
            Transformer
          </Badge>
          <h1 className="mt-2 text-3xl font-bold">Lots à traiter</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            La file de lots est synchronisée avec le store, et chaque lot peut être ouvert pour
            validation, transformation ou consultation du suivi.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/transformer">
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metric.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un lot, une espèce, une région..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {boardColumns.map((column) => (
          <Card key={column.key} className="border-dashed bg-background/80">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">{column.title}</CardTitle>
                <Badge className={column.color}>{column.lots.length}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{column.subtitle}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {column.lots.length > 0 ? (
                column.lots.map((lot) => {
                  const timeline = getLotTimeline(lot.lotId)
                  const lastEvent = timeline[timeline.length - 1]

                  return (
                    <button
                      key={lot.lotId}
                      type="button"
                      onClick={() => {
                        setSelectedLotId(lot.lotId)
                        setDetailOpen(true)
                      }}
                      className="w-full rounded-2xl border bg-muted/20 p-3 text-left transition hover:border-primary/60 hover:bg-muted/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono text-xs font-semibold">{lot.lotId}</p>
                          <p className="text-xs text-muted-foreground">
                            {lot.poidsKg} kg • {lot.region}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <p className="mt-2 text-sm font-medium">{lot.espece}</p>
                      <p className="text-xs text-muted-foreground">{lot.coopName}</p>

                      {lastEvent ? (
                        <div className="mt-3 rounded-xl bg-background/80 p-2 text-xs">
                          <p className="font-medium text-foreground">{lastEvent.phase}</p>
                          <p className="text-muted-foreground">{lastEvent.actorName}</p>
                        </div>
                      ) : (
                        <p className="mt-3 text-xs text-muted-foreground">Aucune action</p>
                      )}
                    </button>
                  )
                })
              ) : (
                <p className="rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                  Aucun lot dans cette étape
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <LotDetailModal lot={selectedLot} open={detailOpen} onOpenChange={setDetailOpen} />

      <div className="text-xs text-muted-foreground">
        Connecté: {user?.nomAffiche ?? "Utilisateur inconnu"}
      </div>
    </div>
  )
}
