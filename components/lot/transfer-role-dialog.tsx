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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRightLeft, ShieldCheck, User } from "lucide-react"
import { useRecipients } from "@/hooks/api/useAuth"
import { useUser } from "@/context/useUser"
import { useTraceability } from "@/hooks/useTraceability"
import { getLotTraceabilityIds } from "@/lib/lot-lineage"
import type { Lot, UserRole } from "@/types/types"
import type { TransferPayload } from "@/types/api-traceability"

interface TransferRoleDialogProps {
  lot: Lot
  open: boolean
  onOpenChange: (open: boolean) => void
  activeRole: UserRole | null
  currentUserId: string
}

type FormValues = {
  destinataire_id: string
}

export function TransferRoleDialog({
  lot,
  open,
  onOpenChange,
  activeRole,
  currentUserId,
}: TransferRoleDialogProps) {
  const { user } = useUser()
  const { createTransfer, isSubmitting } = useTraceability()
  const { data: recipients } = useRecipients()
  const { handleSubmit, setValue, watch, reset } = useForm<FormValues>()

  const [destinations, setDestinations] = useState<{ id: string; name: string; role: string }[]>([])

  useEffect(() => {
    if (!open) return

    const list = (recipients || []).map((u: any) => ({
      id: u.blockchain_id || u.id?.toString() || "",
      name: u.full_name || u.org_name || "",
      role: u.role
    }))

    setDestinations(list)
  }, [open, recipients])

  const handleFormSubmit = async (values: FormValues) => {
    const selectedRecipient = destinations.find(d => d.id === values.destinataire_id)
    
    const payload: any = {
      transferHash: `TRF-${Date.now()}`,
      lotHashes: getLotTraceabilityIds(lot),
      expediteurId: currentUserId,
      expediteurName: user?.nomAffiche || "",
      destinataireId: values.destinataire_id,
      destinataireName: selectedRecipient?.name || "",
      file: new File([""], "transfer_proof.pdf", { type: "application/pdf" })
    }

    try {
      await createTransfer(payload)
      reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Transfer error:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="size-5" />
            Transférer la propriété du lot
          </DialogTitle>
          <DialogDescription>
            Cette action enregistre un transfert de propriété irréversible sur la blockchain.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Lot à transférer</Label>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-sm font-medium">{lot.lotId}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lot.espece} • {lot.poidsKg} kg • {lot.region}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinataire">Destinataire *</Label>
            <Select onValueChange={(v) => setValue("destinataire_id", v)}>
              <SelectTrigger id="destinataire" className="rounded-xl">
                <SelectValue placeholder="Choisir un destinataire" />
              </SelectTrigger>
              <SelectContent>
                {destinations.length > 0 ? (
                  destinations.map((dest) => (
                    <SelectItem key={dest.id} value={dest.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{dest.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{dest.role}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Aucun destinataire disponible pour votre rôle.
                  </div>
                )}
              </SelectContent>
            </Select>
            {destinations.length === 0 && activeRole === "COOPERATIVE" && (
              <p className="text-[10px] text-amber-600 mt-1">
                Note: Seuls les exportateurs et transformateurs validés sur la blockchain sont listés.
              </p>
            )}
          </div>

          <div className="rounded-xl bg-amber-50 p-3 border border-amber-100 flex gap-3">
            <ShieldCheck className="size-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              En confirmant, vous attestez que les lots physiques ont été remis ou sont en cours de livraison. 
              La transaction sera horodatée et signée de manière immuable.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !watch("destinataire_id")}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white min-w-[140px]"
            >
              {isSubmitting ? "En cours..." : "Signer le transfert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
