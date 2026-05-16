"use client"

import { useState, useRef, useMemo } from "react"
import { useForm } from "react-hook-form"
import { MapContainer, TileLayer, Marker, useMapEvents, Polygon } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, MapPin, Trash2, RotateCcw } from "lucide-react"
import { useParcelles } from "@/hooks/useParcelles"
import { useUser } from "@/context/useUser"
import { Badge } from "@/components/ui/badge"

// Fix leaflet icon issue
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function LocationMarker({ positions, setPositions }: { positions: L.LatLng[], setPositions: (p: L.LatLng[]) => void }) {
  useMapEvents({
    click(e) {
      setPositions([...positions, e.latlng])
    },
  })

  return (
    <>
      {positions.map((pos, idx) => (
        <Marker key={idx} position={pos} icon={customIcon} />
      ))}
      {positions.length >= 3 && (
        <Polygon positions={positions} pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.3 }} />
      )}
    </>
  )
}

type FormValues = {
  culture: string
  surface: number
}

export function RegisterParcelleDialog() {
  const [open, setOpen] = useState(false)
  const [positions, setPositions] = useState<L.LatLng[]>([])
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>()
  const { registerParcelle, isSubmitting } = useParcelles()
  const { user } = useUser()

  const onSubmit = async (data: FormValues) => {
    if (positions.length < 3) return

    try {
      const payload = {
        parcelleId: `PARC-${Date.now()}`,
        farmerId: user?.blockchainId || "unknown",
        gps: positions.map(p => ({
          latitude: p.lat,
          longitude: p.lng,
        })),
        culture: data.culture,
        surface: Number(data.surface),
      } as any 
      await registerParcelle(payload)
      reset()
      setPositions([])
      setOpen(false)
    } catch (error) {
      console.error(error)
    }
  }

  const defaultCenter = { lat: 6.9, lng: 0.6 }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="size-4" />
          Ajouter une parcelle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enregistrer une nouvelle parcelle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="culture">Culture (Espèce principale) *</Label>
              <Input
                id="culture"
                placeholder="Cacao Forastero..."
                {...register("culture", { required: "La culture est requise" })}
              />
              {errors.culture && <p className="text-xs text-destructive">{errors.culture.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="surface">Superficie (ha) *</Label>
              <Input
                id="surface"
                type="number"
                step="0.01"
                placeholder="1.5"
                {...register("surface", { 
                  required: "La superficie est requise",
                  min: { value: 0.1, message: "Minimum 0.1 ha" }
                })}
              />
              {errors.surface && <p className="text-xs text-destructive">{errors.surface.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <Label className="flex items-center gap-2">
                <MapPin className="size-4" />
                Délimitez votre parcelle *
              </Label>
              {positions.length > 0 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPositions([])}
                  className="h-8 text-xs text-destructive hover:text-destructive"
                >
                  <RotateCcw className="size-3 mr-1" />
                  Réinitialiser
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Cliquez sur la carte pour définir au moins 3 points délimitant le contour de votre parcelle.
            </p>
            
            <div className="h-[350px] w-full rounded-md border overflow-hidden relative z-0">
              {open && (
                <MapContainer center={defaultCenter} zoom={7} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker positions={positions} setPositions={setPositions} />
                </MapContainer>
              )}
            </div>
            
            <div className="flex justify-between items-center bg-muted p-2 rounded-md">
              <span className="text-xs font-medium">
                Points saisis : <Badge variant={positions.length >= 3 ? "default" : "destructive"} className="ml-1">{positions.length}</Badge>
              </span>
              {positions.length > 0 && (
                 <span className="text-[10px] font-mono opacity-70">
                   Min 3 requis pour valider le polygone
                 </span>
              )}
            </div>
            {positions.length < 3 && positions.length > 0 && (
              <p className="text-xs text-destructive">Il manque encore {3 - positions.length} point(s) pour délimiter la parcelle.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting || positions.length < 3}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer la parcelle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
