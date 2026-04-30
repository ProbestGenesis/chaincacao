"use client"

import { useEUDRStore } from "@/store/eudr"
import { useUser } from "@/context/useUser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function HistoriquePage() {
  const { user } = useUser()
  const { getEUDRByExporter } = useEUDRStore()

  const records = user ? getEUDRByExporter(user.userId) : []

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR")
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Historique de Conformité</h1>
          <p className="text-muted-foreground mt-1">Tous vos vérifications EUDR</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/exporter" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vérifications EUDR Confirmées ({records.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.shipmentId}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono font-semibold text-sm">{record.shipmentId}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(record.timestamp)}
                      </p>
                    </div>
                    <Badge variant={record.status === "confirmed" ? "default" : "secondary"}>
                      {record.status === "confirmed" ? "Confirmé" : "En attente"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Lots</p>
                      <p>{record.lotIds.length}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Statut EUDR</p>
                      <p>{record.eudrStatus}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Risque Pays</p>
                      <p className="capitalize">{record.countryRisk}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Score ESG</p>
                      <p>{record.esgScore}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Diligence: {record.diligenceDate}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Lots: {record.lotIds.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucun historique</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
