"use client"

import { useUser } from "@/context/useUser"
import { useLots } from "@/hooks/useLots"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Truck, MapPin } from "lucide-react"
import Link from "next/link"
import { translateStatus } from "@/lib/status-helper"

export default function ExpeditionAgriculteurPage() {
  const { user } = useUser()
  const { serverLots, loadLots, isLoading } = useLots()

  useEffect(() => {
    loadLots()
  }, [loadLots])

  const lots = user ? serverLots.filter((l: any) => l.farmer_id === user.userId || l.farmerId === user.userId || l.ownerId === user.blockchainId) : []
  const ongoingExpeditions = lots.filter((l: any) => ["pending", "transferred", "en_transit", "EN_TRANSIT", "COLLECTE"].includes(l.statut))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Truck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Expéditions en cours</h1>
            <p className="text-muted-foreground mt-1">Suivez le transport de vos lots vers les centres de collecte.</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/agriculteur" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : ongoingExpeditions.length > 0 ? (
          ongoingExpeditions.map((lot) => (
            <Card key={lot.lotId || lot.lotHash || lot.id} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-bold">{lot.lotId || lot.lotHash || lot.id}</p>
                      <Badge variant="secondary">{translateStatus(lot.statut)}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2">
                        <div className="bg-muted p-1.5 rounded-lg">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Départ</p>
                          <p className="text-sm">{lot.region || lot.espece || "—"}</p>
                        </div>
                      </div>
                      <div className="flex-1 h-px bg-dashed border-t-2 border-dashed border-muted relative">
                        <Truck className="h-4 w-4 absolute -top-2 left-1/2 -translate-x-1/2 text-primary bg-background px-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-lg">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Destination</p>
                          <p className="text-sm">{lot.coopName || lot.coopId || lot.coop_name || "Centre de collecte"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-48 space-y-3">
                    <div className="bg-muted/40 p-3 rounded-xl text-center">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Poids</p>
                      <p className="text-xl font-bold">{lot.poidsKg || lot.poids_kg || "0"} kg</p>
                    </div>
                    <Button asChild className="w-full rounded-xl" size="sm">
                      <Link href={`/agriculteur/lots/${lot.lotId || lot.lotHash || lot.id}`}>Détails</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-muted/30 p-4 rounded-full mb-4">
                <Truck className="h-10 w-10 text-muted-foreground opacity-30" />
              </div>
              <p className="text-lg font-medium">Aucune expédition en cours</p>
              <p className="text-sm text-muted-foreground max-w-xs mt-1">
                Lorsque vos lots seront pris en charge par un transporteur, ils apparaîtront ici.
              </p>
              <Button asChild className="mt-6" variant="outline">
                <Link href="/agriculteur/lots">Voir mes lots</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
