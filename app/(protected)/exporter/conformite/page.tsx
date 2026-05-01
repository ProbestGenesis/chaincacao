"use client"

import { BadgeCheck, CircleDashed, Search, ShieldAlert } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { SelectedLotCompliance } from "@/components/exporter/selected-lot-compliance"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useUser } from "@/context/useUser"
import { useEUDRStore } from "@/store/eudr"
import { useLotActionsStore } from "@/store/lot-actions"
import { useLotsStore } from "@/store/lots"
import type { Lot } from "@/types/types"

export default function ConformitePage() {
  const { user } = useUser()
  const { lots, getLotById, updateLotStatus, updateLotSyncStatus } =
    useLotsStore()
  const { getLotTimeline, addAction } = useLotActionsStore()
  const { confirmEUDR, getEUDRByExporter } = useEUDRStore()

  const [searchValue, setSearchValue] = useState("")
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const readyLots = useMemo(
    () =>
      lots.filter((lot) =>
        ["transformed", "verified", "pending"].includes(lot.statut)
      ),
    [lots]
  )

  const exporterRecords = user ? getEUDRByExporter(user.userId) : []
  const latestRecord = exporterRecords[exporterRecords.length - 1] ?? null
  const selectedLot = selectedLotId ? (getLotById(selectedLotId) ?? null) : null
  const selectedEudrRecord = selectedLot
    ? (exporterRecords.find((record) =>
        record.lotIds.includes(selectedLot.lotId)
      ) ?? null)
    : null

  const selectedTimeline = selectedLot ? getLotTimeline(selectedLot.lotId) : []
  const stringValues = (value: unknown) =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : []

  const selectedDocuments = selectedTimeline
    .flatMap((entry) => {
      const metadata = entry.metadata
      if (!metadata || typeof metadata !== "object") return []

      const record = metadata as Record<string, unknown>
      const docs = [
        ...(typeof record.document === "string" ? [record.document] : []),
        ...stringValues(record.documents),
        ...stringValues(record.media),
      ]

      return docs
    })
    .filter(Boolean)

  const selectedSourceLots = Array.from(
    new Set(
      selectedTimeline
        .flatMap((entry) => {
          const metadata = entry.metadata
          if (!metadata || typeof metadata !== "object") return []

          const record = metadata as Record<string, unknown>
          return stringValues(record.sourceLots)
        })
        .filter(Boolean)
    )
  )

  const selectedComplianceScore = selectedEudrRecord?.esgScore ?? "98"
  const selectedRisk = selectedEudrRecord?.countryRisk ?? "low"
  const selectedEudrStatus = selectedEudrRecord?.eudrStatus ?? "en cours"

  const metrics = [
    {
      label: "Taux de conformité",
      value:
        exporterRecords.length > 0
          ? `${Math.round(
              (exporterRecords.filter((record) => record.status === "confirmed")
                .length /
                exporterRecords.length) *
                100
            )}%`
          : "0%",
      note: "confirmations EUDR",
    },
    {
      label: "Lots vérifiés",
      value: exporterRecords.length,
      note: "dans le portefeuille export",
    },
    {
      label: "À traiter",
      value: readyLots.filter((lot) => lot.statut !== "exported").length,
      note: "lots prêts à contrôler",
    },
  ]

  const complianceChecklist = [
    { label: "Cert. phytosanitaire", status: "validé" },
    { label: "Déclaration d'origine", status: "validé" },
    { label: "Conformité fiscale", status: "à compléter" },
  ]

  const lotSpecs = [
    { label: "Poids net", value: `${selectedLot?.poidsKg ?? 0} kg` },
    { label: "Humidité", value: "7,2%" },
    { label: "Teneur en matière grasse", value: "54,1%" },
    { label: "Taux de défauts", value: "1,2%" },
  ]

  const handleSearch = () => {
    const lot = getLotById(searchValue.trim())
    setSelectedLotId(lot?.lotId ?? null)
    setStatusMessage(lot ? null : "Lot non trouvé")
    setSubmitted(false)
  }

  const handleSelectLot = (lot: Lot) => {
    setSearchValue(lot.lotId)
    setSelectedLotId(lot.lotId)
    setStatusMessage(null)
    setSubmitted(false)
  }

  useEffect(() => {
    const lotId = searchParams.get("lotId")
    if (!lotId) return

    const lot = getLotById(lotId)
    if (lot) {
      setSearchValue(lot.lotId)
      setSelectedLotId(lot.lotId)
      setStatusMessage(null)
      setSubmitted(false)
    }
  }, [getLotById, searchParams])

  const handleConfirmEUDR = () => {
    if (!selectedLot || !user) return

    const shipmentId = `EUDR-${selectedLot.lotId}-${Date.now()}`

    confirmEUDR({
      shipmentId,
      lotIds: [selectedLot.lotId],
      confirmedBy: user.userId,
      status: "confirmed",
      eudrStatus: "conformante",
      diligenceDate: new Date().toISOString(),
      countryRisk: "low",
      esgScore: "98",
    })

    addAction({
      lotId: selectedLot.lotId,
      actor: "Exporter",
      actorName: user.nomAffiche,
      actorId: user.userId,
      action: "verified",
      phase: "controle",
      status: "exported",
      description:
        "Vérification EUDR confirmée et dossier prêt pour expédition.",
      metadata: {
        shipmentId,
        lotId: selectedLot.lotId,
        eudrStatus: "conformante",
        documents: ["rapport-eudr.pdf", "liste-pieces-export.pdf"],
      },
    })

    updateLotStatus(selectedLot.lotId, "exported")
    updateLotSyncStatus(selectedLot.lotId, "synced")

    setSubmitted(true)
    setStatusMessage(`Conformité confirmée pour ${selectedLot.lotId}`)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <main className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Dashboard &gt; Vérification
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Vérification de Lot
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            Scannez un QR ou entrez un identifiant pour consulter l’historique
            complet et confirmer la conformité EUDR avant expédition.
          </p>
        </div>

        {submitted && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <p className="font-medium">Conformité EUDR confirmée avec succès</p>
            <p className="text-sm">
              Les changements ont été enregistrés dans les stores de lots, de
              conformité et d’historique.
            </p>
          </div>
        )}

        {statusMessage && !submitted && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <p className="font-medium">{statusMessage}</p>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recherche d'identifiant</CardTitle>
              <CardDescription>
                Saisissez un ID de lot ou choisissez un lot prêt à vérifier.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="text-xs font-semibold tracking-[0.18em] text-amber-700 uppercase">
                  Batch ID
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Ex: LOT-2024-001"
                    className="h-14 rounded-2xl bg-muted/40 text-base"
                  />
                  <Button
                    onClick={handleSearch}
                    className="h-14 rounded-2xl px-6"
                  >
                    <Search className="h-4 w-4" />
                    Vérifier
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  ou
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="rounded-[1.75rem] border border-dashed p-6 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <CircleDashed className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">
                  Prêt pour l'identification
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Saisissez un identifiant ci-dessus. Le système affichera
                  automatiquement les certificats d'origine, la géolocalisation
                  et la conformité liée au lot.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Lots prêts à vérifier</p>
                    <Badge variant="secondary">{readyLots.length}</Badge>
                  </div>
                  <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                    {readyLots.length > 0 ? (
                      readyLots.map((lot) => (
                        <button
                          key={lot.lotId}
                          type="button"
                          onClick={() => handleSelectLot(lot)}
                          className="w-full rounded-2xl border bg-background/80 p-3 text-left transition hover:border-primary/60 hover:bg-muted/40"
                        >
                          <p className="font-mono text-sm font-semibold">
                            {lot.lotId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lot.poidsKg} kg • {lot.region} • {lot.espece}
                          </p>
                        </button>
                      ))
                    ) : (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        Aucun lot prêt
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#3a1d18] bg-[#2f1713] text-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-white">Règlement EUDR</CardTitle>
              <CardDescription className="text-white/70">
                Vérifiez les coordonnées, l'historique et la non-déforestation
                avant de valider.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-white/10">
                    <ShieldAlert className="h-5 w-5 text-amber-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      Dernière vérification
                    </p>
                    <p className="text-xs text-white/70">
                      {latestRecord
                        ? `${latestRecord.shipmentId} validé avec succès`
                        : "Aucune vérification encore enregistrée"}
                    </p>
                  </div>
                </div>
                {latestRecord && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                    <p>Score ESG: {latestRecord.esgScore}</p>
                    <p>Risque pays: {latestRecord.countryRisk}</p>
                    <p>Statut: {latestRecord.eudrStatus}</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                Assurez-vous que chaque lot est accompagné de coordonnées GPS
                précises, d’un historique exploitable et de documents de
                conformité avant expédition.
              </div>

              <Button
                onClick={handleConfirmEUDR}
                disabled={!selectedLot}
                className="h-14 w-full rounded-2xl bg-amber-400 text-[#2f1713] hover:bg-amber-300"
              >
                <BadgeCheck className="h-4 w-4" />
                Confirmer la conformité EUDR
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="min-h-[420px] border-dashed">
            <CardHeader>
              <CardTitle>Prêt pour l'identification</CardTitle>
              <CardDescription>
                Le lot sélectionné apparaîtra ici avec son historique et ses
                preuves.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedLot ? (
                <SelectedLotCompliance
                  lot={selectedLot}
                  timeline={selectedTimeline}
                  complianceScore={selectedComplianceScore}
                  risk={selectedRisk}
                  eudrStatus={selectedEudrStatus}
                  documents={selectedDocuments}
                  sourceLots={selectedSourceLots}
                  specItems={lotSpecs}
                  checklist={complianceChecklist}
                  onShowMessage={setStatusMessage}
                />
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed bg-muted/10 p-8 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <CircleDashed className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold">
                    Prêt pour l'identification
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Choisissez un lot ou saisissez un ID pour afficher
                    automatiquement les certificats d'origine, les cartes de
                    géolocalisation et le score de durabilité.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Vue conformité</CardTitle>
                <CardDescription>
                  Indicateurs synchronisés avec le store
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="rounded-2xl bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">
                    Lots vérifiés (30j)
                  </p>
                  <p className="text-2xl font-bold">{exporterRecords.length}</p>
                </div>
                <div className="rounded-2xl bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">
                    Alertes en attente
                  </p>
                  <p className="text-2xl font-bold text-rose-600">
                    {
                      readyLots.filter((lot) => lot.statut !== "exported")
                        .length
                    }
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">
                    Dernier lot confirmé
                  </p>
                  <p className="text-sm font-medium">
                    {latestRecord?.lotIds?.[0] ?? "Aucun"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Lots exportables</CardTitle>
                <CardDescription>
                  Choisissez un lot pour le précontrôle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {readyLots.slice(0, 6).map((lot) => (
                  <button
                    key={lot.lotId}
                    type="button"
                    onClick={() => handleSelectLot(lot)}
                    className="w-full rounded-2xl border bg-background/80 p-3 text-left transition hover:border-primary/60 hover:bg-muted/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{lot.lotId}</p>
                        <p className="text-xs text-muted-foreground">
                          {lot.espece} • {lot.poidsKg} kg
                        </p>
                      </div>
                      <Badge
                        variant={
                          lot.statut === "exported" ? "default" : "secondary"
                        }
                      >
                        {lot.statut}
                      </Badge>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <Card key={metric.label} className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metric.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {metric.note}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
