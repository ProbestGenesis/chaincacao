"use client"
 
import { useLots } from "@/hooks/useLots"
import { useEUDRStore } from "@/store/eudr"
import { useUser } from "@/context/useUser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Plus, Ship, Factory, Search, History, LayoutDashboard, BarChart3 } from "lucide-react"
import Link from "next/link"
import { translateStatus } from "@/lib/status-helper"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useTraceability } from "@/hooks/useTraceability"
import { ShipmentDialog } from "@/components/traceability/shipment-dialog"
import { TransformationDialog } from "@/components/traceability/transformation-dialog"
import { AuditQueryPanel } from "@/components/traceability/audit-query-panel"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LotDetailModal } from "@/components/lot/lot-detail-modal"
import { ExporterReportsTab } from "./exporter-reports-tab"
import type { Lot } from "@/types/types"
 
export function ExporterDashboard() {
  const { user } = useUser()
  const { serverLots, loadLots, isLoading } = useLots()
  const { getEUDRByExporter } = useEUDRStore()
  const [selectedLots, setSelectedLots] = useState<string[]>([])
  const [selectedTransformLots, setSelectedTransformLots] = useState<string[]>([])
  const [detailLot, setDetailLot] = useState<Lot | null>(null)
 
  useEffect(() => {
    loadLots()
  }, [loadLots])
 
  const readyToExport = serverLots.filter((l) => 
    ["transformed", "verified", "transforme"].includes(l.statut?.toLowerCase())
  )

  const toTransform = serverLots.filter((l) => 
    ["pending", "verified", "collecte"].includes(l.statut?.toLowerCase())
  )

  const eudrRecords = user ? getEUDRByExporter(user.userId) : []
  const confirmedCount = eudrRecords.filter((r) => r.status === "confirmed").length
  const pendingEudr = eudrRecords.filter((r) => r.status === "pending").length
 
  const toggleLot = (hash: string) => {
    setSelectedLots(prev => 
      prev.includes(hash) ? prev.filter(h => h !== hash) : [...prev, hash]
    )
  }

  const toggleTransformLot = (hash: string) => {
    setSelectedTransformLots(prev => 
      prev.includes(hash) ? prev.filter(h => h !== hash) : [...prev, hash]
    )
  }
 
  const complianceRate = eudrRecords.length > 0
    ? Math.round((confirmedCount / eudrRecords.length) * 100)
    : 0
 
  return (
    <div className="space-y-6 p-6">
      <LotDetailModal 
        lot={detailLot} 
        open={!!detailLot} 
        onOpenChange={(open) => !open && setDetailLot(null)} 
      />

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports" className="gap-2">
            <LayoutDashboard className="size-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="shipments" className="gap-2">
            <Ship className="size-4" />
            Expéditions
          </TabsTrigger>
          <TabsTrigger value="transformations" className="gap-2">
            <Factory className="size-4" />
            Transformations
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Search className="size-4" />
            Audit Avancé
          </TabsTrigger>
        </TabsList>
 
        <TabsContent value="reports" className="mt-4">
          <ExporterReportsTab />
        </TabsContent>

        <TabsContent value="shipments" className="space-y-6 mt-4">
          {/* Actions */}
          <div className="flex gap-2">
            <ShipmentDialog 
              lotHashes={selectedLots} 
              onSuccess={() => {
                setSelectedLots([])
                loadLots()
              }} 
            />
            <Button variant="outline" asChild>
              <Link href="/exporter/conformite">
                <ShieldAlert className="h-4 w-4" />
                Vérifier EUDR
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/exporter/historique">
                <History className="h-4 w-4" />
                Voir l'historique
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lots prêts pour l'expédition</CardTitle>
              <CardDescription>Sélectionnez les lots pour créer une expédition internationale</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Lot ID</TableHead>
                      <TableHead>Région</TableHead>
                      <TableHead>Poids (kg)</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readyToExport.map((lot) => (
                      <TableRow key={lot.lotId || lot.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedLots.includes(lot.lotId || lot.id)} 
                            onCheckedChange={() => toggleLot(lot.lotId || lot.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{lot.lotId || lot.id}</TableCell>
                        <TableCell>{lot.region}</TableCell>
                        <TableCell>{lot.poidsKg || lot.poids_kg}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{translateStatus(lot.statut)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setDetailLot(lot)}>
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {readyToExport.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Aucun lot prêt pour l'export.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent EUDR Records */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verifications Récentes</CardTitle>
              <CardDescription>Dernières confirmations EUDR</CardDescription>
            </CardHeader>
            <CardContent>
              {eudrRecords.length > 0 ? (
                <div className="space-y-3">
                  {eudrRecords.slice(-5).reverse().map((record) => (
                    <div
                      key={record.shipmentId}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{record.shipmentId}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.lotIds.length} lots • Score: {record.esgScore}
                        </p>
                      </div>
                      <Badge 
                        variant={record.status === "confirmed" ? "default" : "secondary"}
                      >
                        {translateStatus(record.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune vérification EUDR
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transformations" className="space-y-6 mt-4">
          <div className="flex gap-2">
            <TransformationDialog 
              lotHashes={selectedTransformLots} 
              onSuccess={() => {
                setSelectedTransformLots([])
                loadLots()
              }} 
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lots à transformer</CardTitle>
              <CardDescription>Sélectionnez les lots à passer en transformation industrielle</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Lot ID</TableHead>
                      <TableHead>Poids (kg)</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {toTransform.map((lot) => (
                      <TableRow key={lot.lotId || lot.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedTransformLots.includes(lot.lotId || lot.id)} 
                            onCheckedChange={() => toggleTransformLot(lot.lotId || lot.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{lot.lotId || lot.id}</TableCell>
                        <TableCell>{lot.poidsKg || lot.poids_kg}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{translateStatus(lot.statut)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setDetailLot(lot)}>
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {toTransform.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Aucun lot en attente de transformation.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <AuditQueryPanel />
        </TabsContent>
      </Tabs>
 
      {/* EUDR Compliance Info */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            Conformité EUDR
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-900">
          <p>
            Assurez-vous que chaque lot respecte les exigences EUDR avant l'expédition.
            Utilisez l'outil de vérification pour confirmer la non-déforestation et la traçabilité complète.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
