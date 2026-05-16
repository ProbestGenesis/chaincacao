"use client"

import { useLots } from "@/hooks/useLots"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Truck, Navigation, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { translateStatus } from "@/lib/status-helper"

export default function CarrierOrdresPage() {
  const { serverLots, loadLots, isLoading } = useLots()

  useEffect(() => {
    loadLots()
  }, [loadLots])

  // Simulation d'ordres de transport assignés
  const orders = serverLots.filter((l: any) => ["pending", "transferred", "en_transit", "EN_TRANSIT", "COLLECTE"].includes(l.statut))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Navigation className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Ordres de Transport</h1>
            <p className="text-muted-foreground mt-1">Gérez vos missions de collecte et de livraison.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : orders.length > 0 ? (
          orders.map((lot) => (
            <Card key={lot.lotId || lot.lotHash || lot.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">{lot.lotId || lot.lotHash || lot.id}</Badge>
                    <Badge>{translateStatus(lot.statut)}</Badge>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Assigné le {new Date().toLocaleDateString()}</p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-primary/10 p-1.5 rounded-full">
                        <div className="h-2 w-2 bg-primary rounded-full" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Enlèvement</p>
                        <p className="font-semibold">{lot.region || lot.espece || "—"}</p>
                        <p className="text-xs text-muted-foreground">{lot.farmerId || lot.ownerId || "Producteur local"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-green-500/10 p-1.5 rounded-full">
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Livraison</p>
                        <p className="font-semibold">{lot.coopName || lot.coopId || lot.coop_name || "Entrepôt Central"}</p>
                        <p className="text-xs text-muted-foreground">Centre de collecte</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/20 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Marchandise:</span>
                      <span className="font-medium">{lot.espece || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Poids total:</span>
                      <span className="font-medium">{lot.poidsKg || lot.poids_kg || "0"} kg</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2 mt-2">
                      <span className="text-muted-foreground">Priorité:</span>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Haute</Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {lot.statut === "pending" ? (
                      <Button className="w-full rounded-xl gap-2">
                        <Truck className="h-4 w-4" />
                        Démarrer le transport
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full rounded-xl gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Confirmer la livraison
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="w-full rounded-xl">Signaler un incident</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
              <p className="text-lg font-medium">Aucun ordre de transport</p>
              <p className="text-sm text-muted-foreground max-w-xs mt-1">
                Vous recevrez une notification dès qu'une nouvelle mission vous sera assignée.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
