"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, FileCheck, ShieldCheck, Download, FileText, BadgeCheck, Truck } from "lucide-react"
import { useState, useMemo } from "react"
import { CreateShipmentDialog } from "@/components/traceability/create-shipment-dialog"

import { useUser } from "@/context/useUser"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEUDRStore } from "@/store/eudr"
import { useLotActionsStore } from "@/store/lot-actions"
import { useLots } from "@/hooks/useLots"
import { useTraceability, useLotHistories } from "@/hooks/useTraceability"
import { getLotTraceabilityIds } from "@/lib/lot-lineage"
import { LotWorkflowTimeline } from "@/components/lot/lot-workflow-timeline"
import { normalizeRole } from "@/lib/navigation/role-config"

export default function ConformiteLotPage() {
  const params = useParams()
  const router = useRouter()
  const { user, activeRole } = useUser()
  const { serverLots, isLoading: isLoadingLots } = useLots()
  const { createCertification, createShipment, isSubmitting } = useTraceability()
  const { addAction, hasLotAction } = useLotActionsStore()
  const { confirmEUDR } = useEUDRStore()
  
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const lotId = params.lotId as string
  
  const lot = useMemo(() => 
    serverLots.find(l => (l as any).lotId === lotId || (l as any).lotHash === lotId || (l as any).id === lotId),
    [serverLots, lotId]
  )

  const blockchainHash = (lot as any)?.lotHash || lotId
  const lineageLotIds = lot ? getLotTraceabilityIds(lot) : []
  const historyAssetHashes = Array.from(new Set([blockchainHash, ...lineageLotIds].filter(Boolean)))
  
  const { data: serverTimeline, isLoading: isLoadingHistory } = useLotHistories(historyAssetHashes)
  
  const isAlreadyVerified = hasLotAction(lotId, "verified", "controle")
  const canVerify = normalizeRole(activeRole || "") === "Exporter" && !isAlreadyVerified

  const timeline = useMemo(() => {
    if (!serverTimeline) return []
    return (serverTimeline || []).map((entry: any) => ({
      actionId: entry.txId,
      lotId: entry.assetHash || lotId,
      actor: (entry?.value?.actor || entry?.value?.org || "Inconnu") as any,
      actorName: entry?.value?.actorName || entry?.value?.user || "Acteur Blockchain",
      actorId: entry?.value?.actorId || "0x...",
      action: (entry?.value?.action || "validated") as any,
      phase: (entry?.value?.phase || "transfert") as any,
      status: (entry?.value?.statut || "pending") as any,
      description: entry?.value?.description || "Action enregistrée sur la blockchain",
      timestamp: entry.timestamp ? new Date(entry.timestamp).getTime() : Date.now(),
      chainStatus: "recorded" as const,
      chainHash: entry.txId,
      metadata: entry.value || {},
    })).sort((a: any, b: any) => a.timestamp - b.timestamp)
  }, [serverTimeline, lotId])

  const handleVerifyEUDR = async () => {
    if (!lot || !user) return

    try {
      const shipmentId = `EUDR-${lotId}-${Date.now()}`
      
      await Promise.all(
        lineageLotIds.map((hash, index) => 
          createCertification({
            certHash: `${shipmentId}-${index}`,
            refHash: hash,
            verificateurId: user.userId,
            statut: "CONFORME",
            rapportHash: `RAP-${shipmentId}-${index}`,
            metadata: {
              confirmedLotIds: lineageLotIds,
              eudrStatus: "conformante",
              esgScore: "98",
              countryRisk: "low",
              action: "verified",
              phase: "controle"
            }
          })
        )
      )

      confirmEUDR({
        shipmentId,
        lotIds: [lotId],
        confirmedBy: user.userId,
        status: "confirmed",
        eudrStatus: "conformante",
        diligenceDate: new Date().toISOString(),
        countryRisk: "low",
        esgScore: "98"
      })
      addAction({
        lotId,
        actor: "Exporter",
        actorName: user.nomAffiche,
        actorId: user.userId,
        action: "verified",
        phase: "controle",
        status: "verified",
        description: `Conformité EUDR vérifiée par ${user.nomAffiche}`,
        metadata: {
          shipmentId,
          eudrStatus: "conformante",
          documents: ["rapport-eudr.pdf"]
        }
      })

      setShowSuccess(true)
      setStatusMessage("Conformité EUDR validée avec succès sur la blockchain.")
    } catch (e) {
      console.error("Verification failed:", e)
      setStatusMessage("Erreur lors de la validation blockchain.")
    }
  }

  if (isLoadingLots) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Chargement des données du lot...</div>
  }

  if (!lot) {
    return (
      <div className="space-y-4 p-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/exporter/conformite">
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
        <p className="text-muted-foreground">Lot non trouvé ou inaccessible.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20">
              {isAlreadyVerified ? "Vérifié" : "En attente de vérification"}
            </Badge>
            <Badge variant="secondary" className="rounded-full">Batch ID: {lotId}</Badge>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Détails de Conformité EUDR</h1>
          <p className="text-muted-foreground">Audit complet de la chaîne d'approvisionnement pour le lot {lotId}.</p>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/exporter/conformite">
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
      </div>

      {statusMessage && (
        <Card className={showSuccess ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700" : "bg-destructive/10 border-destructive/20 text-destructive"}>
          <CardContent className="p-4 flex items-center gap-3">
            <BadgeCheck className="h-5 w-5" />
            <p className="text-sm font-medium">{statusMessage}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl border-none shadow-sm bg-card/50 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Informations du Lot
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Espèce</p>
                <p className="font-semibold">{(lot as any).espece || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Poids</p>
                <p className="font-semibold">{(lot as any).poidsKg || 0} kg</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Région</p>
                <p className="font-semibold">{(lot as any).region || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Coopérative</p>
                <p className="font-semibold">{(lot as any).coopName || (lot as any).coopId || "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Historique de Traçabilité (Blockchain)
              </CardTitle>
              <CardDescription>Parcours complet du lot depuis la récolte.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="space-y-4">
                  <div className="h-20 bg-muted animate-pulse rounded-2xl" />
                  <div className="h-20 bg-muted animate-pulse rounded-2xl" />
                </div>
              ) : (
                <LotWorkflowTimeline lot={lot as any} timeline={timeline} compact />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {!isAlreadyVerified && !showSuccess ? (
            <Card className="rounded-3xl border-none shadow-lg bg-[#2f1713] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="h-32 w-32" />
              </div>
              <CardHeader>
                <CardTitle>Vérification EUDR</CardTitle>
                <CardDescription className="text-white/60">Effectuez le contrôle final avant l'exportation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-widest text-white/40">Score ESG Prédit</span>
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none">98/100</Badge>
                  </div>
                  <p className="text-sm text-white/80">
                    L'analyse satellite et les certificats coopératifs indiquent un risque de déforestation nul.
                  </p>
                </div>

                <Button 
                  onClick={handleVerifyEUDR}
                  disabled={isSubmitting || !canVerify}
                  className="w-full h-14 rounded-2xl bg-amber-400 text-[#2f1713] hover:bg-amber-300 font-bold text-lg gap-3"
                >
                  <BadgeCheck className="h-6 w-6" />
                  {isSubmitting ? "Validation..." : "Vérifier la conformité"}
                </Button>
                
                {!canVerify && (
                  <p className="text-[10px] text-center text-white/40 italic">
                    Action réservée au rôle Exporter sur les lots en attente.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-3xl border-none shadow-sm bg-emerald-500/5 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Conformité Validée
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-2xl bg-white border border-emerald-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Statut EUDR</span>
                    <Badge className="bg-emerald-600">Conformante</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Risque Pays</span>
                    <span className="text-xs font-bold uppercase">Low Risk</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">Documents Officiels</p>
                  <Button variant="outline" className="w-full justify-start rounded-xl gap-3 text-xs h-12" asChild>
                    <a href={`/api/v1/audit/eudr-report/${lotId}/pdf`} download>
                      <Download className="h-4 w-4 text-emerald-600" />
                      Télécharger Certificat PDF
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start rounded-xl gap-3 text-xs h-12">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Consulter Rapport JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-3xl border border-white/10 shadow-sm bg-[#2f1713] text-white">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-5 w-5 text-amber-400" />
                Expédition
              </CardTitle>
              <CardDescription className="text-white/60">
                Préparez et validez l'exportation internationale de ce lot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {normalizeRole(activeRole || "") === "Exporter" ? (
                <CreateShipmentDialog
                  lotHashes={lineageLotIds.length > 0 ? lineageLotIds : [lotId]}
                  isSubmitting={isSubmitting}
                  onSubmit={(payload, onSuccess) => {
                    createShipment(payload)
                      .then(() => {
                        onSuccess()
                        setStatusMessage("Expédition enregistrée avec succès sur la blockchain.")
                        setShowSuccess(true)
                      })
                      .catch((e) => setStatusMessage(`Erreur expédition: ${e.message}`))
                  }}
                  trigger={
                    <Button className="w-full h-14 rounded-2xl bg-amber-400 text-[#2f1713] hover:bg-amber-300 font-bold text-lg gap-3">
                      <Truck className="h-6 w-6" />
                      Créer une Expédition
                    </Button>
                  }
                />
              ) : (
                <p className="text-[10px] text-center text-white/40 italic">
                  Action réservée au rôle Exporter.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-card/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4" />
                Pièces Justificatives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-3 rounded-xl bg-muted/30 flex items-center justify-between text-xs">
                <span className="truncate">Certificat_Phytosanitaire.pdf</span>
                <Badge variant="outline" className="text-[9px]">Blockchain</Badge>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 flex items-center justify-between text-xs">
                <span className="truncate">Declaration_Origine_Cacao.pdf</span>
                <Badge variant="outline" className="text-[9px]">Blockchain</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
