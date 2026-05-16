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
import { UserPlus } from "lucide-react"
import type { RegisterProducerPayload } from "@/types/api-actors"

interface RegisterProducerDialogProps {
  isSubmitting: boolean
  onSubmit: (data: RegisterProducerPayload, onSuccess: () => void) => void
}

type FormValues = {
  fullName: string
  numeroTelephone: string
  location: string
}
 
export function RegisterProducerDialog({
  isSubmitting,
  onSubmit,
}: RegisterProducerDialogProps) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { fullName: "", numeroTelephone: "", location: "" },
  })
 
  const handleFormSubmit = (values: FormValues) => {
    onSubmit(values, () => {
      reset()
      setOpen(false)
    })
  }
 
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <UserPlus className="size-4" />
          Inscrire un Producteur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inscrire un Producteur (Délégué)</DialogTitle>
          <DialogDescription>
            Inscrivez directement un producteur. Le mot de passe par défaut sera son numéro de téléphone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="prod-fullname">Nom complet *</Label>
            <Input
              id="prod-fullname"
              placeholder="Kofi Amavi"
              {...register("fullName", { required: "Le nom est obligatoire" })}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prod-phone">Téléphone *</Label>
            <Input
              id="prod-phone"
              placeholder="+228 90 00 00 00"
              {...register("numeroTelephone", { required: "Le téléphone est obligatoire" })}
            />
            {errors.numeroTelephone && (
              <p className="text-xs text-destructive">{errors.numeroTelephone.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prod-location">Localisation / Région</Label>
            <Input
              id="prod-location"
              placeholder="Plateaux, Kpalimé"
              {...register("location")}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Inscription…" : "Inscrire"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
