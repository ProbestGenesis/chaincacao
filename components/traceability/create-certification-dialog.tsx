"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTraceability } from "@/hooks/useTraceability"
import { ShieldCheck } from "lucide-react"

const certificationSchema = z.object({
  lot_hash: z.string().min(1, "L'ID du lot est requis"),
  certifier_id: z.string().min(1, "L'ID du certificateur est requis"),
  type: z.string().min(1, "Le type de certification est requis"),
  ref_hash: z.string().min(1, "La référence est requise"),
})

export function CreateCertificationDialog() {
  const [open, setOpen] = useState(false)
  const { createCertification, isSubmitting } = useTraceability()

  const form = useForm<z.infer<typeof certificationSchema>>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      lot_hash: "",
      certifier_id: "",
      type: "EUDR_COMPLIANCE",
      ref_hash: "",
    },
  })

  async function onSubmit(values: z.infer<typeof certificationSchema>) {
    try {
      await createCertification(values)
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <ShieldCheck className="size-4" />
          Ajouter une Certification
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Certification</DialogTitle>
          <DialogDescription>
            Enregistrez une preuve de certification sur la blockchain pour un lot spécifique.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="lot_hash">ID du Lot (Hash)</FieldLabel>
              <Input 
                id="lot_hash"
                placeholder="Ex: 0x..." 
                {...form.register("lot_hash")} 
              />
              <FieldError errors={[form.formState.errors.lot_hash]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="certifier_id">ID Certificateur</FieldLabel>
              <Input 
                id="certifier_id"
                placeholder="Ex: CERT-001" 
                {...form.register("certifier_id")} 
              />
              <FieldError errors={[form.formState.errors.certifier_id]} />
            </Field>

            <Field>
              <FieldLabel>Type de Certification</FieldLabel>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUDR_COMPLIANCE">Conformité EUDR</SelectItem>
                      <SelectItem value="RAINFOREST_ALLIANCE">Rainforest Alliance</SelectItem>
                      <SelectItem value="UTZ">UTZ</SelectItem>
                      <SelectItem value="BIO">Biologique</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[form.formState.errors.type]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="ref_hash">Référence (Cert Hash)</FieldLabel>
              <Input 
                id="ref_hash"
                placeholder="Ex: REF-12345" 
                {...form.register("ref_hash")} 
              />
              <FieldError errors={[form.formState.errors.ref_hash]} />
            </Field>
          </FieldGroup>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Confirmer sur Blockchain"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
