"use client"

import { BadgeCheck, Search, ShieldAlert } from "lucide-react"
import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

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
import { getLotLineageIds } from "@/lib/lot-lineage"

export default function ConformitePage() {
  const searchParams = useSearchParams()
  const { user } = useUser()
  const { lots, getLotById, updateLotStatus, updateLotSyncStatus } =
    useLotsStore()
  const { confirmEUDR, getEUDRByExporter } = useEUDRStore()
  const { addAction, hasLotAction } = useLotActionsStore()

  const initialLotId = searchParams.get("lotId")?.trim() ?? ""
  const initialSelectedLot = useMemo(
    () => getLotById(initialLotId),
    [getLotById, initialLotId]
  )

  const [searchValue, setSearchValue] = useState(initialLotId)
  const [statusMessage, setStatusMessage] = useState<string | null>(() =>
    initialSelectedLot
      ? hasLotAction(initialSelectedLot.lotId, "verified", "controle")
        ? `La conformité est déjà validée pour ${initialSelectedLot.lotId}`
        : `Lot sélectionné depuis la fiche de conformité: vous pouvez confirmer l’EUDR.`
      : null
  )
  const selectedLot = useMemo(
    () => getLotById(searchValue.trim()),
    [getLotById, searchValue]
  )

  const readyLots = useMemo(
    () =>
      lots.filter((lot) =>
        ["transformed", "verified", "pending"].includes(lot.statut) &&
        !hasLotAction(lot.lotId, "verified", "controle")
      ),
    [hasLotAction, lots]
  )

  const exporterRecords = user ? getEUDRByExporter(user.userId) : []
  const latestRecord = exporterRecords[exporterRecords.length - 1] ?? null

  const metrics = [
    {
      label: "Taux de conformité",
      value:
        exporterRecords.length > 0
          ? `${Math.round(
              (exporterRecords.filter((record) => record.status === "confirmed")
                .length / exporterRecords.length) *
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

  const handleSearch = () => {
    const lot = selectedLot
    setStatusMessage(
      lot
        ? hasLotAction(lot.lotId, "verified", "controle")
          ? `La conformité est déjà validée pour ${lot.lotId}`
          : `Lot trouvé: le bouton de confirmation est maintenant disponible.`
        : "Lot non trouvé"
    )
  }

  const handleSelectLot = (lotId: string) => {
    setSearchValue(lotId)
    setStatusMessage(
      hasLotAction(lotId, "verified", "controle")
        ? `La conformité est déjà validée pour ${lotId}`
        : `Lot sélectionné: vous pouvez maintenant confirmer la conformité EUDR.`
    )
  }

  const handleConfirmEUDR = () => {
    const lot = selectedLot
    if (!lot || !user) return

    if (hasLotAction(lot.lotId, "verified", "controle")) {
      setStatusMessage(`La conformité a déjà été validée pour ${lot.lotId}`)
      return
    }

    const shipmentId = `EUDR-${lot.lotId}-${Date.now()}`
    const lineageLotIds = getLotLineageIds(lot)

    confirmEUDR({
      shipmentId,
      lotIds: lineageLotIds,
      confirmedBy: user.userId,
      status: "confirmed",
      eudrStatus: "conformante",
      diligenceDate: new Date().toISOString(),
      countryRisk: "low",
      esgScore: "98",
    })

    lineageLotIds.forEach((lotId) => {
      addAction({
        lotId,
        actor: "Exporter",
        actorName: user.nomAffiche,
        actorId: user.userId,
        action: "verified",
        phase: "controle",
        status: "exported",
        description:
          lotId === lot.lotId
            ? "Vérification EUDR confirmée et dossier prêt pour expédition."
            : `Confirmation EUDR héritée du groupement ${lot.lotId}.`,
        metadata: {
          shipmentId,
          lotId,
          groupLotId: lot.isGroup ? lot.lotId : undefined,
          confirmedLotIds: lineageLotIds,
          eudrStatus: "conformante",
          documents: ["rapport-eudr.pdf", "liste-pieces-export.pdf"],
        },
      })
    })

    updateLotStatus(lot.lotId, "exported")
    updateLotSyncStatus(lot.lotId, "synced")

    setStatusMessage(`Conformité confirmée pour ${lot.lotId}`)
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
            Scannez un QR ou entrez un identifiant pour retrouver un lot, puis
            sélectionnez-le pour activer le bouton de confirmation EUDR.
          </p>
        </div>

        {statusMessage && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <p className="font-medium">{statusMessage}</p>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recherche d&apos;identifiant</CardTitle>
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

              <div className="grid gap-3">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Lots prêts à vérifier</p>
                    <Badge variant="secondary">{readyLots.length}</Badge>
                  </div>
                  <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                    {readyLots.length > 0 ? (
                      readyLots.map((lot) => (
                        <Button
                          type="button"
                          key={lot.lotId}
                          variant="outline"
                          onClick={() => handleSelectLot(lot.lotId)}
                          className="h-auto w-full flex-col items-start rounded-2xl border bg-background/80 p-3 text-left transition hover:border-primary/60 hover:bg-muted/40"
                        >
                          <p className="font-mono text-sm font-semibold">
                            {lot.lotId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lot.poidsKg} kg • {lot.region} • {lot.espece}
                          </p>
                          <p className="mt-2 text-xs font-medium text-primary">
                            Sélectionner pour confirmer
                          </p>
                        </Button>
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
                Vérifiez les coordonnées, l&apos;historique et la non-déforestation
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

              {selectedLot ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                  <p className="font-medium text-white">
                    Lot sélectionné: {selectedLot.lotId}
                  </p>
                  <p className="mt-1">
                    {selectedLot.poidsKg} kg • {selectedLot.region} •{" "}
                    {selectedLot.espece}
                  </p>
                </div>
              ) : null}

              <Button
                onClick={handleConfirmEUDR}
                disabled={
                  !selectedLot ||
                  hasLotAction(selectedLot.lotId, "verified", "controle")
                }
                className="h-14 w-full rounded-2xl bg-amber-400 text-[#2f1713] hover:bg-amber-300"
              >
                <BadgeCheck className="h-4 w-4" />
                Confirmer la conformité EUDR
              </Button>
            </CardContent>
          </Card>
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
