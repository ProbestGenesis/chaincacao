"use client"

import { Copy, Download, QrCode } from "lucide-react"
import { useQRCode } from "next-qrcode"
import { useRef, useState } from "react"

import { LotActionsPanel } from "@/components/lot/lot-actions-panel"
import { LotWorkflowTimeline } from "@/components/lot/lot-workflow-timeline"
import { EUDRReportView } from "@/components/traceability/eudr-report-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/context/useUser"
import { useLotEUDR, useLotHistory } from "@/hooks/useTraceability"
import { getLotLineageIds } from "@/lib/lot-lineage"
import { translateStatus } from "@/lib/status-helper"
import type { LotAction } from "@/store/lot-actions"
import type { Lot } from "@/types/types"

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

export function LotDetailModal({
  lot,
  open,
  onOpenChange,
}: LotDetailModalProps) {
  const { activeRole } = useUser()
  const { Canvas } = useQRCode()
  // Priorité au hash blockchain (lotHash) pour les requêtes API, fallback sur lotId local
  const blockchainHash = (lot as any)?.lotHash || lot?.lotId || ""
  const { data: serverTimeline } = useLotHistory(blockchainHash)
  const { data: serverEUDR, isLoading: isLoadingEUDR } = useLotEUDR(
    blockchainHash
  )
  const qrBoxRef = useRef<HTMLDivElement>(null)
  const [copyLabel, setCopyLabel] = useState("Copier l'ID")

  if (!lot) return null

  const timeline: LotAction[] = (serverTimeline || []).map((entry: any) => ({
    actionId: entry.txId,
    lotId: lot.lotId || (lot as any).lotHash || (lot as any).id,
    actor: (entry?.value?.actor || entry?.value?.org || "Inconnu") as any,
    actorName:
      entry?.value?.actorName || entry?.value?.user || "Acteur Blockchain",
    actorId: entry?.value?.actorId || "0x...",
    action: (entry?.value?.action || "validated") as any,
    phase: (entry?.value?.phase || "transfert") as any,
    status: (entry?.value?.statut || "pending") as any,
    description:
      entry?.value?.description || "Action enregistrée sur la blockchain",
    timestamp: entry.timestamp
      ? new Date(entry.timestamp).getTime()
      : Date.now(),
    chainStatus: "recorded" as const,
    chainHash: entry.txId,
    metadata: entry?.value?.metadata || {},
  }))

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const qrValue = `${baseUrl}/inventory/${lot.lotId}`
  const metaActions = timeline.flatMap((action) => {
    const metadata = action.metadata
    if (!metadata || typeof metadata !== "object") return []
    return [metadata as Record<string, unknown>]
  })

  const sourceLots = Array.from(
    new Set(
      metaActions.flatMap((metadata) => {
        const value = metadata.sourceLots
        return Array.isArray(value)
          ? value.filter((item): item is string => typeof item === "string")
          : []
      })
    )
  )

  const signedBy = Array.from(
    new Set(
      metaActions.flatMap((metadata) => {
        const value = metadata.signedBy
        return Array.isArray(value)
          ? value.filter((item): item is string => typeof item === "string")
          : []
      })
    )
  )

  const documents = Array.from(
    new Set(
      metaActions.flatMap((metadata) => {
        const values: string[] = []
        const document = metadata.document
        if (typeof document === "string") values.push(document)

        const docs = metadata.documents
        if (Array.isArray(docs)) {
          values.push(
            ...docs.filter((item): item is string => typeof item === "string")
          )
        }

        const media = metadata.media
        if (Array.isArray(media)) {
          values.push(
            ...media.filter((item): item is string => typeof item === "string")
          )
        }

        return values
      })
    )
  )
  const declaredSourceLots = Array.from(
    new Set([...(lot.sourceLotIds ?? []), ...sourceLots])
  )
  const isGroupLot = Boolean(lot.isGroup || declaredSourceLots.length > 0)
  const lineageLotIds = getLotLineageIds(lot)

  const hasConfirmedEUDR = serverEUDR?.success
  const canAccessCompliance = activeRole === "Exporter"
  const showComplianceTab =
    canAccessCompliance || hasConfirmedEUDR || !!serverEUDR

  const getSignatureLabel = (actorId: string) => {
    const matchedAction = timeline.find((action) => action.actorId === actorId)
    return matchedAction
      ? `${matchedAction.actorName} (${matchedAction.actor})`
      : actorId
  }

  const copyLotId = async () => {
    await navigator.clipboard.writeText(lot.lotId)
    setCopyLabel("ID copié")
    setTimeout(() => setCopyLabel("Copier l'ID"), 1500)
  }

  const downloadQRCode = () => {
    const canvas = qrBoxRef.current?.querySelector("canvas")
    if (!canvas) return

    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = `${lot.lotId}-qr.png`
    link.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lot.lotId}</DialogTitle>
          <DialogDescription>
            Vue détaillée du lot avec QR, historique et validations des acteurs.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d’ensemble</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
            {[
              "COOPERATIVE",
              "EXPORTATEUR",
              "TRANSFORMATEUR",
              "MINISTERE",
            ].includes(activeRole || "") ? (
              <TabsTrigger value="timeline">
                Historique ({timeline.length})
              </TabsTrigger>
            ) : null}
            <TabsTrigger value="actions">Actions</TabsTrigger>
            {showComplianceTab ? (
              <TabsTrigger value="conformite">Conformité</TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Informations principales
                  </CardTitle>
                  <CardDescription>
                    Données de production et de collecte
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Espèce</p>
                    <p className="font-semibold">
                      {(lot as any).espece || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Poids</p>
                    <p className="font-semibold">
                      {(lot as any).poidsKg || (lot as any).poids_kg || 0} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Région</p>
                    <p className="font-semibold">
                      {(lot as any).region || (lot as any).espece || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Coopérative</p>
                    <p className="font-semibold">
                      {(lot as any).coopName ||
                        (lot as any).coopId ||
                        (lot as any).coop_name ||
                        "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GPS</p>
                    <p className="font-semibold">
                      {lot.gps
                        ? Array.isArray(lot.gps) && lot.gps.length > 0
                          ? `${lot.gps[0].latitude?.toFixed(4) || "0"}, ${lot.gps[0].longitude?.toFixed(4) || "0"}`
                          : (lot.gps as any).latitude
                            ? `${(lot.gps as any).latitude?.toFixed(4) || "0"}, ${(lot.gps as any).longitude?.toFixed(4) || "0"}`
                            : "—"
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Date collecte
                    </p>
                    <p className="font-semibold">
                      {(lot as any).dateCollecte ||
                      (lot as any).dateCreation ||
                      (lot as any).updatedAt
                        ? new Date(
                            (lot as any).dateCollecte ||
                              (lot as any).dateCreation ||
                              (lot as any).updatedAt
                          ).toLocaleDateString("fr-FR")
                        : "—"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">État du lot</CardTitle>
                  <CardDescription>
                    Statut métier et synchronisation hors chaîne
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge
                    className={statusLabels[lot.statut]?.color || "bg-gray-100"}
                  >
                    {translateStatus(lot.statut)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Synchronisation:{" "}
                    {translateStatus((lot as any).syncStatus || "synced")}
                  </p>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Créé par</p>
                      <p className="font-semibold">
                        {(lot as any).createdBy ||
                          (lot as any).ownerId ||
                          (lot as any).farmerId ||
                          "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Créé le</p>
                      <p className="font-semibold">
                        {new Date(
                          (lot as any).createdAt ||
                            (lot as any).dateCreation ||
                            (lot as any).dateCollecte ||
                            Date.now()
                        ).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mis à jour</p>
                      <p className="font-semibold">
                        {new Date(
                          (lot as any).updatedAt ||
                            (lot as any).createdAt ||
                            (lot as any).dateCreation ||
                            Date.now()
                        ).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Photos</p>
                      <p className="font-semibold">
                        {((lot as any).photoUrls || []).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isGroupLot ? (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">
                    Groupement coopératif
                  </CardTitle>
                  <CardDescription>
                    Le groupement est traité comme un lot maître pour la suite
                    de la chaîne.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Lot maître</Badge>
                    <Badge variant="outline">
                      {declaredSourceLots.length} lots sources
                    </Badge>
                    {lot.groupName ? <Badge>{lot.groupName}</Badge> : null}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Lots du groupement
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {declaredSourceLots.length > 0 ? (
                        declaredSourceLots.map((sourceLot) => (
                          <Badge
                            key={sourceLot}
                            variant="secondary"
                            className="rounded-full"
                          >
                            {sourceLot}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Aucun lot source renseigné sur ce groupement.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lots sources</CardTitle>
                  <CardDescription>
                    Conservation de la traçabilité des lots regroupés
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sourceLots.length > 0 ? (
                    sourceLots.map((sourceLot) => (
                      <Badge
                        key={sourceLot}
                        variant="secondary"
                        className="rounded-full"
                      >
                        {sourceLot}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Aucun lot source enregistré pour le moment.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Signatures</CardTitle>
                  <CardDescription>
                    Acteurs ayant signé ou validé les étapes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {signedBy.length > 0 ? (
                    signedBy.map((actorId) => (
                      <div
                        key={actorId}
                        className="rounded-xl border bg-background/80 px-3 py-2 text-sm"
                      >
                        {getSignatureLabel(actorId)}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Aucune signature enregistrée.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Documents</CardTitle>
                  <CardDescription>
                    Pièces justificatives liées au lot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {documents.length > 0 ? (
                    documents.map((document) => (
                      <div
                        key={document}
                        className="rounded-xl border bg-background/80 px-3 py-2 text-sm"
                      >
                        {document}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Aucun document joint.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="mt-4">
            <div className="grid gap-4 md:grid-cols-[320px_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <QrCode className="h-4 w-4" />
                    QR du lot
                  </CardTitle>
                  <CardDescription>
                    À scanner pour ouvrir le lot dans le système.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    ref={qrBoxRef}
                    className="rounded-2xl border bg-white p-4"
                  >
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
                  <div className="flex gap-2">
                    <Button
                      onClick={copyLotId}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4" />
                      {copyLabel}
                    </Button>
                    <Button
                      onClick={downloadQRCode}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Informations de scan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Valeur encodée
                    </p>
                    <p className="rounded-xl bg-muted p-3 font-mono text-sm break-all">
                      {qrValue}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Usage</p>
                    <p className="text-sm">
                      Le QR ouvre l’historique complet du lot et permet de
                      vérifier la chaîne de validation de chaque acteur.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {[
            "COOPERATIVE",
            "EXPORTATEUR",
            "TRANSFORMATEUR",
            "MINISTERE",
          ].includes(activeRole || "") ? (
            <TabsContent value="timeline" className="mt-4">
              <LotWorkflowTimeline lot={lot} timeline={timeline} />
            </TabsContent>
          ) : null}

          <TabsContent value="actions" className="mt-4 space-y-3">
            <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
              {activeRole ? (
                <>
                  <span className="font-medium text-foreground">
                    {activeRole}.
                  </span>{" "}
                  {timeline.length > 0
                    ? "L’historique est déjà alimenté, et seules les actions encore ouvertes restent visibles dans le panneau ci-dessous."
                    : "Aucun évènement n’est encore historisé sur ce lot."}
                </>
              ) : (
                "Connectez-vous pour voir les actions disponibles sur ce lot."
              )}
            </div>
            {isGroupLot ? (
              <Card className="border-dashed">
                <CardContent className="space-y-2 pt-6">
                  <p className="text-sm font-medium">
                    Traçabilité du groupement
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Les actions du lot maître sont répercutées sur ses lots
                    sources pour garder un historique cohérent.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {declaredSourceLots.map((sourceLot) => (
                      <Badge
                        key={sourceLot}
                        variant="secondary"
                        className="rounded-full"
                      >
                        {sourceLot}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
            <LotActionsPanel lot={lot} />
          </TabsContent>

          {showComplianceTab ? (
            <TabsContent value="conformite" className="mt-4 space-y-4">
              {serverEUDR ? (
                <EUDRReportView report={serverEUDR} isLoading={isLoadingEUDR} />
              ) : (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Fiche de conformité verrouillée
                    </CardTitle>
                    <CardDescription>
                      La fiche EUDR reste cachée tant que la confirmation n'est
                      pas approuvée sur la blockchain.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Le lot peut toujours être suivi dans l’historique général,
                      mais la fiche de conformité n’est visible qu’après
                      validation par l’exportateur.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ) : null}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
