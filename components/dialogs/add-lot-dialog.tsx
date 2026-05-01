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
import { useLotsStore } from "@/store/lots"
import { useUser } from "@/context/useUser"
import { getRoleRoute } from "@/lib/navigation/role-config"

export function AddLotDialog() {
  const [open, setOpen] = useState(false)
  const addLot = useLotsStore((state) => state.addLot)
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
            addLot({
              farmerId: user.userId,
              photoUrls: values.photoUrls ?? [],
              photoHashes: [],
              gps: {
                latitude: values.gpsLatitude,
                longitude: values.gpsLongitude,
              },
              region: values.region,
              poidsKg: values.poidsKg,
              espece: values.espece,
              dateCollecte: values.dateCollecte.getTime(),
              coopName: values.coopName ?? "",
              statut: "draft",
              syncStatus: "pending",
              createdBy: user.userId,
            })
            setOpen(false)
            router.push(getRoleRoute(activeRole))
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
