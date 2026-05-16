import { z } from "zod"

export const forgotPasswordSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse e-mail valide"),
})

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
