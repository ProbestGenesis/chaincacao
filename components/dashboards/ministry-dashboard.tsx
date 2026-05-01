"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function MinistryDashboard() {
  const totalLots = 1284
  const totalShipments = 156
  const complianceRate = 98.7

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lots Totaux</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLots}</div>
            <p className="text-xs text-muted-foreground mt-1">tracés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expéditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalShipments}</div>
            <p className="text-xs text-muted-foreground mt-1">suies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conformité EUDR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{complianceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">globale</p>
          </CardContent>
        </Card>
      </div>

      <Button asChild>
        <Link href="/ministry/rapports">Voir les rapports</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analyse Systématique</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Consultez les rapports d'analyse et de conformité</p>
        </CardContent>
      </Card>
    </div>
  )
}
