"use client"

import { useUser } from "@/context/useUser"
import { useLots } from "@/hooks/useLots"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { translateStatus } from "@/lib/status-helper"

export default function HistoriqueAgriculteurPage() {
  const { user } = useUser()
  const { serverLots, loadLots, isLoading } = useLots()

  useEffect(() => {
    loadLots()
  }, [loadLots])

  const lots = user ? serverLots.filter((l: any) => l.farmer_id === user.userId || l.farmerId === user.userId || l.ownerId === user.blockchainId) : []
  const historicalLots = lots.filter((l: any) => ["exported", "transformed", "verified", "TRANSFORME", "EXPORTE"].includes(l.statut))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Historique des Lots</h1>
            <p className="text-muted-foreground mt-1">Consultez vos lots terminés et leurs parcours.</p>
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
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : historicalLots.length > 0 ? (
          historicalLots.map((lot: any) => (
            <Card key={lot.lotId || lot.lotHash || lot.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="bg-muted/30 p-6 md:w-64 border-b md:border-b-0 md:border-r">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">ID Lot</p>
                    <p className="font-mono text-sm mb-4">{lot.lotId || lot.lotHash || lot.id}</p>
                    <Badge className="w-full justify-center">
                      {translateStatus(lot.statut)}
                    </Badge>
                  </div>
                  <div className="p-6 flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Espèce</p>
                      <p className="font-medium">{lot.espece || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Poids</p>
                      <p className="font-medium">{lot.poidsKg || lot.poids_kg || "0"} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Région</p>
                      <p className="font-medium">{lot.region || lot.espece || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Date</p>
                      <p className="font-medium">
                        {lot.updatedAt || lot.dateCreation || lot.dateCollecte
                          ? new Date(lot.updatedAt || lot.dateCreation || lot.dateCollecte).toLocaleDateString("fr-FR")
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 flex items-center justify-end bg-muted/10">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/agriculteur/lots/${lot.lotId || lot.lotHash || lot.id}`}>
                        Voir le parcours complet
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-lg font-medium">Aucun historique disponible</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Vos lots apparaîtront ici une fois qu'ils auront atteint un statut final.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
