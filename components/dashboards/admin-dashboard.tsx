"use client"

import { useUsersStore } from "@/store/users"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AdminDashboard() {
  const { users } = useUsersStore()
  const activeUsers = users.filter((u) => u.statut === "actif").length
  const totalUsers = users.length

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Utilisateurs Actifs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total des Utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">utilisateurs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taux d'Activation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">du total</p>
          </CardContent>
        </Card>
      </div>

      <Button asChild>
        <Link href="/admin/utilisateurs">Gérer utilisateurs</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gestion du Système</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Consultez les utilisateurs et les permissions</p>
        </CardContent>
      </Card>
    </div>
  )
}
