"use client"

import { useUser } from "@/context/useUser"
import { useFarmerLots } from "@/hooks/useLots"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Initialisé", variant: "outline" },
  pending: { label: "En attente", variant: "secondary" },
  transferred: { label: "Transféré", variant: "secondary" },
  transformed: { label: "Transformé", variant: "default" },
  exported: { label: "Exporté", variant: "default" },
}

export default function MesLotsPage() {
  const { user } = useUser()
  const farmerId = user?.blockchainId || user?.userId || ""
  const { data: lots = [], isLoading } = useFarmerLots(farmerId)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Lots</h1>
          <p className="text-muted-foreground mt-1">Gestion de vos lots agricoles</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/agriculteur" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Lots ({lots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : lots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">ID Lot</th>
                    <th className="text-left py-3 px-4 font-semibold">Espèce</th>
                    <th className="text-left py-3 px-4 font-semibold">Poids (kg)</th>
                    <th className="text-left py-3 px-4 font-semibold">Région</th>
                    <th className="text-left py-3 px-4 font-semibold">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold">Coop</th>
                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot: any) => (
                    <tr key={lot.lotId || lot.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-xs">{lot.lotId || lot.id}</td>
                      <td className="py-3 px-4">{lot.espece}</td>
                      <td className="py-3 px-4">{lot.poidsKg || lot.poids_kg}</td>
                      <td className="py-3 px-4">{lot.region}</td>
                      <td className="py-3 px-4">
                        <Badge variant={statusLabels[lot.statut]?.variant || "outline"}>
                          {statusLabels[lot.statut]?.label || lot.statut}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs">{lot.coopName || lot.coop_name}</td>
                      <td className="py-3 px-4">
                        <Button asChild variant="outline" size="sm" className="rounded-full">
                          <Link href={`/agriculteur/lots/${lot.lotId || lot.id}`}>Voir</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucun lot créé pour le moment</p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button asChild>
          <Link href="/agriculteur/nouveau-lot">Ajouter un nouveau lot</Link>
        </Button>
      </div>
    </div>
  )
}
