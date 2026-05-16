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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowRightLeft, ShieldCheck } from "lucide-react"
import type { TransferPayload } from "@/types/api-traceability"
import { useActors } from "@/hooks/useActors"
import { useUser } from "@/context/useUser"

interface TransferLotDialogProps {
  lotHashes: string[]
  isSubmitting: boolean
  onSubmit: (data: TransferPayload, onSuccess: () => void) => void
}

type FormValues = {
  destinataireId: string
}

export function TransferLotDialog({
  lotHashes,
  isSubmitting,
  onSubmit,
}: TransferLotDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const { user } = useUser()
  const { users, loadUsers } = useActors()
  const { handleSubmit, setValue, watch, reset } = useForm<FormValues>()

  useEffect(() => {
    if (open) loadUsers()
  }, [open, loadUsers])

  // Transformateurs ET exportateurs comme destinataires potentiels
  const transformateurs = users.filter(u => u.role === "TRANSFORMATEUR")
  const exportateurs = users.filter(u => u.role === "EXPORTATEUR")

  const handleFormSubmit = (values: FormValues) => {
    if (!file) return

    const payload: TransferPayload = {
      transferHash: `TRF-${Date.now()}`,
      lotHashes: lotHashes,
      expediteurId: user?.blockchainId || user?.userId || "UNKNOWN",
      destinataireId: values.destinataireId,
      file: file,
    }
    onSubmit(payload, () => {
      reset()
      setFile(null)
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
            Choisissez un transformateur ou un exportateur. Cette action est irréversible sur la blockchain.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Lots sélectionnés</Label>
            <div className="flex flex-wrap gap-1">
              {lotHashes.map(hash => (
                <code key={hash} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                  {hash.substring(0, 16)}...
                </code>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="destinataire">Destinataire *</Label>
            <Select onValueChange={(v) => setValue("destinataireId", v)}>
              <SelectTrigger id="destinataire">
                <SelectValue placeholder="Choisir un destinataire" />
              </SelectTrigger>
              <SelectContent>
                {transformateurs.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>
                      <Badge variant="secondary" className="text-[10px] font-normal">Transformateurs</Badge>
                    </SelectLabel>
                    {transformateurs.map((t) => (
                      <SelectItem key={t.id} value={t.blockchain_id || t.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{t.full_name}</span>
                          {t.org_name && (
                            <span className="text-[10px] text-muted-foreground">{t.org_name}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {exportateurs.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>
                      <Badge variant="outline" className="text-[10px] font-normal">Exportateurs</Badge>
                    </SelectLabel>
                    {exportateurs.map((exp) => (
                      <SelectItem key={exp.id} value={exp.blockchain_id || exp.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{exp.full_name}</span>
                          {exp.org_name && (
                            <span className="text-[10px] text-muted-foreground">{exp.org_name}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {transformateurs.length === 0 && exportateurs.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Aucun destinataire disponible. Vérifiez que des transformateurs ou exportateurs sont enregistrés.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proof-file">Document de preuve *</Label>
            <Input
              id="proof-file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground">
              Bon de livraison, contrat ou tout document attestant le transfert physique.
            </p>
          </div>

          <div className="rounded-lg bg-amber-50 p-3 border border-amber-100 flex gap-3">
            <ShieldCheck className="size-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800">
              En confirmant, vous attestez que les lots physiques ont été remis ou sont en cours de livraison.
              La transaction sera horodatée et signée de manière immuable.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !watch("destinataireId") || !file}>
              {isSubmitting ? "Transfert en cours..." : "Confirmer le transfert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
