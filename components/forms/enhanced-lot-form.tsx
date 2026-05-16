"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader, MapPin, Upload, X } from "lucide-react"
import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LotFormSchema, type LotFormData } from "@/lib/schemas/lot"
import { cn } from "@/lib/utils"
import { useParcelles } from "@/hooks/useParcelles"
import { RegisterParcelleDialog } from "../parcelles/register-parcelle-dialog"

export function EnhancedLotForm({
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
  onSubmit: (values: LotFormData, files: File[]) => void | Promise<void>
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const { parcelles, isLoading: parcellesLoading, loadParcelles } = useParcelles()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LotFormData>({
    resolver: zodResolver(LotFormSchema) as any,
    defaultValues: {
      espece: "",
      poidsKg: 0,
      dateCollecte: new Date(),
      parcelleId: "",
      photoUrls: [],
      coopId: "",
      ...defaultValues,
    },
  })

  useEffect(() => {
    loadParcelles()
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      if (uploadedImages.length < 5) {
        setUploadedImages((prev) => [...prev, file])

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const submit = handleSubmit(async (values) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values as LotFormData, uploadedImages)
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <form onSubmit={submit} className={cn("space-y-6", className)}>
      {/* Parcelle Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5 text-primary" />
            Origine du Lot (Parcelle)
          </CardTitle>
          <CardDescription>
            Sélectionnez la parcelle d'où provient ce lot. Les coordonnées GPS seront automatiquement associées.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {parcellesLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader className="h-4 w-4 animate-spin text-primary" />
              Chargement de vos parcelles...
            </div>
          ) : parcelles.length === 0 ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Vous n'avez pas encore enregistré de parcelle.</span>
                <RegisterParcelleDialog />
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("parcelleId")}
                >
                  <option value="">Sélectionnez une parcelle</option>
                  {parcelles.map(p => (
                    <option key={p.parcelleId} value={p.parcelleId}>
                      {p.culture} - {p.surface} ha (GPS: {p.gps[0]?.latitude.toFixed(2)}, {p.gps[0]?.longitude.toFixed(2)})
                    </option>
                  ))}
                </select>
                {errors.parcelleId && (
                  <p className="text-xs text-destructive mt-1">{errors.parcelleId.message}</p>
                )}
              </div>
              <RegisterParcelleDialog />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photos de la Récolte *</CardTitle>
          <CardDescription>
            Téléchargez au moins 1 photo de votre récolte (max 5)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-6 transition-colors hover:bg-muted">
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Cliquez pour sélectionner des images
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG jusqu'à 5 MB
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadedImages.length >= 5}
              className="hidden"
            />
          </label>

          {uploadedImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {uploadedImages.length} image
                {uploadedImages.length > 1 ? "s" : ""} sélectionnée
                {uploadedImages.length > 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="group relative">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="aspect-square w-full rounded border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {uploadedImages.length === 0 && (
            <p className="text-xs text-destructive">Une photo est requise pour créer le lot.</p>
          )}
        </CardContent>
      </Card>

      {/* Lot Information Section */}
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="espece">Espèce</FieldLabel>
          <Input
            id="espece"
            {...register("espece")}
            placeholder="Cacao Forastero..."
          />
          <FieldError errors={[errors.espece]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="poidsKg">Poids total (kg)</FieldLabel>
          <Input
            id="poidsKg"
            type="number"
            inputMode="decimal"
            step="0.1"
            {...register("poidsKg", { valueAsNumber: true })}
            placeholder="120.5"
          />
          <FieldError errors={[errors.poidsKg]} />
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

        <Field>
          <FieldLabel htmlFor="coopId">ID Coopérative (Optionnel)</FieldLabel>
          <Input
            id="coopId"
            {...register("coopId")}
            placeholder="COOP-XXXX"
            disabled={!!watch("coopId")}
          />
          <FieldError errors={[errors.coopId]} />
        </Field>
      </FieldGroup>

      {/* Submit */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button 
          type="submit" 
          disabled={isSubmitting || uploadedImages.length === 0 || !watch("parcelleId")} 
          className="rounded-xl"
        >
          <Upload className="size-4" />
          {isSubmitting ? "Création en cours..." : submitLabel}
        </Button>
        {secondaryAction}
      </div>
    </form>
  )
}

