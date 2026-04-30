"use client"

import { useLotsStore } from "@/store/lots"
import { useCooperativeStore } from "@/store/cooperative"
import { useUser } from "@/context/useUser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import Link from "next/link"

export function CoopDashboard() {
  const { user } = useUser()
  const { lots } = useLotsStore()
  const { getGroupsByManager } = useCooperativeStore()

  const groups = user ? getGroupsByManager(user.userId) : []
  const coopLots = lots.filter((lot) => lot.coopName)
  const totalCoopWeight = coopLots.reduce((sum, lot) => sum + lot.poidsKg, 0)
  const averageQuality = coopLots.length > 0 
    ? Math.round((coopLots.length / lots.length) * 100) 
    : 0

  const pendingCount = coopLots.filter((l) => l.statut === "pending").length
  const readyToTransfer = coopLots.filter((l) => l.statut === "draft" || l.statut === "pending").length

  return (
    <div className="space-y-6 p-6">
      {/* KPI Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-700">Poids Total Agrégé</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{totalCoopWeight}</div>
            <p className="text-xs text-amber-700 mt-1">kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Nombre de Lots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{coopLots.length}</div>
            <p className="text-xs text-muted-foreground mt-1">dans la coop</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Groupements Actifs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground mt-1">groupes créés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Prêts à Transférer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{readyToTransfer}</div>
            <p className="text-xs text-muted-foreground mt-1">lots</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/cooperative/lots">
            <Plus className="h-4 w-4" />
            Créer un Groupement
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/cooperative/lots">
            Voir tous les lots
          </Link>
        </Button>
      </div>

      {/* Groups Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Groupements Actifs</CardTitle>
          <CardDescription>Liste de vos groupements</CardDescription>
        </CardHeader>
        <CardContent>
          {groups.length > 0 ? (
            <div className="space-y-3">
              {groups.map((group) => (
                <div
                  key={group.groupId}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{group.coopName}</p>
                    <p className="text-xs text-muted-foreground">
                      {group.lotIds.length} lots • {group.totalWeight} kg
                    </p>
                  </div>
                  <Badge variant="default">{group.totalWeight} kg</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun groupement créé
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lots Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statut des Lots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">En attente</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{readyToTransfer}</div>
              <p className="text-xs text-muted-foreground">À transférer</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {coopLots.filter((l) => l.statut === "transformed").length}
              </div>
              <p className="text-xs text-muted-foreground">Transformés</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
