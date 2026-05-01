"use client"

import { useLotsStore } from "@/store/lots"
import { useEUDRStore } from "@/store/eudr"
import { useUser } from "@/context/useUser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Plus } from "lucide-react"
import Link from "next/link"
import { translateStatus } from "@/lib/status-helper"

export function ExporterDashboard() {
  const { user } = useUser()
  const { lots } = useLotsStore()
  const { getEUDRByExporter } = useEUDRStore()

  const readyToExport = lots.filter((l) => l.statut === "transformed" || l.statut === "pending")
  const eudrRecords = user ? getEUDRByExporter(user.userId) : []
  const confirmedCount = eudrRecords.filter((r) => r.status === "confirmed").length
  const pendingEudr = eudrRecords.filter((r) => r.status === "pending").length

  const complianceRate = eudrRecords.length > 0
    ? Math.round((confirmedCount / eudrRecords.length) * 100)
    : 0

  return (
    <div className="space-y-6 p-6">
      {/* KPI Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-700">Prêts à Exporter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{readyToExport.length}</div>
            <p className="text-xs text-green-700 mt-1">lots</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-700">Conformité EUDR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{complianceRate}%</div>
            <p className="text-xs text-blue-700 mt-1">lots vérifiés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>En Attente de Vérification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pendingEudr}</div>
            <p className="text-xs text-muted-foreground mt-1">lots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Confirmé</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{confirmedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">lots</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/exporter/conformite">
            <ShieldAlert className="h-4 w-4" />
            Vérifier EUDR
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/exporter/historique">
            Voir l'historique
          </Link>
        </Button>
      </div>

      {/* Recent EUDR Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verifications Récentes</CardTitle>
          <CardDescription>Dernières confirmations EUDR</CardDescription>
        </CardHeader>
        <CardContent>
          {eudrRecords.length > 0 ? (
            <div className="space-y-3">
              {eudrRecords.slice(-5).reverse().map((record) => (
                <div
                  key={record.shipmentId}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{record.shipmentId}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.lotIds.length} lots • Score: {record.esgScore}
                    </p>
                  </div>
                  <Badge 
                    variant={record.status === "confirmed" ? "default" : "secondary"}
                  >
                    {translateStatus(record.status)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune vérification EUDR
            </p>
          )}
        </CardContent>
      </Card>

      {/* EUDR Compliance Info */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            Conformité EUDR
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-900">
          <p>
            Assurez-vous que chaque lot respecte les exigences EUDR avant l'expédition.
            Utilisez l'outil de vérification pour confirmer la non-déforestation et la traçabilité complète.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
