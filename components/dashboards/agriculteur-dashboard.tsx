"use client"

import { useLotsStore } from "@/store/lots"
import { useUser } from "@/context/useUser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

export function AgriculteurDashboard() {
  const { user } = useUser()
  const { getLotsForFarmer, lots } = useLotsStore()

  const farmerLots = user ? getLotsForFarmer(user.userId) : []
  const totalWeight = farmerLots.reduce((sum, lot) => sum + lot.poidsKg, 0)
  const recentLots = farmerLots.slice(-3).reverse()

  const statusCounts = {
    draft: farmerLots.filter((l) => l.statut === "draft").length,
    pending: farmerLots.filter((l) => l.statut === "pending").length,
    transferred: farmerLots.filter((l) => l.statut === "transferred").length,
    transformed: farmerLots.filter((l) => l.statut === "transformed").length,
    exported: farmerLots.filter((l) => l.statut === "exported").length,
  }

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    draft: { label: "Brouillon", variant: "outline" },
    pending: { label: "En attente", variant: "secondary" },
    transferred: { label: "Transféré", variant: "secondary" },
    transformed: { label: "Transformé", variant: "default" },
    exported: { label: "Exporté", variant: "default" },
  }

  return (
    <div className="space-y-6 p-6">
      {/* KPI Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-700">Poids Total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{totalWeight}</div>
            <p className="text-xs text-amber-700 mt-1">kg récoltés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Nombre de Lots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{farmerLots.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Lots au total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Statut Moyen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{statusCounts.exported}</div>
            <p className="text-xs text-muted-foreground mt-1">Lots exportés</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/agriculteur/nouveau-lot">
            <Plus className="h-4 w-4" />
            Ajouter un Lot
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/agriculteur/lots">
            Voir tous les lots
          </Link>
        </Button>
      </div>

      {/* Recent Lots */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lots Récents</CardTitle>
          <CardDescription>Vos 3 derniers lots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLots.length > 0 ? (
              recentLots.map((lot) => (
                <div
                  key={lot.lotId}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{lot.lotId}</p>
                    <p className="text-xs text-muted-foreground">
                      {lot.poidsKg} kg • {lot.espece}
                    </p>
                  </div>
                  <Badge variant={statusLabels[lot.statut]?.variant || "outline"}>
                    {statusLabels[lot.statut]?.label || lot.statut}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun lot pour le moment
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aperçu des Statuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                  {statusLabels[status]?.label || status}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
