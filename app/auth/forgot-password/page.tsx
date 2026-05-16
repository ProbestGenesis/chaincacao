"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { forgotPasswordSchema, type ForgotPasswordData } from "@/lib/schemas/auth"
import loginIllu from "@/assets/loginIlllu.jpg"
import logo from "@/assets/smartKakaoLogo.png"

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  })

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      // Simulation d'appel API
      console.log("Requesting password reset for:", data.email)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSuccess(true)
    } catch (err: any) {
      setError("Une erreur est survenue. Veuillez réessayer plus tard.")
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
                    <Mail className="size-6" />
                  </div>
                  <h1 className="text-2xl font-bold">Mot de passe oublié ?</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    Pas d'inquiétude ! Entrez votre e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                  </p>
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Adresse e-mail</FieldLabel>
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

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Envoi en cours..." : "Réinitialiser le mot de passe"}
                  </Button>

                  <Link
                    href="/auth"
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="size-4" />
                    Retour à la connexion
                  </Link>
                </FieldGroup>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-2">
                  <Mail className="size-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Vérifiez vos e-mails</h2>
                  <p className="text-sm text-muted-foreground">
                    Nous avons envoyé un lien de réinitialisation de mot de passe à votre adresse e-mail.
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth">Retour à la connexion</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Vous n'avez rien reçu ?{" "}
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="underline hover:text-foreground"
                  >
                    Réessayer
                  </button>
                </p>
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
