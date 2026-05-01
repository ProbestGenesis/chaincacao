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
import { loginSchema, type LoginFormData } from "@/lib/schemas/login"
import { cn } from "@/lib/utils"
import { useUsersStore } from "@/store/users"
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
  const getUserByEmail = useUsersStore((state) => state.getUserByEmail)

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
      const foundUser = getUserByEmail(data.email)

      if (!foundUser) {
        setError("Email ou mot de passe invalide")
        setIsSubmitting(false)
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user context with login timestamp
      const updatedUser = {
        ...foundUser,
        derniereConnexion: Date.now(),
      }

      setUser(updatedUser)
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.")
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
            Saisissez votre e‑mail ci‑dessous pour vous connecter à votre compte
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

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
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Mot de passe oublié ?
            </a>
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
