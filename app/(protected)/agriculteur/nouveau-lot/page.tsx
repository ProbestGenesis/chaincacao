"use client"

import { useRouter } from "next/navigation"
import { useUser } from "@/context/useUser"
import { useLotsStore } from "@/store/lots"
import { LotForm } from "@/components/forms/lot-form"
import { Card } from "@/components/ui/card"
import type { LotFormData } from "@/lib/schemas/lot"

export default function NouveauLotPage() {
  const router = useRouter()
  const { user } = useUser()
  const { addLot } = useLotsStore()

  const handleSubmit = async (data: LotFormData) => {
    if (!user) return

    try {
      addLot({
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

      router.push("/agriculteur/lots")
    } catch (error) {
      console.error("Error creating lot:", error)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Ajouter un Nouveau Lot</h1>
        <p className="text-muted-foreground mt-1">Remplissez les informations de votre lot agricole</p>
      </div>

      <Card className="p-6">
        <LotForm
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
