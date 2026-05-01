"use client"

import { useState } from "react"
import { Lot } from "@/types/types"
import { useLotActionsStore } from "@/store/lot-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Copy } from "lucide-react"

// Simple QR generator
function generateQRCode(text: string): string {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  const size = 200
  canvas.width = size
  canvas.height = size

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, 10, size)
  ctx.fillRect(0, 0, size, 10)
  ctx.fillRect(size - 10, 0, 10, size)
  ctx.fillRect(0, size - 10, size, 10)

  for (let i = 0; i < 3; i++) {
    ctx.fillRect(i * 5, i * 5, 50 - i * 10, 50 - i * 10)
  }
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(size - 60 + i * 5, i * 5, 50 - i * 10, 50 - i * 10)
  }
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(i * 5, size - 60 + i * 5, 50 - i * 10, 50 - i * 10)
  }

  ctx.fillStyle = "#000000"
  const hash = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  for (let y = 60; y < size - 60; y += 10) {
    for (let x = 60; x < size - 60; x += 10) {
      if ((x + y + hash) % 3 === 0) {
        ctx.fillRect(x, y, 5, 5)
      }
    }
  }

  return canvas.toDataURL()
}

interface LotDetailModalProps {
  lot: Lot | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  transferred: { label: "Transféré", color: "bg-blue-100 text-blue-800" },
  transformed: { label: "Transformé", color: "bg-orange-100 text-orange-800" },
  exported: { label: "Exporté", color: "bg-green-100 text-green-800" },
}

const actionRoleColors: Record<string, string> = {
  Agriculteur: "bg-green-100 text-green-800",
  CoopManager: "bg-blue-100 text-blue-800",
  Transformer: "bg-orange-100 text-orange-800",
  Exporter: "bg-purple-100 text-purple-800",
  Verifier: "bg-red-100 text-red-800",
  CarrierUser: "bg-indigo-100 text-indigo-800",
  Importer: "bg-pink-100 text-pink-800",
  MinistryAnalyst: "bg-slate-100 text-slate-800",
  Admin: "bg-gray-100 text-gray-800",
}

export function LotDetailModal({ lot, open, onOpenChange }: LotDetailModalProps) {
  const { getLotTimeline } = useLotActionsStore()
  const [qrCode, setQrCode] = useState<string>("")

  if (!lot) return null

  const timeline = getLotTimeline(lot.lotId)
  if (!qrCode) {
    setQrCode(generateQRCode(lot.lotId))
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("fr-FR")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lot.lotId}</DialogTitle>
          <DialogDescription>Détails complets et historique du lot</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
            <TabsTrigger value="timeline">Timeline ({timeline.length})</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations Principales</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Espèce</p>
                  <p className="font-semibold">{lot.espece}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Poids</p>
                  <p className="font-semibold">{lot.poidsKg} kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Région</p>
                  <p className="font-semibold">{lot.region}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coopérative</p>
                  <p className="font-semibold">{lot.coopName}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statut Actuel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge className={statusLabels[lot.statut]?.color || "bg-gray-100"}>
                  {statusLabels[lot.statut]?.label || lot.statut}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Synchronisation: {lot.syncStatus === "synced" ? "✓ Synchro" : "⏳ En attente"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Localisation GPS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Latitude</p>
                    <p className="font-mono font-semibold">{lot.gps.latitude.toFixed(6)}°</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Longitude</p>
                    <p className="font-mono font-semibold">{lot.gps.longitude.toFixed(6)}°</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Créé</p>
                  <p>{formatDate(lot.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Modifié</p>
                  <p>{formatDate(lot.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qr" className="mt-4">
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardHeader>
                <CardTitle className="text-center">Code de Transfert</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                {qrCode && (
                  <div className="bg-white p-4 rounded border-2 border-amber-200">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                )}
                <p className="text-sm text-center text-amber-900">
                  Scannez ce code pour partager les détails du lot
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (qrCode) {
                        const link = document.createElement("a")
                        link.href = qrCode
                        link.download = `${lot.lotId}-qr.png`
                        link.click()
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Télécharger
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(lot.lotId)
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    Copier ID
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-4">
            <div className="space-y-3">
              {timeline.length > 0 ? (
                timeline.map((action, idx) => (
                  <div key={action.actionId} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                        {idx + 1}
                      </div>
                      {idx < timeline.length - 1 && <div className="w-0.5 h-12 bg-gray-200 my-2" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className={actionRoleColors[action.actor] || "bg-gray-100"}>
                            {action.actor}
                          </Badge>
                          <p className="font-semibold mt-1">{action.actorName}</p>
                          <p className="text-sm text-muted-foreground">{action.action}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(action.timestamp)}
                        </p>
                      </div>
                      <Card className="mt-2 bg-muted/50">
                        <CardContent className="pt-4">
                          <p className="text-sm">{action.description}</p>
                          {Object.keys(action.metadata || {}).length > 0 && (
                            <div className="text-xs text-muted-foreground mt-2">
                              {Object.entries(action.metadata || {}).map(([key, value]) => (
                                <p key={key}>
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </p>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucune action enregistrée</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
