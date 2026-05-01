"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader, MapPin, Upload, X } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
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
  onSubmit: (values: LotFormData) => void | Promise<void>
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [geoLoading, setGeoLoading] = useState(true)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

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
      region: "",
      gpsLatitude: 0,
      gpsLongitude: 0,
      photoUrls: [],
      coopName: "",
      ...defaultValues,
    },
  })

  // Request geolocation on mount
  useEffect(() => {
    requestGeolocation()
  }, [])

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Géolocalisation non disponible sur cet appareil")
      setGeoLoading(false)
      return
    }

    setGeoLoading(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6))
        const lon = parseFloat(position.coords.longitude.toFixed(6))

        setValue("gpsLatitude", lat)
        setValue("gpsLongitude", lon)
        setGeoLoading(false)
      },
      (error) => {
        let message = "Erreur de géolocalisation"
        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Accès à la géolocalisation refusé. Veuillez activer les permissions."
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Position non disponible. Essayez ultérieurement."
        }
        setGeoError(message)
        setGeoLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

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
      await onSubmit(values as LotFormData)
    } finally {
      setIsSubmitting(false)
    }
  })

  const latitude = watch("gpsLatitude")
  const longitude = watch("gpsLongitude")

  return (
    <form onSubmit={submit} className={cn("space-y-6", className)}>
      {/* Geolocation Section */}
      <Card className="">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5 text-primary" />
            Localisation GPS
          </CardTitle>
          <CardDescription>
            Votre position est détectée automatiquement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {geoError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{geoError}</AlertDescription>
            </Alert>
          )}

          {geoLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader className="h-4 w-4 animate-spin text-primary" />
              Détection de la position en cours...
            </div>
          ) : latitude && longitude ? (
            <div className="grid grid-cols-2 gap-4 rounded border border-border bg-card p-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Latitude
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {latitude.toFixed(4)}°
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Longitude
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {longitude.toFixed(4)}°
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Position en attente...
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={requestGeolocation}
            disabled={geoLoading}
            className="w-full"
          >
            {geoLoading ? "Détection..." : "Réessayer la détection"}
          </Button>
        </CardContent>
      </Card>

      {/* Image Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photos du Lot</CardTitle>
          <CardDescription>
            Téléchargez jusqu'à 5 photos de votre récolte
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
                      className="h-20 w-full rounded border object-cover"
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
        </CardContent>
      </Card>

      {/* Lot Information Section */}
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="espece">Espèce</FieldLabel>
          <Input
            id="espece"
            {...register("espece")}
            placeholder="Cacao Fermenté"
          />
          <FieldError errors={[errors.espece]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="coopName">Coopérative</FieldLabel>
          <Input
            id="coopName"
            {...register("coopName")}
            placeholder="Coopérative Centrale"
          />
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
          <Input
            id="region"
            {...register("region")}
            placeholder="Haut-Sassandra"
          />
          <FieldError errors={[errors.region]} />
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
      </FieldGroup>

      {/* Submit */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" disabled={isSubmitting} className="rounded-xl">
          <Upload className="size-4" />
          {isSubmitting ? "Création en cours..." : submitLabel}
        </Button>
        {secondaryAction}
      </div>
    </form>
  )
}
