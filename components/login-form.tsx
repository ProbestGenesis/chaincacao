"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useUser } from "@/context/useUser"
import { loginSchema, type LoginFormData } from "@/lib/schemas/login"
import { cn } from "@/lib/utils"
import { useUsersStore } from "@/store/users"
import { api } from "@/lib/api"
import { User } from "@/types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setUser } = useUser()
  const setToken = useUsersStore((state) => state.setToken)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await api.post<{
        access_token: string
        token_type: string
        user: {
          email: string
          full_name: string
          role: string
          org_name: string
          blockchain_id: string
        }
      }>(
        "/api/v1/auth/login",
        {
          username: data.email, // This can be email or phone
          password: data.password,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )

      if (response.access_token) {
        setToken(response.access_token)

        const userRole = response.user.role as any // Will be mapped or used as is

        const newUser: User = {
          userId: response.user.blockchain_id || response.user.email,
          email: response.user.email,
          telephone: "", // We don't have it in the login response yet, but it's okay
          nomAffiche: response.user.full_name,
          roles: [userRole],
          orgName: response.user.org_name,
          blockchainId: response.user.blockchain_id,
          statut: "actif",
          dateCreation: Date.now(),
          derniereConnexion: Date.now(),
          token: response.access_token,
        }

        setUser(newUser)
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion. Veuillez réessayer.")
      console.error("Login error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Connexion à votre compte</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Saisissez votre e‑mail ou votre numéro de téléphone pour vous connecter
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">E-mail ou Téléphone</FieldLabel>
          <Input
            id="email"
            type="text"
            placeholder="m@example.com ou +228..."
            className="bg-background"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
            <Link
              href="/auth/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center">
            Vous n'avez pas de compte?{" "}
            <a
              href="/auth/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              S'inscrire
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
