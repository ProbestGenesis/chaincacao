"use client"

import { useParcelles } from "@/hooks/useParcelles"
import { RegisterParcelleDialog } from "@/components/parcelles/register-parcelle-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, TreePine, AreaChart, Loader2, Plus } from "lucide-react"
import { motion } from "motion/react"

export default function ParcellesPage() {
  const { parcelles, isLoading } = useParcelles()

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Parcelles</h1>
          <p className="text-muted-foreground">Gérez vos sites de production et leurs coordonnées GPS.</p>
        </div>
        <RegisterParcelleDialog />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : parcelles.length === 0 ? (
        <Card className="border-dashed flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted p-4 rounded-full mb-4">
            <MapPin className="size-8 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2">Aucune parcelle trouvée</CardTitle>
          <CardDescription className="mb-6">
            Commencez par enregistrer votre première parcelle pour pouvoir y associer vos lots.
          </CardDescription>
          <RegisterParcelleDialog />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parcelles.map((parcelle, index) => (
            <motion.div
              key={parcelle.parcelleId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold truncate">{parcelle.parcelleId}</CardTitle>
                    <Badge variant="secondary">{parcelle.culture}</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {parcelle.gps[0]?.latitude.toFixed(4)}, {parcelle.gps[0]?.longitude.toFixed(4)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <TreePine className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Culture</p>
                        <p className="text-sm font-medium">{parcelle.culture}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <AreaChart className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Surface</p>
                        <p className="text-sm font-medium">{parcelle.surface} ha</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
