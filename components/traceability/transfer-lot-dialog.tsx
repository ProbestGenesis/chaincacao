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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRightLeft, ShieldCheck } from "lucide-react"
import type { TransferPayload } from "@/types/api-traceability"
import { useActors } from "@/hooks/useActors"

interface TransferLotDialogProps {
  lotHashes: string[]
  isSubmitting: boolean
  onSubmit: (data: TransferPayload, onSuccess: () => void) => void
}

type FormValues = {
  destinataire_id: string
}

export function TransferLotDialog({
  lotHashes,
  isSubmitting,
  onSubmit,
}: TransferLotDialogProps) {
  const [open, setOpen] = useState(false)
  const { users, loadUsers } = useActors()
  const { register, handleSubmit, setValue, watch, reset } = useForm<FormValues>()

  useEffect(() => {
    if (open) loadUsers()
  }, [open, loadUsers])

  // On filtre pour ne montrer que les Exportateurs comme destinataires potentiels pour une Coop
  const exportateurs = users.filter(u => u.role === "EXPORTATEUR")

  const handleFormSubmit = (values: FormValues) => {
    const payload: TransferPayload = {
      transfer_hash: `TRF-${Date.now()}`,
      lot_hashes: lotHashes,
      expediteur_id: "CURRENT_USER_ID", // Sera géré par le hook/service
      destinataire_id: values.destinataire_id,
      preuve_hash: `PROOF-${Math.random().toString(36).substring(7)}`,
    }
    onSubmit(payload, () => {
      reset()
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" className="gap-1.5" disabled={lotHashes.length === 0}>
          <ArrowRightLeft className="size-4" />
          Transférer {lotHashes.length > 0 ? `(${lotHashes.length})` : ""}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transférer la propriété</DialogTitle>
          <DialogDescription>
            Cette action enregistre un transfert de propriété irréversible sur la blockchain vers l'exportateur sélectionné.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Lots sélectionnés</Label>
            <div className="flex flex-wrap gap-1">
              {lotHashes.map(hash => (
                <code key={hash} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                  {hash.substring(0, 12)}...
                </code>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="destinataire">Destinataire (Exportateur) *</Label>
            <Select onValueChange={(v) => setValue("destinataire_id", v)}>
              <SelectTrigger id="destinataire">
                <SelectValue placeholder="Choisir un exportateur" />
              </SelectTrigger>
              <SelectContent>
                {exportateurs.map((exp) => (
                  <SelectItem key={exp.id} value={exp.blockchain_id || exp.id.toString()}>
                    {exp.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-amber-50 p-3 border border-amber-100 flex gap-3">
            <ShieldCheck className="size-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800">
              En confirmant, vous attestez que les lots physiques ont été remis ou sont en cours de livraison. 
              La transaction sera horodatée et signée.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !watch("destinataire_id")}>
              {isSubmitting ? "Transfert en cours..." : "Confirmer le transfert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
