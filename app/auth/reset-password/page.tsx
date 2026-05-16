"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { resetPasswordSchema, type ResetPasswordData } from "@/lib/schemas/auth"
import loginIllu from "@/assets/loginIlllu.jpg"
import logo from "@/assets/smartKakaoLogo.png"

export default function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  })

  const onSubmit = async (data: ResetPasswordData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      // Simulation d'appel API
      console.log("Resetting password...")
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSuccess(true)
    } catch (err: any) {
      setError("Une erreur est survenue lors de la réinitialisation. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/auth" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Image src={logo} alt="Logo" className="size-6" />
            </div>
            Chaincacao
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {!isSuccess ? (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                    <Lock className="size-6" />
                  </div>
                  <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    Veuillez saisir votre nouveau mot de passe ci-dessous.
                  </p>
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="password">Nouveau mot de passe</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-background"
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirmez le mot de passe</FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-background"
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </Field>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Réinitialisation..." : "Enregistrer le mot de passe"}
                  </Button>
                </FieldGroup>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-2">
                  <CheckCircle2 className="size-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Succès !</h2>
                  <p className="text-sm text-muted-foreground">
                    Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/auth">Se connecter</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src={loginIllu}
          alt="Image de connexion"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
