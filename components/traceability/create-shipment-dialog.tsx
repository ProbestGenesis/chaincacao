"use client"

import { useState, useEffect } from "react"
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
import { Truck, ShieldCheck } from "lucide-react"
import type { ShipmentPayload } from "@/types/api-traceability"
import { useUser } from "@/context/useUser"

interface CreateShipmentDialogProps {
  lotHashes: string[]
  isSubmitting: boolean
  onSubmit: (data: ShipmentPayload, onSuccess: () => void) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

type FormValues = {
  destination: string
  dateDepartPrevue: string
  dateArriveePrevue: string
}

export function CreateShipmentDialog({
  lotHashes,
  isSubmitting,
  onSubmit,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: CreateShipmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled && setControlledOpen ? setControlledOpen : setInternalOpen

  const [file, setFile] = useState<File | null>(null)
  const { user } = useUser()
  const { register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: {
      dateDepartPrevue: new Date().toISOString().split("T")[0],
      dateArriveePrevue: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  })

  const handleFormSubmit = (values: FormValues) => {
    if (!file || !user) return

    const payload: ShipmentPayload = {
      shipmentHash: `SHP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      lotHashes,
      exportateurId: user.blockchainId || user.userId,
      destination: values.destination,
      dateDepartPrevue: new Date(values.dateDepartPrevue).toISOString(),
      dateArriveePrevue: new Date(values.dateArriveePrevue).toISOString(),
      file,
    }

    onSubmit(payload, () => {
      reset()
      setFile(null)
      setOpen(false)
    })
  }

  const destination = watch("destination")
  const depart = watch("dateDepartPrevue")
  const arrivee = watch("dateArriveePrevue")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="default" className="gap-1.5" disabled={lotHashes.length === 0}>
            <Truck className="size-4" />
            Créer une Expédition {lotHashes.length > 0 ? `(${lotHashes.length})` : ""}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Créer une Expédition</DialogTitle>
          <DialogDescription>
            Enregistrez l'expédition sur la blockchain. Cette action est irréversible et génère un hash de shipment unique.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {/* Lots inclus */}
          <div className="space-y-1.5">
            <Label>Lots inclus dans l'expédition</Label>
            <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-2">
              {lotHashes.map((hash) => (
                <code key={hash} className="rounded bg-background px-2 py-0.5 text-[11px] font-mono">
                  {hash}
                </code>
              ))}
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-1.5">
            <Label htmlFor="destination">Pays / Port de destination *</Label>
            <Input
              id="destination"
              placeholder="Ex: Rotterdam, Pays-Bas"
              {...register("destination", { required: true })}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dateDepartPrevue">Date de départ *</Label>
              <Input
                id="dateDepartPrevue"
                type="date"
                {...register("dateDepartPrevue", { required: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dateArriveePrevue">Date d'arrivée prévue *</Label>
              <Input
                id="dateArriveePrevue"
                type="date"
                {...register("dateArriveePrevue", { required: true })}
              />
            </div>
          </div>

          {/* Document */}
          <div className="space-y-1.5">
            <Label htmlFor="bill-of-lading">Connaissement (Bill of Lading) *</Label>
            <Input
              id="bill-of-lading"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground">
              Le document doit être signé par le transporteur maritime. Format PDF, JPEG ou PNG.
            </p>
          </div>

          {/* Résumé */}
          {destination && depart && arrivee && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
              <p className="font-medium">Récapitulatif</p>
              <p className="text-muted-foreground">📦 {lotHashes.length} lot(s) · {destination}</p>
              <p className="text-muted-foreground">✈️ Départ : {new Date(depart).toLocaleDateString("fr-FR")} → Arrivée : {new Date(arrivee).toLocaleDateString("fr-FR")}</p>
            </div>
          )}

          {/* Avertissement */}
          <div className="flex gap-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
            <ShieldCheck className="size-5 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-800">
              En confirmant, vous certifiez que les lots sont conformes EUDR, prêts à l'export et accompagnés de tous les documents douaniers requis.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !destination || !depart || !arrivee || !file}
            >
              {isSubmitting ? "Enregistrement..." : "Confirmer l'expédition"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
