"use client"
 
import { useLotsStore } from "@/store/lots"
import { useActors } from "@/hooks/useActors"
import { KPICard } from "@/components/reports/kpi-card"
import { VolumeChart } from "@/components/reports/volume-chart"
import { QualityChart } from "@/components/reports/quality-chart"
import { 
  Tractor, 
  Scale, 
  BadgeDollarSign, 
  Users, 
  Download,
  Calendar as CalendarIcon,
  Filter,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChartConfig } from "@/components/ui/chart"
import { normalizeRole } from "@/lib/navigation/role-config"
 
export function CoopReportsTab() {
  const { lots } = useLotsStore()
  const { users } = useActors()
 
  const producers = users.filter(u => normalizeRole(u.role) === "Agriculteur")
  const totalVolume = lots.reduce((sum, l) => sum + (l.poidsKg || 0), 0)
  
  // Mock monthly data (in a real app, this would come from an API or be aggregated by date)
  const monthlyData: any[] = []
 
  const volumeConfig = {
    cacao: { label: "Cacao", color: "hsl(var(--primary))" },
    cafe: { label: "Café", color: "hsl(var(--muted-foreground))" },
  } satisfies ChartConfig
 
  const qualityData: any[] = []
 
  const qualityConfig = {
    gradeA: { label: "Grade A (Premium)", color: "#f59e0b" },
    gradeB: { label: "Grade B (Standard)", color: "#94a3b8" },
    gradeC: { label: "Grade C (Refus)", color: "#e2e8f0" },
  } satisfies ChartConfig
 
  const recentReports: any[] = []
 
  return (
    <div className="space-y-6 mt-4">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="size-4" />
            Jan 2024 - Jun 2024
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="size-4" />
            Tous les produits
          </Button>
        </div>
        <Button variant="default" size="sm" className="gap-2 bg-amber-500 hover:bg-amber-600 text-white border-none">
          <Download className="size-4" />
          Exporter le Rapport Global
        </Button>
      </div>
 
      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KPICard 
          title="Volume Total Exporté" 
          value={(totalVolume / 1000).toFixed(1)} 
          unit="t" 
          icon={Tractor}
          trend={{ value: "+12.5%", positive: true }}
          colorVariant="emerald"
        />
        <KPICard 
          title="Qualité Moyenne" 
          value="Grade A" 
          icon={Scale}
          trend={{ value: "Stable", stable: true }}
          colorVariant="amber"
        />
        <KPICard 
          title="Revenue Genéré" 
          value="0FCFA" 
          icon={BadgeDollarSign}
          trend={{ value: " 0 FCFA", positive: true }}
          colorVariant="blue"
        />
        <KPICard 
          title="Producteurs Actifs" 
          value={producers.length} 
          icon={Users}
          trend={{ value: "0", positive: true }}
          colorVariant="slate"
        />
      </div>
 
      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <VolumeChart 
          title="Volume de Réception" 
          description="Tonnage mensuel consolidé (Cacao & Café)"
          data={monthlyData}
          config={volumeConfig}
          dataKeys={["cacao", "cafe"]}
        />
        <QualityChart 
          title="Qualité des Lots" 
          description="Répartition par grade de certification"
          data={qualityData}
          config={qualityConfig}
          centerValue="68%"
          centerLabel="Grade A"
        />
      </div>
 
      {/* Recent Reports Table */}
      <div className="rounded-xl border shadow-sm bg-white overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-bold">Rapports Récents</h3>
          <Button variant="link" size="sm" className="text-amber-600">Voir tout l'historique</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>NOM DU RAPPORT</TableHead>
              <TableHead>TYPE</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>STATUT</TableHead>
              <TableHead className="text-right">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
                      <FileText className="size-4" />
                    </div>
                    {report.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{report.type}</TableCell>
                <TableCell>{report.date}</TableCell>
                <TableCell>
                  <Badge variant={report.status === "VALIDÉ" ? "default" : "secondary"} className={report.status === "VALIDÉ" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}>
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="gap-2 text-amber-700">
                    <Download className="size-4" />
                    Télécharger PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
