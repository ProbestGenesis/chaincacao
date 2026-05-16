import { z } from "zod"

export const registrationSchema = z
  .object({
    nomAffiche: z
      .string()
      .min(2, "Veuillez entrer un nom d'utilisateur valide")
      .max(100, "Le nom d'utilisateur est trop long"),
    email: z.string().email("Veuillez entrer un email valide").optional(),
    telephone: z
      .string()
      .min(8, "Veuillez entrer un numéro de téléphone valide")
      .max(20, "Le numéro de téléphone est trop long").optional(),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    confirmPassword: z.string(),
    roles: z
      .array(z.string())
      .min(1, "Veuillez sélectionner votre rôle")
      .max(1, "Veuillez sélectionner un seul rôle"),
    coopId: z.string().optional(),
    coopName: z.string().optional(),
    proofFile: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
 

export type RegistrationFormData = z.infer<typeof registrationSchema>

export const AVAILABLE_ROLES = [
  {
    id: "agriculteur",
    label: "Producteur / Agriculteur",
    description: "Producteur individuel de cacao",
  },
  {
    id: "coop-manager",
    label: "Gestionnaire de Coopérative",
    description: "Administrateur d'une coopérative",
  },
  {
    id: "transformer",
    label: "Transformateur",
    description: "Unité de transformation locale",
  },
  {
    id: "exporter",
    label: "Exportateur",
    description: "Société d'exportation internationale",
  },
  {
    id: "carrier-user",
    label: "Transporteur",
    description: "Agent logistique et transport",
  },
  {
    id: "verifier",
    label: "Vérificateur / Certificateur",
    description: "Organisme de certification (UTZ, RainForest, etc.)",
  },
  {
    id: "importer",
    label: "Importateur",
    description: "Acheteur international",
  },
  {
    id: "ministry-analyst",
    label: "Analyste du Ministère",
    description: "Agent gouvernemental de régulation",
  },
]
