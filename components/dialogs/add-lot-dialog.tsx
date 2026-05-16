"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LotForm } from "@/components/forms/lot-form"
import { useLots } from "@/hooks/useLots"
import { useUser } from "@/context/useUser"
import { getRoleRoute } from "@/lib/navigation/role-config"

export function AddLotDialog() {
  const [open, setOpen] = useState(false)
  const { createLot, isSubmitting } = useLots()
  const { user, activeRole } = useUser()
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl">
          <Plus className="size-4" />
          Ajouter un lot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Nouveau lot</DialogTitle>
          <DialogDescription>
            Enregistre rapidement un lot avec géolocalisation, poids et photos.
          </DialogDescription>
        </DialogHeader>
        <LotForm
          onSubmit={async (values) => {
            if (!user) return
            try {
              await createLot({
                espece: values.espece,
                poidsKg: values.poidsKg,
                dateCollecte: values.dateCollecte.toISOString().split("T")[0],
                parcelleId: values.parcelleId,
                coopId: values.coopId ?? "",
                photos: [] // Pour l'instant on ne gère pas les uploads réels ici, ou on envoie une liste vide
              })
              setOpen(false)
              router.push(getRoleRoute(activeRole))
            } catch (error) {
              console.error("Create lot error:", error)
            }
          }}
          submitLabel={isSubmitting ? "Création..." : "Enregistrer le lot"}
        />
      </DialogContent>
    </Dialog>
  )
}
