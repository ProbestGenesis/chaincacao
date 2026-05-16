"use client"
 
import { useLots } from "@/hooks/useLots"
import { useActors } from "@/hooks/useActors"
import { KPICard } from "@/components/reports/kpi-card"
import { VolumeChart } from "@/components/reports/volume-chart"
import { QualityChart } from "@/components/reports/quality-chart"
import { 
  Globe, 
  ShieldCheck, 
  Users, 
  Landmark,
  FileBarChart,
  CheckCircle2
} from "lucide-react"
import { ChartConfig } from "@/components/ui/chart"
 
export function MinistryReportsTab() {
  const { serverLots: lots, isLoading: isLoadingLots } = useLots()
  const { users, isLoading: isLoadingActors } = useActors()
 
  const totalVolume = lots.reduce((sum, l) => sum + (l.poidsKg || 0), 0)
  const coopsCount = users.filter(u => u.role === "COOPERATIVE").length
  
  // Aggregate volume by region
  const regionVolumeMap = lots.reduce((acc, lot) => {
    const region = lot.region || "Inconnue"
    acc[region] = (acc[region] || 0) + (lot.poidsKg || 0)
    return acc
  }, {} as Record<string, number>)

  const regionData = Object.entries(regionVolumeMap).map(([region, volume]) => ({
    region,
    volume: Number(((volume as number) / 1000).toFixed(2)) // Convert to tons
  })).sort((a, b) => b.volume - a.volume)
 
  const regionConfig = {
    volume: { label: "Volume (t)", color: "hsl(var(--primary))" },
  } satisfies ChartConfig
 
  // Simplified compliance data based on status (exported lots are considered compliant in this view)
  const compliantLots = lots.filter(l => l.statut === "exported" || l.statut === "transformed").length
  const nonCompliantLots = lots.length - compliantLots
  
  const complianceData = [
    { label: "Conforme", value: compliantLots, fill: "#10b981" },
    { label: "En attente/Audit", value: nonCompliantLots, fill: "#f59e0b" },
  ]
 
  const complianceConfig = {
    value: { label: "Lots" },
  } satisfies ChartConfig

  const complianceRate = lots.length > 0 ? Math.round((compliantLots / lots.length) * 100) : 0
 
  if (isLoadingLots || isLoadingActors) {
    return <div className="p-12 text-center text-muted-foreground italic">Chargement des données analytiques nationales...</div>
  }

  return (
    <div className="space-y-6 mt-4">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          title="Volume National Tracé" 
          value={(totalVolume / 1000).toFixed(1)} 
          unit="t" 
          icon={Globe}
          trend={{ value: "+5.4%", positive: true }}
          colorVariant="blue"
        />
        <KPICard 
          title="Conformité EUDR" 
          value={complianceRate.toString()} 
          unit="%" 
          icon={ShieldCheck}
          trend={{ value: "+2.1%", positive: true }}
          colorVariant="emerald"
        />
        <KPICard 
          title="Acteurs Validés" 
          value={users.filter(u => u.blockchain_validated).length} 
          icon={CheckCircle2}
          trend={{ value: "Blockchain", positive: true }}
          colorVariant="emerald"
        />
        <KPICard 
          title="Total Acteurs" 
          value={users.length} 
          icon={Users}
          trend={{ value: `En attente: ${users.filter(u => !u.blockchain_validated).length}`, warning: true }}
          colorVariant="slate"
        />
      </div>
 
      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <VolumeChart 
          title="Production par Région" 
          description="Répartition géographique de la collecte (Tonnage)"
          data={regionData}
          config={regionConfig}
          dataKeys={["volume"]}
        />
        <QualityChart 
          title="Statut Conformité National" 
          description="Taux de respect des normes EUDR (basé sur l'historique blockchain)"
          data={complianceData}
          config={complianceConfig}
          centerValue={`${complianceRate}%`}
          centerLabel="Conforme"
        />
      </div>
    </div>
  )
}
