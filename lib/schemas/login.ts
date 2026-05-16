import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().min(3, "Veuillez entrer un email ou un numéro de téléphone valide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
})

export type LoginFormData = z.infer<typeof loginSchema>
