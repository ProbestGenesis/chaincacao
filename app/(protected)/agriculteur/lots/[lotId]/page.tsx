"use client"

import { useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useQRCode } from "next-qrcode"
import Link from "next/link"
import { ArrowLeft, Copy, Download, QrCode } from "lucide-react"

import { useUser } from "@/context/useUser"
import { LotActionsPanel } from "@/components/lot/lot-actions-panel"
import { LotWorkflowTimeline } from "@/components/lot/lot-workflow-timeline"
import { useLotActionsStore } from "@/store/lot-actions"
import { useLotsStore } from "@/store/lots"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  transferred: { label: "Transféré", color: "bg-blue-100 text-blue-800" },
  transformed: { label: "Transformé", color: "bg-orange-100 text-orange-800" },
  exported: { label: "Exporté", color: "bg-green-100 text-green-800" },
}

export default function LotDetailPage() {
  const params = useParams()
  const { activeRole } = useUser()
  const { getLotById } = useLotsStore()
  const { getLotTimeline } = useLotActionsStore()
  const { Canvas } = useQRCode()
  const qrBoxRef = useRef<HTMLDivElement>(null)
  const [copyLabel, setCopyLabel] = useState("Copier l'ID")

  const lotId = params.lotId as string
  const lot = getLotById(lotId)

  const qrValue = lot ? `chaincacao://lot/${lot.lotId}` : ""
  const timeline = lot ? getLotTimeline(lot.lotId) : []

  const copyLotId = async () => {
    if (!lot) return
    await navigator.clipboard.writeText(lot.lotId)
    setCopyLabel("ID copié")
    setTimeout(() => setCopyLabel("Copier l'ID"), 1500)
  }

  const downloadQRCode = () => {
    const canvas = qrBoxRef.current?.querySelector("canvas")
    if (!canvas || !lot) return

    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = `${lot.lotId}-qr.png`
    link.click()
  }

  if (!lot) {
    return (
      <div className="space-y-4 p-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/agriculteur/lots">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
        <p className="text-muted-foreground">Lot non trouvé</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="secondary" className="rounded-full">
            Détail du lot
          </Badge>
          <h1 className="mt-2 text-3xl font-bold">{lot.lotId}</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Vue complète du lot avec preuve QR, historique des validations et état de
            synchronisation hors chaîne.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={copyLotId} variant="outline" className="rounded-full">
            <Copy className="h-4 w-4" />
            {copyLabel}
          </Button>
          <Button onClick={downloadQRCode} variant="outline" className="rounded-full">
            <Download className="h-4 w-4" />
            Télécharger le QR
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/agriculteur/lots">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Provenance, poids et localisation de la récolte
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
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
            <div>
              <p className="text-sm text-muted-foreground">GPS</p>
              <p className="font-semibold">
                {lot.gps.latitude.toFixed(4)}, {lot.gps.longitude.toFixed(4)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date de collecte</p>
              <p className="font-semibold">
                {new Date(lot.dateCollecte).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR du lot
            </CardTitle>
            <CardDescription>
              À scanner pour accéder à l’historique complet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div ref={qrBoxRef} className="rounded-2xl border bg-white p-4">
              <Canvas
                text={qrValue}
                options={{
                  width: 220,
                  margin: 2,
                  errorCorrectionLevel: "M",
                  color: {
                    dark: "#111827",
                    light: "#FFFFFF",
                  },
                }}
              />
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Identifiant unique</p>
              <p className="font-mono break-all rounded-xl bg-muted p-3">{qrValue}</p>
            </div>
            <Separator />
            <Badge className={statusLabels[lot.statut]?.color || "bg-gray-100"}>
              {statusLabels[lot.statut]?.label || lot.statut}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Synchronisation: {lot.syncStatus}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique et validations</CardTitle>
          <CardDescription>
            Chaque acteur laisse une trace consultable sur le lot.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LotWorkflowTimeline lot={lot} timeline={timeline} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intervention du rôle connecté</CardTitle>
          <CardDescription>
            {activeRole
              ? `Le rôle ${activeRole} peut agir ici si une étape est disponible.`
              : "Connectez-vous pour intervenir sur ce lot."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LotActionsPanel lot={lot} />
        </CardContent>
      </Card>
    </div>
  )
}
