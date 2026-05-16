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
import { api } from "@/lib/api"
import {
  AVAILABLE_ROLES,
  registrationSchema,
  type RegistrationFormData,
} from "@/lib/schemas/registration"
import { cn } from "@/lib/utils"
import { useUsersStore } from "@/store/users"
import { User, UserRole } from "@/types/types"
import { useQuery } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Upload,
  User as UserIcon,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { ScrollArea } from "./ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type FormData = RegistrationFormData

const roleMapping: Record<string, UserRole> = {
  agriculteur: "PRODUCTEUR",
  "coop-manager": "COOPERATIVE",
  transformer: "TRANSFORMATEUR",
  exporter: "EXPORTATEUR",
  "carrier-user": "CarrierUser",
  verifier: "CERTIF",
  importer: "Importer",
  "ministry-analyst": "MINISTERE",
}

export function MultiStepSignupForm({ className }: { className?: string }) {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addUser } = useUsersStore()
  const router = useRouter()
  const { setUser } = useUser()
  const { setToken } = useUsersStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onBlur",
    defaultValues: {
      roles: [],
    },
  })

  const [coopSearch, setCoopSearch] = useState("")
  const [isCoopPopoverOpen, setIsCoopPopoverOpen] = useState(false)

  const { data: cooperatives, isLoading: isLoadingCoops } = useQuery({
    queryKey: ["cooperatives"],
    queryFn: async () => {
      try {
        const response = await api.get<any[]>("/api/v1/auth/cooperatives/public")
        return response
      } catch (err) {
        console.error("Failed to fetch cooperatives (likely 401 protected endpoint):", err)
        return []
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const filteredCoops = cooperatives?.filter((coop) =>
    coop.full_name.toLowerCase().includes(coopSearch.toLowerCase())
  )

  const selectedRoles = watch("roles") || []
  const selectedRole = selectedRoles[0]
  
  const getRoleLabels = (roleId?: string) => {
    switch (roleId) {
      case "agriculteur":
        return {
          title: "Profil Producteur",
          name: "Nom complet du Producteur",
          phone: "Numéro de téléphone personnel",
          proof: "Pièce d'identité / Titre foncier",
        }
      case "coop-manager":
        return {
          title: "Profil Coopérative",
          name: "Dénomination de la Coopérative",
          phone: "Téléphone de la Coopérative",
          proof: "Agrément ou Statuts",
        }
      case "transformer":
        return {
          title: "Profil Transformateur",
          name: "Nom de l'Unité de Transformation",
          phone: "Téléphone professionnel",
          proof: "Registre du Commerce (RCCM)",
        }
      case "exporter":
        return {
          title: "Profil Exportateur",
          name: "Raison Sociale de l'Exportateur",
          phone: "Téléphone du siège",
          proof: "Agrément d'exportateur",
        }
      case "carrier-user":
        return {
          title: "Profil Transporteur",
          name: "Nom de la Société de Transport",
          phone: "Téléphone logistique",
          proof: "Licence de transport",
        }
      case "verifier":
        return {
          title: "Profil Certificateur",
          name: "Nom de l'Organisme de Certification",
          phone: "Téléphone de contact",
          proof: "Accréditation",
        }
      case "importer":
        return {
          title: "Profil Importateur",
          name: "Raison Sociale de l'Importateur",
          phone: "Téléphone international",
          proof: "Certificat d'importation",
        }
      case "ministry-analyst":
        return {
          title: "Profil Ministère",
          name: "Direction / Service Ministériel",
          phone: "Ligne directe",
          proof: "Arrêté de nomination / Badge",
        }
      default:
        return {
          title: "Détails du Profil",
          name: "Nom complet / Raison Sociale",
          phone: "Numéro de téléphone",
          proof: "Document de légalité",
        }
    }
  }

  const roleLabels = getRoleLabels(selectedRole)

  const steps = [
    {
      title: "Rôle & Responsabilité",
      description: "Sélectionnez votre fonction dans la chaîne",
    },
    {
      title: "Sécurité",
      description: "Vos identifiants de connexion",
    },
    {
      title: roleLabels.title,
      description: "Informations professionnelles et corporate",
    },
    {
      title: "Documents & Validation",
      description: "Preuves légales et affiliations",
    },
    {
      title: "Révision",
      description: "Vérifiez vos informations",
    },
  ]

  const validateStep = async () => {
    const fieldsToValidate = getFieldsForStep(step)
    return await trigger(fieldsToValidate as any[])
  }

  const getFieldsForStep = (currentStep: number) => {
    switch (currentStep) {
      case 0:
        return ["roles"]
      case 1:
        return ["email", "password", "confirmPassword"]
      case 2:
        return ["nomAffiche", "telephone"]
      case 3:
        const fields = ["proofFile"]
        if (selectedRole === "agriculteur") {
          fields.push("coopId")
        }
        return fields
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
      // Map frontend roles to backend roles
      const backendRoleMap: Record<string, string> = {
        agriculteur: "PRODUCTEUR",
        "coop-manager": "COOPERATIVE",
        transformer: "TRANSFORMATEUR",
        exporter: "EXPORTATEUR",
        "carrier-user": "EXPORTATEUR",
        verifier: "CERTIF",
        importer: "EXPORTATEUR",
        "ministry-analyst": "MINISTERE",
      }

      // Map backend roles to org names
      const orgMapping: Record<string, string> = {
        PRODUCTEUR: "producteurs",
        COOPERATIVE: "cooperatives",
        TRANSFORMATEUR: "transformateurs",
        EXPORTATEUR: "exportateurs",
        CERTIF: "certif",
        MINISTERE: "ministere",
      }

      const primaryRole = data.roles[0]
      const backendRole = backendRoleMap[primaryRole] || "PRODUCTEUR"
      const orgName = orgMapping[backendRole] || "producteurs"

      // Create FormData for multipart/form-data request
      const formData = new FormData()
      formData.append("email", data.email || "")
      formData.append("password", data.password)
      formData.append("full_name", data.nomAffiche)
      formData.append("role", backendRole)
      formData.append("numero_telephone", data.telephone || "")
      formData.append("org_name", orgName)

      if (data.coopId) {
        formData.append("coop_id", data.coopId)
      }

      if (data.proofFile?.[0]) {
        formData.append("file", data.proofFile[0])
      } else {
        // Envoi d'un fichier vide pour éviter l'erreur 422 si le backend l'exige
        formData.append("file", new Blob([""], { type: "application/pdf" }), "empty.pdf")
      }

      const response = await api.post<{
        email: string
        full_name: string
        numero_telephone: string
        role: string
        org_name: string
        blockchain_id: string
        blockchain_validated: boolean
        document_legalite_hash: string
      }>("/api/v1/auth/register", formData, { isFormData: true })

      // After registration, the user might need to login to get a token,
      // but usually the backend might return a token or we just redirect to login.
      // The API_DOC doesn't say register returns a token.
      // Let's assume we redirect to login or handle it if the backend returns more.

      const newUser: User = {
        userId: response.blockchain_id || response.email,
        email: response.email,
        telephone: response.numero_telephone || data.telephone || "",
        nomAffiche: response.full_name,
        roles: data.roles.map(
          (role) => roleMapping[role] || role
        ) as UserRole[],
        orgName: response.org_name,
        blockchainId: response.blockchain_id,
        coopId: data.coopId,
        statut: "actif",
        dateCreation: Date.now(),
        derniereConnexion: Date.now(),
      }

      // Automatically log in the user after registration
      try {
        const loginResponse = await api.post<{
          access_token: string
          token_type: string
          user: any
        }>(
          "/api/v1/auth/login",
          {
            username: data.email,
            password: data.password,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )

        if (loginResponse.access_token) {
          setToken(loginResponse.access_token)
          newUser.token = loginResponse.access_token
          setUser(newUser)
          addUser(newUser)
          // Redirect to dashboard instead of login
          router.push("/")
          return
        }
      } catch (loginErr) {
        console.error("Auto-login failed after registration:", loginErr)
        // Fallback: redirect to login
        router.push("/auth")
      }
    } catch (err: any) {
      setError(err.message || "Échec de l'inscription. Veuillez réessayer.")
      console.error("Registration error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Progress Indicator */}
      <div className="flex justify-between px-2">
        {steps.map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <motion.div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                index === step
                  ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : index < step
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted bg-muted text-muted-foreground"
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {index < step ? <Check className="size-4" /> : index + 1}
            </motion.div>
          </div>
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
      <div className="relative">
        <ScrollArea className="h-[60vh] pr-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 gap-1 text-center">
                <h2 className="text-xl font-bold">{steps[step].title}</h2>
                <p className="text-sm text-muted-foreground">
                  {steps[step].description}
                </p>
              </div>

              {/* Step 0: Role Selection */}
              {step === 0 && (
                <FieldGroup>
                  <div className="grid gap-3">
                    {AVAILABLE_ROLES.map((role) => (
                      <motion.label
                        key={role.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all hover:bg-muted",
                          selectedRole === role.id
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        )}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <input
                          type="radio"
                          value={role.id}
                          checked={selectedRole === role.id}
                          onChange={() => setValue("roles", [role.id])}
                          className="mt-1 size-4 accent-primary"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{role.label}</span>
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

              {/* Step 1: Account Information */}
              {step === 1 && (
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">E-mail Professionnel</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nom@organisation.com"
                      className="bg-background"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </Field>

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

              {/* Step 2: Profile Details */}
              {step === 2 && (
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="nomAffiche">{roleLabels.name}</FieldLabel>
                    <Input
                      id="nomAffiche"
                      type="text"
                      placeholder="Saisissez le nom officiel"
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
                    <FieldLabel htmlFor="telephone">{roleLabels.phone}</FieldLabel>
                    <Input
                      id="telephone"
                      type="tel"
                      placeholder="+228 XX XX XX XX"
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

              {/* Step 3: Proof & Affiliation */}
              {step === 3 && (
                <FieldGroup>
                  {selectedRole === "agriculteur" && (
                    <Field>
                      <FieldLabel>Affiliation Coopérative</FieldLabel>
                      <Popover
                        open={isCoopPopoverOpen}
                        onOpenChange={setIsCoopPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between bg-background"
                          >
                            {watch("coopName") || "Sélectionnez votre coopérative"}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                          <div className="flex flex-col">
                            <div className="flex items-center border-b p-2">
                              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                              <input
                                placeholder="Rechercher une coopérative..."
                                className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                value={coopSearch}
                                onChange={(e) => setCoopSearch(e.target.value)}
                              />
                            </div>
                            <ScrollArea className="h-60">
                              <div className="p-1">
                                {isLoadingCoops ? (
                                  <p className="p-2 text-center text-sm text-muted-foreground">
                                    Chargement...
                                  </p>
                                ) : filteredCoops?.length === 0 ? (
                                  <p className="p-2 text-center text-sm text-muted-foreground">
                                    Aucune coopérative trouvée.
                                  </p>
                                ) : (
                                  filteredCoops?.map((coop) => (
                                    <div
                                      key={coop.blockchain_id}
                                      className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm hover:bg-muted"
                                      onClick={() => {
                                        setValue("coopId", coop.blockchain_id)
                                        setValue("coopName", coop.full_name)
                                        setIsCoopPopoverOpen(false)
                                      }}
                                    >
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <UserIcon className="h-4 w-4" />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {coop.full_name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {coop.blockchain_id}
                                        </span>
                                      </div>
                                      {watch("coopId") === coop.blockchain_id && (
                                        <Check className="ml-auto h-4 w-4" />
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            </ScrollArea>
                          </div>
                        </PopoverContent>
                      </Popover>
                      {errors.coopId && (
                        <p className="text-xs text-destructive">
                          {errors.coopId.message}
                        </p>
                      )}
                    </Field>
                  )}

                  <Field>
                    <FieldLabel htmlFor="proofFile">{roleLabels.proof}</FieldLabel>
                    <div className="relative">
                      <Input
                        id="proofFile"
                        type="file"
                        className="hidden"
                        {...register("proofFile")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start gap-2 border-dashed py-8"
                        onClick={() => document.getElementById("proofFile")?.click()}
                      >
                        <Upload className="h-5 w-5" />
                        <div className="flex flex-col items-start">
                          <span className="text-sm">
                            {watch("proofFile")?.[0]?.name || "Téléverser le document justificatif"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Format PDF ou Image (max. 5MB)
                          </span>
                        </div>
                      </Button>
                    </div>
                  </Field>
                </FieldGroup>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <FieldGroup>
                  <motion.div
                    className="space-y-4 rounded-xl border bg-muted/50 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="border-b pb-4 mb-4">
                      <h3 className="font-bold text-lg text-primary">Récapitulatif de l'entité</h3>
                    </div>
                    <ReviewItem
                      label="Rôle sélectionné"
                      value={AVAILABLE_ROLES.find(r => r.id === selectedRole)?.label}
                    />
                    <ReviewItem label="Email de contact" value={watch("email")} />
                    <ReviewItem label={roleLabels.name} value={watch("nomAffiche")} />
                    <ReviewItem label="Téléphone" value={watch("telephone")} />
                    {watch("coopName") && (
                      <ReviewItem label="Coopérative" value={watch("coopName")} />
                    )}
                    <div className="pt-4 mt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="size-4 text-green-500" />
                      <span>Les informations seront soumises à validation par les autorités compétentes.</span>
                    </div>
                  </motion.div>
                </FieldGroup>
              )}
            </motion.div>
          </AnimatePresence>
        </ScrollArea>
        
        {/* Indicateur de défilement (Scroll Hint) */}
        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 pointer-events-none text-primary/30 flex flex-col items-center gap-1"
          animate={{ y: [0, 5, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">Scroll</span>
          <ChevronDown className="size-4" />
        </motion.div>
      </div>

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
            <Button type="submit" disabled={isSubmitting} className="px-8">
              {isSubmitting ? "Traitement en cours..." : "Confirmer l'inscription"}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext} className="px-8">
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
    <div className="flex flex-col gap-1 py-1">
      <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value || "—"}</span>
    </div>
  )
}
