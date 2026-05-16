"use client"
 
import { useLotsStore } from "@/store/lots"
import { useEUDRStore } from "@/store/eudr"
import { KPICard } from "@/components/reports/kpi-card"
import { VolumeChart } from "@/components/reports/volume-chart"
import { QualityChart } from "@/components/reports/quality-chart"
import { 
  Ship, 
  ShieldCheck, 
  PackageCheck, 
  BarChart3,
  TrendingUp,
  FileText,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { traceabilityService } from "@/lib/services/traceability.service"
import { useState } from "react"
import { ChartConfig } from "@/components/ui/chart"
import { useUser } from "@/context/useUser"
 
export function ExporterReportsTab() {
  const { lots } = useLotsStore()
  const { user } = useUser()
  const { getEUDRByExporter } = useEUDRStore()
 
  const eudrRecords = user ? getEUDRByExporter(user.userId) : []
  const confirmedCount = eudrRecords.filter(r => r.status === "confirmed").length
  
  const readyToExportVolume = lots
    .filter(l => ["transformed", "verified", "transforme"].includes(l.statut?.toLowerCase()))
    .reduce((sum, l) => sum + (l.poidsKg || 0), 0)
 
  const totalExportedVolume = lots
    .filter(l => ["exported", "exporte"].includes(l.statut?.toLowerCase()))
    .reduce((sum, l) => sum + (l.poidsKg || 0), 0)
 
  const shipmentData = [
    { month: "Jan", volume: 850 },
    { month: "Feb", volume: 1100 },
    { month: "Mar", volume: 980 },
    { month: "Apr", volume: 1250 },
    { month: "May", volume: 1400 },
    { month: "Jun", volume: 1150 },
  ]
 
  const shipmentConfig = {
    volume: { label: "Volume Expédié (t)", color: "hsl(var(--primary))" },
  } satisfies ChartConfig
 
  const statusData = [
    { name: "ready", value: 45, fill: "var(--color-ready)" },
    { name: "pending", value: 30, fill: "var(--color-pending)" },
    { name: "shipped", value: 25, fill: "var(--color-shipped)" },
  ]
 
  const statusConfig = {
    ready: { label: "Prêt à l'export", color: "#10b981" },
    pending: { label: "En transformation", color: "#f59e0b" },
    shipped: { label: "Expédié / En transit", color: "#3b82f6" },
  } satisfies ChartConfig
 
  return (
    <div className="space-y-6 mt-4">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KPICard 
          title="Volume Prêt à l'Export" 
          value={(readyToExportVolume / 1000).toFixed(1)} 
          unit="t" 
          icon={PackageCheck}
          trend={{ value: "+18%", positive: true }}
          colorVariant="emerald"
        />
        <KPICard 
          title="Taux Conformité EUDR" 
          value={eudrRecords.length > 0 ? Math.round((confirmedCount / eudrRecords.length) * 100) : 0} 
          unit="%" 
          icon={ShieldCheck}
          trend={{ value: "Stable", stable: true }}
          colorVariant="blue"
        />
        <KPICard 
          title="Volume Total Expédié" 
          value={(totalExportedVolume / 1000).toFixed(1)} 
          unit="t" 
          icon={Ship}
          trend={{ value: "+5.2%", positive: true }}
          colorVariant="slate"
        />
        <KPICard 
          title="Valeur Estimée" 
          value="0" 
          unit="$" 
          icon={TrendingUp}
          trend={{ value: "+0%", positive: false }}
          colorVariant="amber"
        />
      </div>
 
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <VolumeChart 
          title="Flux d'Expédition Mensuel" 
          description="Volume des sorties internationales (Tonnage)"
          data={shipmentData}
          config={shipmentConfig}
          dataKeys={["volume"]}
        />
        <QualityChart 
          title="Répartition par Statut" 
          description="État actuel de votre inventaire de lots"
          data={statusData}
          config={statusConfig}
          centerValue="100%"
          centerLabel="Inventaire"
        />
      </div>

      {/* Shipment Report Generator */}
      <Card className="border-dashed bg-muted/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4" />
            Générateur de Rapports d'Expédition
          </CardTitle>
          <CardDescription>
            Saisissez un ID d'expédition pour générer un rapport consolidé et le PDF associé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input 
              placeholder="ID de l'expédition (ex: SHIP-2024-001)" 
              className="max-w-md bg-background"
              id="shipment-id-input"
            />
            <Button 
              className="gap-2"
              onClick={async () => {
                const input = document.getElementById("shipment-id-input") as HTMLInputElement
                const id = input?.value
                if (!id) return
                
                try {
                  const blob = await traceabilityService.getShipmentReportPdf(id)
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `Shipment_Report_${id}.pdf`
                  document.body.appendChild(a)
                  a.click()
                  window.URL.revokeObjectURL(url)
                  document.body.removeChild(a)
                } catch (error) {
                  alert("Erreur lors de la génération du rapport d'expédition.")
                }
              }}
            >
              <Download className="size-4" />
              Générer PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
