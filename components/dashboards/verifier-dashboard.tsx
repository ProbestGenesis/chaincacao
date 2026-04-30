"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function VerifierDashboard() {
  const pendingVerification = 8
  const verified = 145
  const complianceRate = 98.5

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>En Attente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pendingVerification}</div>
            <p className="text-xs text-muted-foreground mt-1">lots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vérifiés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{verified}</div>
            <p className="text-xs text-muted-foreground mt-1">lots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taux de Conformité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{complianceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">conforme</p>
          </CardContent>
        </Card>
      </div>

      <Button asChild>
        <Link href="/verifier/lot">Vérifier un lot</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statut Général</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Accédez aux détails de vérification</p>
        </CardContent>
      </Card>
    </div>
  )
}
