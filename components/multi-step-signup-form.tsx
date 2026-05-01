"use client"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useUser } from "@/context/useUser"
import {
  getRoleRoute,
  roleFromSignupRoleId,
} from "@/lib/navigation/role-config"
import {
  AVAILABLE_ROLES,
  registrationSchema,
  type RegistrationFormData,
} from "@/lib/schemas/registration"
import { cn } from "@/lib/utils"
import { useUsersStore } from "@/store/users"
import { UserRole } from "@/types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { ScrollArea } from "./ui/scroll-area"

type FormData = RegistrationFormData

const roleMapping: Record<string, UserRole> = {
  agriculteur: "Agriculteur",
  "coop-manager": "CoopManager",
  transformer: "Transformer",
  exporter: "Exporter",
  "carrier-user": "CarrierUser",
  verifier: "Verifier",
  importer: "Importer",
  "ministry-analyst": "MinistryAnalyst",
}

export function MultiStepSignupForm({ className }: { className?: string }) {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addUser } = useUsersStore()
  const router = useRouter()
  const { setUser } = useUser()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onBlur",
  })

  const selectedRoles = watch("roles") || []

  const steps = [
    {
      title: "Informations personnelles",
      description: "Commençons par vos informations de base",
    },
    {
      title: "Créer un mot de passe",
      description: "Définissez un mot de passe sécurisé pour votre compte",
    },
    {
      title: "Sélectionnez votre rôle",
      description: "Choisissez votre rôle dans la chaîne d'approvisionnement",
    },
    {
      title: "Vérifier et terminer",
      description: "Vérifiez vos informations avant de créer votre compte",
    },
  ]

  const validateStep = async () => {
    const fieldsToValidate = getFieldsForStep(step)
    return await trigger(fieldsToValidate as any[])
  }

  const getFieldsForStep = (currentStep: number) => {
    switch (currentStep) {
      case 0:
        return ["nomAffiche", "email", "telephone"]
      case 1:
        return ["password", "confirmPassword"]
      case 2:
        return ["roles"]
      default:
        return []
    }
  }

  const handleNext = async () => {
    if (step < steps.length - 1) {
      const isValid = await validateStep()
      if (isValid) {
        setStep((prev) => prev + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (step > 0) {
      setStep((prev) => prev - 1)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      // Simulate API call - replace with actual registration endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create new user object
      const primaryRole = roleFromSignupRoleId(data.roles[0])
      const newUser = {
        userId: `user_${Date.now()}`,
        email: data.email,
        telephone: data.telephone,
        nomAffiche: data.nomAffiche,
        roles: data.roles.map(
          (role) => roleMapping[role] || role
        ) as UserRole[],
        statut: "actif" as const,
        dateCreation: Date.now(),
        derniereConnexion: Date.now(),
      }

      // Save user to context
      setUser(newUser)
      addUser(newUser)

      router.push(getRoleRoute(primaryRole))
    } catch (err) {
      setError("Échec de l'inscription. Veuillez réessayer.")
      console.error("Registration error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Progress Indicator */}
      <div className="flex justify-between">
        {steps.map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold",
              index === step
                ? "border-primary bg-primary text-primary-foreground"
                : index < step
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted bg-muted text-muted-foreground"
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {index < step ? <Check className="size-5" /> : index + 1}
          </motion.div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </motion.div>
      )}

      {/* Step Content */}

      <form onSubmit={handleSubmit(onSubmit)}>
        <ScrollArea className="h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 0: Personal Information */}
              {step === 0 && (
                <FieldGroup>
                  <div className="gap-1 text-center">
                    <h2 className="text-xl font-bold">{steps[step].title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {steps[step].description}
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="nomAffiche">Nom complet</FieldLabel>
                    <Input
                      id="nomAffiche"
                      type="text"
                      placeholder="Jean Dupont"
                      className="bg-background"
                      {...register("nomAffiche")}
                    />
                    {errors.nomAffiche && (
                      <p className="text-xs text-destructive">
                        {errors.nomAffiche.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">E-mail</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      className="bg-background"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                    <FieldDescription>
                      Nous utiliserons cet e‑mail pour vous contacter et
                      vérifier votre compte
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="telephone">
                      Numéro de téléphone
                    </FieldLabel>
                    <Input
                      id="telephone"
                      type="tel"
                      placeholder="+33 6 00 00 00 00"
                      className="bg-background"
                      {...register("telephone")}
                    />
                    {errors.telephone && (
                      <p className="text-xs text-destructive">
                        {errors.telephone.message}
                      </p>
                    )}
                  </Field>
                </FieldGroup>
              )}

              {/* Step 1: Password */}
              {step === 1 && (
                <FieldGroup>
                  <div className="gap-1 text-center">
                    <h2 className="text-xl font-bold">{steps[step].title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {steps[step].description}
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      className="bg-background"
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                    <FieldDescription>
                      Minimum 8 caractères, 1 lettre majuscule et 1 chiffre
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirmer le mot de passe
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="bg-background"
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </Field>
                </FieldGroup>
              )}

              {/* Step 2: Role Selection */}
              {step === 2 && (
                <FieldGroup>
                  <div className="gap-1 text-center">
                    <h2 className="text-xl font-bold">{steps[step].title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {steps[step].description}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {AVAILABLE_ROLES.map((role) => (
                      <motion.label
                        key={role.id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="checkbox"
                          value={role.id}
                          {...register("roles")}
                          className="mt-1"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{role.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {role.description}
                          </span>
                        </div>
                      </motion.label>
                    ))}
                  </div>

                  {errors.roles && (
                    <p className="text-xs text-destructive">
                      {errors.roles.message}
                    </p>
                  )}
                </FieldGroup>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <FieldGroup>
                  <div className="gap-1 text-center">
                    <h2 className="text-xl font-bold">{steps[step].title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {steps[step].description}
                    </p>
                  </div>

                  <motion.div
                    className="space-y-3 rounded-lg bg-muted p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ReviewItem
                      label="Nom complet"
                      value={watch("nomAffiche")}
                    />
                    <ReviewItem label="E-mail" value={watch("email")} />
                    <ReviewItem label="Téléphone" value={watch("telephone")} />
                    <ReviewItem
                      label="Rôles"
                      value={selectedRoles
                        .map(
                          (role) =>
                            AVAILABLE_ROLES.find((r) => r.id === role)?.label
                        )
                        .join(", ")}
                    />
                  </motion.div>
                </FieldGroup>
              )}
            </motion.div>
          </AnimatePresence>
        </ScrollArea>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 0}
          >
            <ChevronLeft className="size-4" />
            Précédent
          </Button>

          {step === steps.length - 1 ? (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Création du compte..." : "Créer le compte"}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Suivant
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

function ReviewItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value || "—"}</span>
    </div>
  )
}
