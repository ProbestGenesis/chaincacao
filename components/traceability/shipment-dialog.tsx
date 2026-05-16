"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Ship, Globe, Calendar } from "lucide-react"
import type { ShipmentPayload } from "@/types/api-traceability"
import { useTraceability } from "@/hooks/useTraceability"

interface ShipmentDialogProps {
  lotHashes: string[]
  onSuccess?: () => void
}

type FormValues = {
  destination: string
  dateDepart: string
  dateArrivee: string
}

export function ShipmentDialog({ lotHashes, onSuccess }: ShipmentDialogProps) {
  const [open, setOpen] = useState(false)
  const { createShipment, isSubmitting } = useTraceability()
  const { register, handleSubmit, watch, reset } = useForm<FormValues>()

  const handleFormSubmit = async (values: FormValues) => {
    const payload: ShipmentPayload = {
      shipmentHash: `SHP-${Date.now()}`,
      lotHashes: lotHashes,
      exportateurId: "CURRENT_USER_ID",
      destination: values.destination,
      documentsHash: `DOC-${Math.random().toString(36).substring(7)}`,
      dateDepartPrevue: values.dateDepart,
      dateArriveePrevue: values.dateArrivee,
    }
    
    try {
      await createShipment(payload)
      reset()
      setOpen(false)
      onSuccess?.()
    } catch (e) {
      console.error("Shipment error:", e)
    }
  }

  const canSubmit = lotHashes.length > 0 && watch("destination") && watch("dateDepart")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" className="gap-1.5" disabled={lotHashes.length === 0}>
          <Ship className="size-4" />
          Créer Expédition ({lotHashes.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Expédition Internationale</DialogTitle>
          <DialogDescription>
            Préparez l'envoi des lots transformés vers le marché international (EUDR compliant).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="destination">Destination (Pays/Port) *</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="destination"
                placeholder="Ex: Port d'Anvers, Belgique"
                className="pl-9"
                {...register("destination", { required: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dateDepart">Départ prévu *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateDepart"
                  type="date"
                  className="pl-9"
                  {...register("dateDepart", { required: true })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dateArrivee">Arrivée estimée</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateArrivee"
                  type="date"
                  className="pl-9"
                  {...register("dateArrivee")}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-100 text-xs text-emerald-800">
            <strong>Note :</strong> L'expédition lie automatiquement les certificats de non-déforestation (EUDR) aux lots sélectionnés pour les autorités douanières.
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !canSubmit}>
              {isSubmitting ? "Enregistrement..." : "Confirmer l'expédition"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
