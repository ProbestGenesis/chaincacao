"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function CarrierDashboard() {
  const activeOrders = 3
  const completedOrders = 12
  const totalKm = 1250

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ordres Actifs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{activeOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">en cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Complétés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Distance Totale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalKm}</div>
            <p className="text-xs text-muted-foreground mt-1">km</p>
          </CardContent>
        </Card>
      </div>

      <Button asChild>
        <Link href="/carrier/ordres">Voir les ordres</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ordres en Cours</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Consultez le tableau de suivi des ordres</p>
        </CardContent>
      </Card>
    </div>
  )
}
