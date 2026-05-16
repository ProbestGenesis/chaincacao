"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, MapPin, Calendar, FileText, CheckCircle2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { EUDRReport } from "@/types/api-traceability"
import { traceabilityService } from "@/lib/services/traceability.service"
import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface EUDRReportViewProps {
  report: EUDRReport | null
  isLoading?: boolean
}

export function EUDRReportView({ report, isLoading }: EUDRReportViewProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadPdf = async () => {
    if (!report) return
    setIsDownloading(true)
    try {
      const lotHash = report.data.lot.lotHash || report.proof_hash
      const blob = await traceabilityService.getEUDRReportPdf(lotHash)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `EUDR_Report_${lotHash}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Failed to download PDF:", error)
      alert("Erreur lors du téléchargement du PDF.")
    } finally {
      setIsDownloading(false)
    }
  }
  if (isLoading) {
    return <div className="h-64 w-full bg-muted animate-pulse rounded-lg" />
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
        <FileText className="size-8 mb-2 opacity-20" />
        <p>Sélectionnez un lot pour générer son rapport de conformité EUDR.</p>
      </div>
    )
  }

  const isCompliant = report.compliance_status === "COMPLIANT"

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card className={isCompliant ? "border-emerald-200 bg-emerald-50/50" : "border-destructive/20 bg-destructive/5"}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isCompliant ? (
                <ShieldCheck className="size-8 text-emerald-600" />
              ) : (
                <ShieldAlert className="size-8 text-destructive" />
              )}
              <div>
                <h3 className="text-lg font-bold">
                  Statut de Conformité EUDR : {isCompliant ? "CONFORME" : "NON CONFORME"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Généré le {format(new Date(report.report_timestamp), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={isCompliant ? "bg-emerald-600" : "bg-destructive"}>
                {report.compliance_status}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-2"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
              >
                <Download className="size-3" />
                {isDownloading ? "..." : "PDF"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Origin & Traceability */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              Origine & Géolocalisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ID du Lot :</span>
              <span className="font-mono font-medium">{report.proof_hash}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Coordonnées GPS :</span>
              <span className="font-medium">
                {report.data.lot.gps?.latitude}, {report.data.lot.gps?.longitude}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Niveau d'accès :</span>
              <Badge variant="outline">{report.access_level}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="size-4 text-muted-foreground" />
              Certifications & Preuves
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.data.certifications.length > 0 ? (
              report.data.certifications.map((cert, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    <span className="font-medium">{cert.type || "Certification"}</span>
                  </div>
                  <span className="text-muted-foreground">Valide</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">Aucune certification additionnelle détectée.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Blockchain Proof */}
      <div className="p-4 rounded-lg bg-muted/30 border text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Preuve Cryptographique (Blockchain Hash)</p>
        <p className="text-xs font-mono break-all text-muted-foreground/80">{report.proof_hash}</p>
      </div>
    </div>
  )
}
