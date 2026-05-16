"use client"

import { useRouter } from "next/navigation"
import { useUser } from "@/context/useUser"
import { useLots } from "@/hooks/useLots"
import { useLotActionsStore } from "@/store/lot-actions"
import { EnhancedLotForm } from "@/components/forms/enhanced-lot-form"
import { Card } from "@/components/ui/card"
import type { LotFormData } from "@/lib/schemas/lot"

export default function NouveauLotPage() {
  const router = useRouter()
  const { user } = useUser()
  const { createLot, isSubmitting } = useLots()
  const { addAction } = useLotActionsStore()

  const handleSubmit = async (values: LotFormData, files: File[]) => {
    if (!user) return

    try {
      const lot = await createLot({
        parcelleId: values.parcelleId,
        espece: values.espece,
        poidsKg: values.poidsKg,
        dateCollecte: values.dateCollecte.toISOString().split("T")[0], // YYYY-MM-DD
        coopId: values.coopId,
        photos: files,
      })

      // Optionnel : Enregistrer une action locale pour l'UI immédiate si besoin
      addAction({
        lotId: lot.id || "temp",
        actor: "Agriculteur",
        actorName: user.nomAffiche,
        actorId: user.userId,
        action: "created",
        phase: "recolte",
        status: "draft",
        description: "Enregistrement de récolte créé avec succès sur la blockchain.",
        metadata: {
          parcelleId: values.parcelleId,
          photos: files.length,
        },
      })
      router.push(`/agriculteur/lots`)
    } catch (error) {
      console.error("Error creating lot:", error)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Ajouter un Nouveau Lot</h1>
        <p className="text-muted-foreground mt-1">Remplissez les informations de votre lot agricole et associez-le à l'une de vos parcelles.</p>
      </div>

      <Card className="p-6">
        <EnhancedLotForm
          onSubmit={handleSubmit}
          submitLabel="Créer le Lot"
          defaultValues={{
            espece: "",
            poidsKg: 0,
            parcelleId: "",
            coopId: user?.coopId || "",
            dateCollecte: new Date(),
          }}
        />
      </Card>
    </div>
  )
}
