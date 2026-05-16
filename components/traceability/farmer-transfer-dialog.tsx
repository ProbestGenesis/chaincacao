"use client"

import { useState } from "react"
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
import { FileUp, ArrowRightLeft, ShieldCheck } from "lucide-react"
import type { TransferPayload } from "@/types/api-traceability"
import { useUser } from "@/context/useUser"

interface FarmerTransferDialogProps {
  lotHash: string
  coopId?: string
  isSubmitting: boolean
  onTransfer: (data: TransferPayload, onSuccess: () => void) => void
}

export function FarmerTransferDialog({
  lotHash,
  coopId,
  isSubmitting,
  onTransfer,
}: FarmerTransferDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const { user } = useUser()

  const handleTransfer = () => {
    if (!coopId || !file) return

    const payload: TransferPayload = {
      transferHash: `TRF-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      lotHashes: [lotHash],
      expediteurId: user?.blockchainId || user?.userId || "UNKNOWN",
      destinataireId: coopId,
      file: file,
    }

    onTransfer(payload, () => {
      setOpen(false)
      setFile(null)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 h-8">
          <ArrowRightLeft className="size-3.5" />
          Transférer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transférer à la Coopérative</DialogTitle>
          <DialogDescription>
            Vous allez transférer la propriété légale de ce lot à votre coopérative ({coopId}).
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-3 bg-muted rounded-md space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-bold">Lot à transférer</p>
            <p className="font-mono text-sm">{lotHash}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof-file">Document de preuve (Bon de livraison/reçu) *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="proof-file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Obligatoire pour valider le transfert sur la blockchain.
            </p>
          </div>

          <div className="rounded-lg bg-amber-50 p-3 border border-amber-100 flex gap-3">
            <ShieldCheck className="size-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800">
              Cette action est irréversible et sera enregistrée de manière immuable sur la blockchain ChainCacao.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button 
            type="button" 
            onClick={handleTransfer} 
            disabled={isSubmitting || !coopId || !file}
          >
            {isSubmitting ? "Transfert..." : "Confirmer le transfert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
