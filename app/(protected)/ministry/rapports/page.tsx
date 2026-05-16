"use client"

import { useLots } from "@/hooks/useLots"
import { useActors } from "@/hooks/useActors"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, PieChart, FileText, Download, TrendingUp, Users, Globe } from "lucide-react"

export default function MinistryRapportsPage() {
  const { serverLots: lots, loadLots, isLoading: isLoadingLots } = useLots()
  const { users, loadUsers, isLoading: isLoadingActors } = useActors()

  useEffect(() => {
    loadLots()
    loadUsers()
  }, [loadLots, loadUsers])

  const totalLots = lots.length
  const totalWeight = lots.reduce((sum, l) => sum + (l.poidsKg || 0), 0)
  const exportedWeight = lots.filter(l => l.statut === "exported").reduce((sum, l) => sum + (l.poidsKg || 0), 0)

  // Aggregate volume by region for percentages
  const regionVolumeMap = lots.reduce((acc, lot) => {
    const region = lot.region || "Inconnue"
    acc[region] = (acc[region] || 0) + (lot.poidsKg || 0)
    return acc
  }, {} as Record<string, number>)

  const totalVol = (Object.values(regionVolumeMap) as number[]).reduce((a, b) => a + b, 0)
  const regionDist = Object.entries(regionVolumeMap)
    .map(([label, vol]) => ({
      label,
      value: totalVol > 0 ? Math.round(((vol as number) / totalVol) * 100) : 0
    }))
    .sort((a, b) => b.value - a.value)

  const colors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-slate-500", "bg-blue-500"]

  if (isLoadingLots || isLoadingActors) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20 w-1/2 rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Rapports & Statistiques</h1>
            <p className="text-muted-foreground mt-1">Analyse globale de la production et des exportations nationales.</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 rounded-xl">
          <Download className="h-4 w-4" />
          Exporter les données CSV
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between opacity-80 mb-4">
              <p className="text-sm font-medium uppercase tracking-wider text-indigo-100">Volume Total Tracé</p>
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold">{(totalWeight / 1000).toFixed(1)} T</p>
            <p className="text-xs mt-2 opacity-70">Basé sur {totalLots} lots enregistrés</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between opacity-80 mb-4">
              <p className="text-sm font-medium uppercase tracking-wider text-emerald-100">Volume Exporté</p>
              <Globe className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold">{(exportedWeight / 1000).toFixed(1)} T</p>
            <p className="text-xs mt-2 opacity-70">{Math.round((exportedWeight/totalWeight)*100 || 0)}% du volume total national</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-700 text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between opacity-80 mb-4">
              <p className="text-sm font-medium uppercase tracking-wider text-amber-100">Acteurs de la Filière</p>
              <Users className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold">{users.length.toLocaleString()}</p>
            <p className="text-xs mt-2 opacity-70">Producteurs, Coopératives et Industriels</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Répartition de la Production par Région
            </CardTitle>
            <CardDescription>Poids relatif de chaque zone géographique</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {regionDist.length > 0 ? (
                regionDist.slice(0, 5).map((item, index) => (
                  <RegionProgress 
                    key={item.label} 
                    label={item.label} 
                    value={item.value} 
                    color={colors[index % colors.length]} 
                  />
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">Aucune donnée régionale disponible</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Conformité & Rapports EUDR
            </CardTitle>
            <CardDescription>Derniers rapports de conformité générés sur la blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-center py-8 text-muted-foreground">Aucune donnée disponible</p>
              {/* <ReportItem title="Rapport de Conformité National EUDR" date="Mai 2026" />
              <ReportItem title="Analyse de Déforestation - Zone Ouest" date="Mai 2026" />
              <ReportItem title="Statistiques d'Exportation - T2 2026" date="Avril 2026" />
              <ReportItem title="Audit de Traçabilité Transfrontalière" date="Mars 2026" /> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RegionProgress({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-foreground/80">{label}</span>
        <span className="text-muted-foreground font-medium">{value}%</span>
      </div>
      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function ReportItem({ title, date }: { title: string, date: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border bg-card hover:bg-muted/30 transition-all hover:shadow-md group">
      <div className="min-w-0 flex items-center gap-3">
        <div className="bg-primary/5 p-2 rounded-lg group-hover:bg-primary/10 transition-colors">
          <FileText className="size-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm truncate">{title}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{date}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="shrink-0 rounded-full">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  )
}
