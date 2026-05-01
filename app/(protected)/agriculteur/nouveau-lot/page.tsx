"use client"

import { useRouter } from "next/navigation"
import { useUser } from "@/context/useUser"
import { useLotsStore } from "@/store/lots"
import { useLotActionsStore } from "@/store/lot-actions"
import { EnhancedLotForm } from "@/components/forms/enhanced-lot-form"
import { Card } from "@/components/ui/card"
import type { LotFormData } from "@/lib/schemas/lot"

export default function NouveauLotPage() {
  const router = useRouter()
  const { user } = useUser()
  const { addLot } = useLotsStore()
  const { addAction } = useLotActionsStore()

  const handleSubmit = async (data: LotFormData) => {
    if (!user) return

    try {
      const lot = addLot({
        farmerId: user.userId,
        photoUrls: data.photoUrls || [],
        photoHashes: [],
        gps: {
          latitude: data.gpsLatitude,
          longitude: data.gpsLongitude,
        },
        region: data.region,
        poidsKg: data.poidsKg,
        espece: data.espece,
        dateCollecte: data.dateCollecte.getTime(),
        coopName: data.coopName || "",
        statut: "draft",
        syncStatus: "pending",
        createdBy: user.userId,
      })

      addAction({
        lotId: lot.lotId,
        actor: "Agriculteur",
        actorName: user.nomAffiche,
        actorId: user.userId,
        action: "created",
        phase: "recolte",
        status: "draft",
        description:
          "Enregistrement de récolte créé depuis la parcelle avec GPS et photos.",
        metadata: {
          gps: lot.gps,
          region: lot.region,
          photos: lot.photoUrls.length,
        },
      })

      router.push(`/agriculteur/lots/${lot.lotId}`)
    } catch (error) {
      console.error("Error creating lot:", error)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Ajouter un Nouveau Lot</h1>
        <p className="text-muted-foreground mt-1">Remplissez les informations de votre lot agricole. La géolocalisation est détectée automatiquement.</p>
      </div>

      <Card className="p-6">
        <EnhancedLotForm
          onSubmit={handleSubmit}
          submitLabel="Créer le Lot"
          defaultValues={{
            espece: "",
            poidsKg: 0,
            region: "",
            coopName: "",
            gpsLatitude: 0,
            gpsLongitude: 0,
            dateCollecte: new Date(),
          }}
        />
      </Card>
    </div>
  )
}
