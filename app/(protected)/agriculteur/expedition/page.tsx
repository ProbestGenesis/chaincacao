"use client"

import { useUser } from "@/context/useUser"
import { useLotsStore } from "@/store/lots"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Truck } from "lucide-react"
import Link from "next/link"

export default function ExpeditionPage() {
  const { user } = useUser()
  const { getLotsForFarmer } = useLotsStore()

  const lots = user ? getLotsForFarmer(user.userId) : []
  const shippedLots = lots.filter((l) => l.statut === "transferred" || l.statut === "transformed" || l.statut === "exported")

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expéditions</h1>
          <p className="text-muted-foreground mt-1">Suivi de vos envois</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/agriculteur">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">En Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {lots.filter((l) => l.statut === "transferred").length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Transformés</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {lots.filter((l) => l.statut === "transformed").length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Exportés</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {lots.filter((l) => l.statut === "exported").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lots en Expédition ({shippedLots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {shippedLots.length > 0 ? (
            <div className="space-y-3">
              {shippedLots.map((lot) => (
                <div key={lot.lotId} className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50">
                  <div className="flex-1">
                    <p className="font-mono text-sm font-semibold">{lot.lotId}</p>
                    <p className="text-xs text-muted-foreground">{lot.poidsKg} kg • {lot.espece}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{lot.statut}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucune expédition en cours</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
