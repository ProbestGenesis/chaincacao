"use client"

import { useLots } from "@/hooks/useLots"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ShieldCheck, ClipboardCheck, AlertTriangle, FileCheck } from "lucide-react"
import { translateStatus } from "@/lib/status-helper"

export default function VerifierLotPage() {
  const { serverLots, loadLots, isLoading } = useLots()
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadLots()
  }, [loadLots])

  const lotsToVerify = serverLots.filter(l => 
    l.lotId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.id?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10)

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Vérification de Conformité</h1>
            <p className="text-muted-foreground mt-1">Auditez les lots et validez leur conformité EUDR.</p>
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un ID de lot..." 
            className="pl-9 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : lotsToVerify.length > 0 ? (
          <div className="grid gap-4">
            {lotsToVerify.map((lot) => (
              <Card key={lot.lotId || lot.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">{lot.lotId || lot.id}</Badge>
                        <Badge variant="secondary">{translateStatus(lot.statut)}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs font-bold uppercase">Origine</p>
                          <p>{lot.region}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs font-bold uppercase">Producteur</p>
                          <p className="truncate max-w-[150px]">{lot.farmerId || "Inconnu"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs font-bold uppercase">Poids</p>
                          <p>{lot.poidsKg || lot.poids_kg} kg</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs font-bold uppercase">Score ESG</p>
                          <Badge className="bg-green-100 text-green-700 border-green-200">A+</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-2 md:w-64 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                      <Button className="w-full gap-2 rounded-xl">
                        <ClipboardCheck className="h-4 w-4" />
                        Lancer l'audit
                      </Button>
                      <Button variant="outline" className="w-full gap-2 rounded-xl text-destructive hover:bg-destructive/5 hover:text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        Signaler une anomalie
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FileCheck className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
              <p className="text-lg font-medium">Aucun lot trouvé</p>
              <p className="text-sm text-muted-foreground max-w-xs mt-1">
                Ajustez votre recherche ou attendez que de nouveaux lots soient soumis pour vérification.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
