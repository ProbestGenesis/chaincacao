"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LotFormSchema, type LotFormData } from "@/lib/schemas/lot"
import { cn } from "@/lib/utils"

export function LotForm({
  className,
  defaultValues,
  onSubmit,
  submitLabel = "Enregistrer le lot",
  secondaryAction,
}: {
  className?: string
  defaultValues?: Partial<LotFormData>
  submitLabel?: string
  secondaryAction?: React.ReactNode
  onSubmit: (values: LotFormData) => void | Promise<void>
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LotFormData>({
    resolver: zodResolver(LotFormSchema) as any,
    defaultValues: {
      espece: "",
      poidsKg: 0,
      dateCollecte: new Date(),
      region: "",
      gpsLatitude: 0,
      gpsLongitude: 0,
      photoUrls: [],
      coopName: "",
      ...defaultValues,
    },
  })

  const submit = handleSubmit(async (values) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values as LotFormData)
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <form onSubmit={submit} className={cn("space-y-6", className)}>
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="espece">Espèce</FieldLabel>
          <Input id="espece" {...register("espece")} placeholder="Cacao" />
          <FieldError errors={[errors.espece]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="coopName">Coopérative</FieldLabel>
          <Input id="coopName" {...register("coopName")} placeholder="Coopérative Centrale" />
          <FieldError errors={[errors.coopName]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="poidsKg">Poids total (kg)</FieldLabel>
          <Input
            id="poidsKg"
            type="number"
            inputMode="decimal"
            {...register("poidsKg", { valueAsNumber: true })}
            placeholder="450"
          />
          <FieldError errors={[errors.poidsKg]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="region">Région</FieldLabel>
          <Input id="region" {...register("region")} placeholder="Kpalimé" />
          <FieldError errors={[errors.region]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="gpsLatitude">Latitude GPS</FieldLabel>
          <Input
            id="gpsLatitude"
            type="number"
            step="0.000001"
            {...register("gpsLatitude", { valueAsNumber: true })}
            placeholder="6.12345"
          />
          <FieldError errors={[errors.gpsLatitude]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="gpsLongitude">Longitude GPS</FieldLabel>
          <Input
            id="gpsLongitude"
            type="number"
            step="0.000001"
            {...register("gpsLongitude", { valueAsNumber: true })}
            placeholder="1.23456"
          />
          <FieldError errors={[errors.gpsLongitude]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="dateCollecte">Date de collecte</FieldLabel>
          <Input
            id="dateCollecte"
            type="date"
            {...register("dateCollecte", {
              setValueAs: (value) => (value ? new Date(value) : new Date()),
            })}
          />
          <FieldError errors={[errors.dateCollecte]} />
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="photoUrls">Photos</FieldLabel>
          <Textarea
            id="photoUrls"
            placeholder="https://... , https://..."
            {...register("photoUrls", {
              setValueAs: (value) =>
                typeof value === "string"
                  ? value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  : [],
            })}
          />
          <FieldDescription>Colle une ou plusieurs URLs séparées par des virgules.</FieldDescription>
          <FieldError errors={[errors.photoUrls]} />
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" disabled={isSubmitting} className="rounded-xl">
          <Upload className="size-4" />
          {isSubmitting ? "Enregistrement..." : submitLabel}
        </Button>
        {secondaryAction}
      </div>
    </form>
  )
}
