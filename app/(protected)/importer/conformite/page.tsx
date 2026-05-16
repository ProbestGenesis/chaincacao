"use client"

import { useLots } from "@/hooks/useLots"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ShieldCheck, FileText, Globe, CheckCircle2, AlertCircle } from "lucide-react"

export default function ImporterConformitePage() {
  const { serverLots, loadLots, isLoading } = useLots()

  useEffect(() => {
    loadLots()
  }, [loadLots])

  // Simulation d'expéditions internationales à vérifier pour l'import
  const shipments = serverLots.filter(l => l.statut === "exported" || l.statut === "verified")

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-xl">
          <Globe className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Conformité Import</h1>
          <p className="text-muted-foreground mt-1">Vérifiez les documents de traçabilité pour le dédouanement EUDR.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : shipments.length > 0 ? (
          shipments.map((shipment) => (
            <Card key={shipment.lotId || shipment.id} className="overflow-hidden border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">Expédition #{shipment.lotId?.slice(-6).toUpperCase() || "INT-001"}</p>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">En cours de vérification</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Arrivée prévue: {new Date().toLocaleDateString()}</p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Documents requis
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center justify-between p-2 rounded bg-green-50 text-green-700">
                        <span>Certificat d'origine</span>
                        <CheckCircle2 className="h-4 w-4" />
                      </li>
                      <li className="flex items-center justify-between p-2 rounded bg-green-50 text-green-700">
                        <span>Preuve de non-déforestation</span>
                        <CheckCircle2 className="h-4 w-4" />
                      </li>
                      <li className="flex items-center justify-between p-2 rounded bg-amber-50 text-amber-700">
                        <span>Déclaration de douane</span>
                        <AlertCircle className="h-4 w-4" />
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Détails de la cargaison</p>
                    <div className="bg-muted/30 p-4 rounded-xl space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="font-medium">{shipment.poidsKg || shipment.poids_kg} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Origine:</span>
                        <span className="font-medium">{shipment.region}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exportateur:</span>
                        <span className="font-medium truncate max-w-[100px]">{shipment.orgName || "Inconnu"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end gap-2">
                    <Button className="w-full gap-2 rounded-xl">
                      <ShieldCheck className="h-4 w-4" />
                      Valider pour l'import
                    </Button>
                    <Button variant="outline" className="w-full rounded-xl">Voir le dossier complet</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Globe className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
              <p className="text-lg font-medium">Aucun dossier à traiter</p>
              <p className="text-sm text-muted-foreground max-w-xs mt-1">
                Les expéditions internationales confirmées apparaîtront ici pour la vérification documentaire finale.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
