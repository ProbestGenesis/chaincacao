"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTraceability } from "@/hooks/useTraceability"
import { ShieldCheck } from "lucide-react"

const certificationSchema = z.object({
  certHash: z.string().min(1, "L'ID du certificat est requis"),
  refHash: z.string().min(1, "L'ID de l'actif (lot/shipment) est requis"),
  verificateurId: z.string().min(1, "L'ID du vérificateur est requis"),
  statut: z.string().min(1, "Le statut est requis"),
  rapportHash: z.string().min(1, "Le hash du rapport est requis"),
})

export function CreateCertificationDialog() {
  const [open, setOpen] = useState(false)
  const { createCertification, isSubmitting } = useTraceability()

  const form = useForm<z.infer<typeof certificationSchema>>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      certHash: `CERT-${Date.now()}`,
      refHash: "",
      verificateurId: "",
      statut: "CONFORME",
      rapportHash: "",
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
            Enregistrez une preuve de certification sur la blockchain pour un lot ou une expédition.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="refHash">ID de l'Actif (Lot/Shipment)</FieldLabel>
              <Input 
                id="refHash"
                placeholder="Ex: LOT-..." 
                {...form.register("refHash")} 
              />
              <FieldError errors={[form.formState.errors.refHash]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="verificateurId">ID Vérificateur</FieldLabel>
              <Input 
                id="verificateurId"
                placeholder="Ex: CERT-001" 
                {...form.register("verificateurId")} 
              />
              <FieldError errors={[form.formState.errors.verificateurId]} />
            </Field>

            <Field>
              <FieldLabel>Statut</FieldLabel>
              <Controller
                control={form.control}
                name="statut"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONFORME">Conforme</SelectItem>
                      <SelectItem value="NON_CONFORME">Non Conforme</SelectItem>
                      <SelectItem value="EUDR_OK">EUDR Validé</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[form.formState.errors.statut]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="certHash">ID Certificat (Hash)</FieldLabel>
              <Input 
                id="certHash"
                placeholder="Ex: CERT-..." 
                {...form.register("certHash")} 
              />
              <FieldError errors={[form.formState.errors.certHash]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="rapportHash">Hash du Rapport</FieldLabel>
              <Input 
                id="rapportHash"
                placeholder="Ex: RAP-..." 
                {...form.register("rapportHash")} 
              />
              <FieldError errors={[form.formState.errors.rapportHash]} />
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
