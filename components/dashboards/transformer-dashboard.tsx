"use client"

import { useLotsStore } from "@/store/lots"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import Link from "next/link"

export function TransformerDashboard() {
  const { getLotsInStatus } = useLotsStore()

  const inProcess = getLotsInStatus("pending")
  const transformed = getLotsInStatus("transformed")
  const totalWeight = [...inProcess, ...transformed].reduce((sum, lot) => sum + lot.poidsKg, 0)

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>En Traitement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inProcess.length}</div>
            <p className="text-xs text-muted-foreground mt-1">lots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Transformés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{transformed.length}</div>
            <p className="text-xs text-muted-foreground mt-1">lots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Poids Total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalWeight}</div>
            <p className="text-xs text-muted-foreground mt-1">kg</p>
          </CardContent>
        </Card>
      </div>

      <Button asChild>
        <Link href="/transformer/lots">Voir les lots</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lots à Traiter</CardTitle>
        </CardHeader>
        <CardContent>
          {inProcess.length > 0 ? (
            <div className="space-y-2">
              {inProcess.slice(0, 5).map((lot) => (
                <div key={lot.lotId} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <p className="text-sm font-medium">{lot.lotId}</p>
                  <Badge variant="secondary">{lot.poidsKg}kg</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun lot en cours</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
