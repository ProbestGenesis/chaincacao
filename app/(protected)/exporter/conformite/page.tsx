"use client"

import { useLotsStore } from "@/store/lots"
import { useEUDRStore } from "@/store/eudr"
import { useUser } from "@/context/useUser"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ConformitePage() {
  const { user } = useUser()
  const { getLotById, getLotsInStatus } = useLotsStore()
  const { confirmEUDR } = useEUDRStore()
  const [lotId, setLotId] = useState("")
  const [selectedLot, setSelectedLot] = useState<any>(null)
  const [submitted, setSubmitted] = useState(false)

  const readyLots = getLotsInStatus("transformed")

  const handleSearch = () => {
    const lot = getLotById(lotId)
    setSelectedLot(lot)
    setSubmitted(false)
  }

  const handleConfirmEUDR = () => {
    if (!selectedLot || !user) return

    confirmEUDR({
      shipmentId: `SHIP-${Date.now()}`,
      lotIds: [selectedLot.lotId],
      confirmedBy: user.userId,
      status: "confirmed",
      eudrStatus: "conformante",
      diligenceDate: new Date().toISOString(),
      countryRisk: "low",
      esgScore: "98",
    })

    setSubmitted(true)
    setLotId("")
    setSelectedLot(null)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vérification EUDR</h1>
          <p className="text-muted-foreground mt-1">Confirmez la conformité EUDR des lots</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/exporter" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-900 font-medium">
            ✓ Conformité EUDR confirmée avec succès
          </p>
        </div>
      )}

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher un Lot</CardTitle>
          <CardDescription>Entrez l'ID du lot à vérifier</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="lotId">ID du Lot</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="lotId"
                  placeholder="LOT-2024-001"
                  value={lotId}
                  onChange={(e) => setLotId(e.target.value)}
                />
                <Button onClick={handleSearch}>Rechercher</Button>
              </div>
            </Field>
          </FieldGroup>

          {selectedLot && (
            <div className="border rounded-lg p-4 bg-blue-50 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID Lot</p>
                  <p className="font-semibold">{selectedLot.lotId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Poids</p>
                  <p className="font-semibold">{selectedLot.poidsKg} kg</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Région</p>
                  <p className="font-semibold">{selectedLot.region}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Espèce</p>
                  <p className="font-semibold">{selectedLot.espece}</p>
                </div>
              </div>

              <Button onClick={handleConfirmEUDR} className="w-full">
                Confirmer la Conformité EUDR
              </Button>
            </div>
          )}

          {lotId && !selectedLot && (
            <div className="border rounded-lg p-4 bg-orange-50">
              <p className="text-orange-900">Lot non trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ready Lots */}
      <Card>
        <CardHeader>
          <CardTitle>Lots Prêts à Vérifier</CardTitle>
          <CardDescription>{readyLots.length} lots disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          {readyLots.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {readyLots.map((lot) => (
                <button
                  key={lot.lotId}
                  onClick={() => {
                    setLotId(lot.lotId)
                    setSelectedLot(lot)
                  }}
                  className="w-full text-left border rounded p-3 hover:bg-muted transition-colors"
                >
                  <p className="font-mono text-sm font-semibold">{lot.lotId}</p>
                  <p className="text-xs text-muted-foreground">
                    {lot.poidsKg} kg • {lot.region} • {lot.espece}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucun lot prêt</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
