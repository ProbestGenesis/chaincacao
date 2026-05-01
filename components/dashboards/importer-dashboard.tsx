"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function ImporterDashboard() {
  const pendingDocuments = 5
  const confirmedShipments = 32
  const complianceRate = 99

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Documents en Attente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pendingDocuments}</div>
            <p className="text-xs text-muted-foreground mt-1">dossiers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expéditions Confirmées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{confirmedShipments}</div>
            <p className="text-xs text-muted-foreground mt-1">cette année</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conformité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{complianceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">documentaire</p>
          </CardContent>
        </Card>
      </div>

      <Button asChild>
        <Link href="/importer/conformite">Vérifier conformité</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dossiers d'Import</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Consultez l'état de vos dossiers d'import</p>
        </CardContent>
      </Card>
    </div>
  )
}
