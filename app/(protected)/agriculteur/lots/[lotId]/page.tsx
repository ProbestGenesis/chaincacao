"use client"

import { useParams } from "next/navigation"
import { useLotsStore } from "@/store/lots"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LotDetailPage() {
  const params = useParams()
  const { getLotById } = useLotsStore()

  const lotId = params.lotId as string
  const lot = getLotById(lotId)

  if (!lot) {
    return (
      <div className="p-6 space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/agriculteur/lots">Retour</Link>
        </Button>
        <p className="text-muted-foreground">Lot non trouvé</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{lot.lotId}</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/agriculteur/lots">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Détails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Espèce</p>
              <p className="font-semibold">{lot.espece}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Poids</p>
              <p className="font-semibold">{lot.poidsKg} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Région</p>
              <p className="font-semibold">{lot.region}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Coop</p>
              <p className="font-semibold">{lot.coopName}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localisation GPS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Latitude</p>
              <p className="font-semibold">{lot.gps.latitude.toFixed(4)}°</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Longitude</p>
              <p className="font-semibold">{lot.gps.longitude.toFixed(4)}°</p>
            </div>
            <Badge>{lot.statut}</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
