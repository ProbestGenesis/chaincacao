import { z } from "zod"

export const registrationSchema = z
  .object({
    nomAffiche: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must not exceed 100 characters"),
    email: z.string().email("Please enter a valid email address"),
    telephone: z
      .string()
      .min(8, "Please enter a valid phone number")
      .max(20, "Phone number is too long"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    roles: z
      .array(z.string())
      .min(1, "Please select at least one role")
      .max(3, "You can select up to 3 roles"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RegistrationFormData = z.infer<typeof registrationSchema>

export const AVAILABLE_ROLES = [
  { id: "agriculteur", label: "Agriculteur", description: "Farmer" },
  { id: "coop-manager", label: "CoopManager", description: "Cooperative Manager" },
  { id: "transformer", label: "Transformer", description: "Processor" },
  { id: "exporter", label: "Exporter", description: "Exporter" },
  { id: "carrier-user", label: "CarrierUser", description: "Transport User" },
  { id: "verifier", label: "Verifier", description: "Verifier" },
  { id: "importer", label: "Importer", description: "Importer" },
  { id: "ministry-analyst", label: "MinistryAnalyst", description: "Ministry Analyst" },
]
