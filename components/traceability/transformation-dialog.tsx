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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Factory, ShieldCheck } from "lucide-react"
import type { TransformationPayload } from "@/types/api-traceability"
import { useTraceability } from "@/hooks/useTraceability"

interface TransformationDialogProps {
  lotHashes: string[]
  onSuccess?: () => void
}

const PROCESS_TYPES = [
  { value: "FERMENTATION", label: "Fermentation & Séchage" },
  { value: "BROYAGE", label: "Broyage / Masse de cacao" },
  { value: "PRESSAGE", label: "Pressage (Beurre/Poudre)" },
  { value: "TORREFACTION", label: "Torréfaction" },
]

export function TransformationDialog({ lotHashes, onSuccess }: TransformationDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const { createTransformation, isSubmitting } = useTraceability()
  const { register, handleSubmit, setValue, watch, reset } = useForm<{ typeProcessus: string }>()

  const handleFormSubmit = async (values: { typeProcessus: string }) => {
    if (!file) return

    const payload: TransformationPayload = {
      transformationHash: `TRN-${Date.now()}`,
      lotHashes: lotHashes,
      typeProcessus: values.typeProcessus,
      file: file,
    }
    
    // Ajout d'une méthode au hook si elle manque, ou utilisation directe du service
    try {
      await createTransformation(payload)
      reset()
      setOpen(false)
      onSuccess?.()
    } catch (e) {
      console.error("Transformation error:", e)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" className="gap-1.5" disabled={lotHashes.length === 0}>
          <Factory className="size-4" />
          Enregistrer Transformation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transformation Industrielle</DialogTitle>
          <DialogDescription>
            Enregistrez une étape de transformation pour les lots sélectionnés sur la blockchain.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Lots à transformer ({lotHashes.length})</Label>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 border rounded bg-muted/50">
              {lotHashes.map(hash => (
                <code key={hash} className="text-[10px] bg-background px-1.5 py-0.5 rounded border">
                  {hash.substring(0, 12)}...
                </code>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="process">Type de processus *</Label>
            <Select onValueChange={(v) => setValue("typeProcessus", v)}>
              <SelectTrigger id="process">
                <SelectValue placeholder="Choisir le type de transformation" />
              </SelectTrigger>
              <SelectContent>
                {PROCESS_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="transformation-file">Rapport de transformation/Preuve *</Label>
            <Input
              id="transformation-file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
          </div>

          <div className="rounded-lg bg-blue-50 p-3 border border-blue-100 flex gap-3 italic">
            <ShieldCheck className="size-5 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-800">
              Cette action générera un nouvel état immuable pour ces lots, marquant la fin de leur état brut.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !watch("typeProcessus") || !file}>
              {isSubmitting ? "Enregistrement..." : "Valider la transformation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
