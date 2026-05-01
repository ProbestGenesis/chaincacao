"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { SelectedLotCompliance } from "@/components/exporter/selected-lot-compliance"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEUDRStore } from "@/store/eudr"
import { useLotActionsStore } from "@/store/lot-actions"
import { useLotsStore } from "@/store/lots"

function extractStringValues(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

export default function ConformiteLotPage() {
  const params = useParams()
  const { getLotById } = useLotsStore()
  const { getLotTimeline } = useLotActionsStore()
  const { getEUDRForLot } = useEUDRStore()

  const lotId = params.lotId as string
  const lot = getLotById(lotId)
  const selectedEudrRecord = lot ? getEUDRForLot(lot.lotId) ?? null : null
  const timeline = lot ? getLotTimeline(lot.lotId) : []

  const documents = timeline
    .flatMap((entry) => {
      const metadata = entry.metadata
      if (!metadata || typeof metadata !== "object") return []

      const record = metadata as Record<string, unknown>
      return [
        ...(typeof record.document === "string" ? [record.document] : []),
        ...extractStringValues(record.documents),
        ...extractStringValues(record.media),
      ]
    })
    .filter(Boolean)

  const sourceLots = Array.from(
    new Set(
      timeline
        .flatMap((entry) => {
          const metadata = entry.metadata
          if (!metadata || typeof metadata !== "object") return []

          const record = metadata as Record<string, unknown>
          return extractStringValues(record.sourceLots)
        })
        .filter(Boolean)
    )
  )

  const complianceScore = selectedEudrRecord?.esgScore ?? "98"
  const risk = selectedEudrRecord?.countryRisk ?? "low"
  const eudrStatus = selectedEudrRecord?.eudrStatus ?? "en cours"

  const checklist = [
    { label: "Cert. phytosanitaire", status: "validé" },
    { label: "Déclaration d'origine", status: "validé" },
    { label: "Conformité fiscale", status: "à compléter" },
  ]

  const specItems = [
    { label: "Poids net", value: `${lot?.poidsKg ?? 0} kg` },
    { label: "Humidité", value: "7,2%" },
    { label: "Teneur en matière grasse", value: "54,1%" },
    { label: "Taux de défauts", value: "1,2%" },
  ]

  if (!lot) {
    return (
      <div className="space-y-4 p-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/exporter/conformite">
            <ArrowLeft className="h-4 w-4" />
            Retour à la conformité
          </Link>
        </Button>
        <p className="text-muted-foreground">Lot non trouvé</p>
      </div>
    )
  }

  if (!selectedEudrRecord) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge variant="secondary" className="rounded-full">
              Conformité du lot verrouillée
            </Badge>
            <h1 className="mt-2 text-3xl font-bold">{lot.lotId}</h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              La fiche complète de conformité n&apos;est visible qu&apos;après
              approbation EUDR.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/exporter/conformite">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Confirmer la conformité EUDR</CardTitle>
            <CardDescription>
              Sélectionnez ce lot depuis la page de vérification pour activer le
              bouton de confirmation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Aucune fiche de conformité n&apos;est encore disponible pour ce
              lot.
            </p>
            <Button asChild className="rounded-full">
              <Link href={`/exporter/conformite?lotId=${encodeURIComponent(lot.lotId)}`}>
                Confirmer la conformité EUDR
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="secondary" className="rounded-full">
            Conformité du lot
          </Badge>
          <h1 className="mt-2 text-3xl font-bold">{lot.lotId}</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Vue détaillée de la conformité, avec historique, preuves et pièces
            associées au lot.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/exporter/conformite">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Résumé conformité</CardTitle>
          <CardDescription>
            Les détails ci-dessous ne s’ouvrent que depuis la fiche du lot.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SelectedLotCompliance
            lot={lot}
            timeline={timeline}
            complianceScore={complianceScore}
            risk={risk}
            eudrStatus={eudrStatus}
            documents={documents}
            sourceLots={sourceLots}
            specItems={specItems}
            checklist={checklist}
          />
        </CardContent>
      </Card>
    </div>
  )
}
