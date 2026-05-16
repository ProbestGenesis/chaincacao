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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserCog } from "lucide-react"
import type { RegisterAgentPayload, ActorType, OrgName } from "@/types/api-actors"
import { roleToOrg } from "@/types/api-actors"

interface RegisterAgentDialogProps {
  /** Limiter les rôles disponibles selon le contexte (ex: coop ne peut créer que PRODUCTEUR) */
  availableRoles: { value: ActorType; label: string }[]
  isSubmitting: boolean
  onSubmit: (data: RegisterAgentPayload, onSuccess: () => void) => void
}

type FormValues = {
  full_name: string
  email: string
  numero_telephone: string
  password: string
  role: ActorType
}

export function RegisterAgentDialog({
  availableRoles,
  isSubmitting,
  onSubmit,
}: RegisterAgentDialogProps) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      full_name: "",
      email: "",
      numero_telephone: "",
      password: "",
      role: availableRoles[0]?.value,
    },
  })

  const selectedRole = watch("role")

  const handleFormSubmit = (values: FormValues) => {
    const payload: RegisterAgentPayload = {
      full_name: values.full_name,
      password: values.password,
      role: values.role,
      org_name: roleToOrg[values.role],
      ...(values.email && { email: values.email }),
      ...(values.numero_telephone && { numero_telephone: values.numero_telephone }),
    }
    onSubmit(payload, () => {
      reset()
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <UserCog className="size-4" />
          Inscrire un Agent / Délégué
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inscrire un Agent / Délégué</DialogTitle>
          <DialogDescription>
            Créez un compte pour un employé ou délégué de votre organisation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="agent-role">Rôle *</Label>
            <Select
              value={selectedRole}
              onValueChange={(v) => setValue("role", v as ActorType)}
            >
              <SelectTrigger id="agent-role">
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="agent-fullname">Nom complet *</Label>
            <Input
              id="agent-fullname"
              placeholder="Ama Koffi"
              {...register("full_name", { required: "Le nom est obligatoire" })}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="agent-email">Email</Label>
              <Input
                id="agent-email"
                type="email"
                placeholder="agent@exemple.com"
                {...register("email")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agent-phone">Téléphone</Label>
              <Input
                id="agent-phone"
                placeholder="+228 90 00 00 00"
                {...register("numero_telephone")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="agent-password">Mot de passe *</Label>
            <Input
              id="agent-password"
              type="password"
              placeholder="Min. 8 caractères"
              {...register("password", {
                required: "Le mot de passe est obligatoire",
                minLength: { value: 8, message: "Min. 8 caractères" },
              })}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
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
