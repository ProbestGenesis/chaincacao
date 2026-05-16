"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLots } from "@/hooks/useLots"
import { useActors } from "@/hooks/useActors"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Users, 
  Package, 
  ShieldCheck, 
  ArrowUpRight, 
  FileText, 
  LayoutDashboard,
  Truck,
  Activity
} from "lucide-react"

export function MinistryDashboard() {
  const { serverLots, loadLots, isLoading: isLoadingLots } = useLots()
  const { users, loadUsers, isLoading: isLoadingActors } = useActors()

  useEffect(() => {
    loadLots()
    loadUsers()
  }, [loadLots, loadUsers])

  const totalLots = serverLots.length
  const totalShipments = serverLots.filter(l => l.statut === "exported").length
  const compliantLots = serverLots.filter(l => l.statut === "exported" || l.statut === "transformed").length
  const complianceRate = totalLots > 0 ? Math.round((compliantLots / totalLots) * 100) : 100

  const isLoading = isLoadingLots || isLoadingActors

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
            Tableau de Bord Ministériel
          </h1>
          <p className="text-muted-foreground mt-1">
            Supervision nationale de la traçabilité et de la conformité EUDR.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="rounded-2xl shadow-sm">
            <Link href="/ministry/management" className="gap-2">
              <Users className="size-4" />
              Gérer les acteurs
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-2xl bg-background/50 backdrop-blur-sm">
            <Link href="/ministry/rapports" className="gap-2">
              <FileText className="size-4" />
              Rapports analytiques
            </Link>
          </Button>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <KPICard 
          title="Lots Nationaux" 
          value={totalLots} 
          icon={Package} 
          isLoading={isLoading} 
          description="lots enregistrés sur le ledger"
        />
        <KPICard 
          title="Expéditions" 
          value={totalShipments} 
          icon={Truck} 
          isLoading={isLoading} 
          description="convois vers l'international"
        />
        <KPICard 
          title="Conformité" 
          value={`${complianceRate}%`} 
          icon={ShieldCheck} 
          isLoading={isLoading} 
          description="taux de conformité EUDR"
          color="text-emerald-600 dark:text-emerald-500"
        />
        <KPICard 
          title="Acteurs" 
          value={users.length} 
          icon={Users} 
          isLoading={isLoading} 
          description="professionnels certifiés"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity / Status */}
        <Card className="lg:col-span-2 rounded-3xl border-muted/40 shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="size-5 text-primary" />
                  Activités Système
                </CardTitle>
                <CardDescription>Flux de données blockchain en temps réel</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">Voir tout</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4 flex gap-4 items-center">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))
              ) : serverLots.length > 0 ? (
                serverLots.slice(0, 5).map((lot) => (
                  <div key={lot.lotId} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                        <Package className="size-5" />
                      </div>
                      <div>
                        <p className="font-mono text-xs font-bold">{lot.lotId}</p>
                        <p className="text-xs text-muted-foreground">{lot.espece} • {lot.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={lot.statut} />
                      <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">Aucun lot récent trouvé.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-primary/20 bg-primary/[0.02] shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Résumé EUDR</CardTitle>
              <CardDescription>Conformité réglementaire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Validés</span>
                <span className="font-bold text-emerald-600">{compliantLots}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${complianceRate}%` }} 
                />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                Note: Les lots "validés" incluent ceux ayant terminé le cycle de transformation ou d'exportation avec succès sur la blockchain.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-muted/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Supervision</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/ministry/management" className="p-4 rounded-2xl border bg-muted/20 hover:bg-muted/40 transition-colors text-center space-y-2">
                  <div className="size-8 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="size-4 text-primary" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider">Acteurs</p>
                </Link>
                <Link href="/all-lots" className="p-4 rounded-2xl border bg-muted/20 hover:bg-muted/40 transition-colors text-center space-y-2">
                  <div className="size-8 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="size-4 text-primary" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider">Lots</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, icon: Icon, isLoading, description, color = "text-foreground" }: any) {
  return (
    <Card className="rounded-3xl border-muted/40 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-[10px] uppercase font-bold tracking-widest">{title}</CardDescription>
          <div className="size-8 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center">
            <Icon className="size-4 text-primary dark:text-primary-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold tracking-tighter ${color}`}>
          {isLoading ? <Skeleton className="h-9 w-16" /> : value}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string, color: string }> = {
    draft: { label: "Brouillon", color: "bg-slate-100 text-slate-800" },
    pending: { label: "Collecte", color: "bg-amber-100 text-amber-800 border-amber-200" },
    transferred: { label: "Transféré", color: "bg-blue-100 text-blue-800 border-blue-200" },
    transformed: { label: "Transformé", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    exported: { label: "Exporté", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  }

  const s = config[status] || { label: status, color: "bg-gray-100 text-gray-800" }

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${s.color}`}>
      {s.label}
    </span>
  )
}
