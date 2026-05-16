"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuditQueryStatus, useAuditQueryFarmer, useAuditQueryCertifications, useShipmentReport, useAuditQueryOwner } from "@/hooks/useTraceability"
import { Download } from "lucide-react"
import { traceabilityService } from "@/lib/services/traceability.service"
import { usePermission } from "@/hooks/usePermission"

type SearchType = "status" | "farmer" | "certifications" | "shipment" | "owner"

interface AuditQueryPanelProps {
  initialSearch?: {
    type: SearchType
    value: string
  }
}

export function AuditQueryPanel({ initialSearch }: AuditQueryPanelProps) {
  const can = usePermission()
  const [searchType, setSearchType] = useState<SearchType>(initialSearch?.type || "status")
  const [inputValue, setInputValue] = useState(initialSearch?.value || "")
  const [activeSearch, setActiveSearch] = useState<{ type: SearchType; value: string } | null>(
    initialSearch?.value ? { type: initialSearch.type, value: initialSearch.value } : null
  )

  // Trigger search if initialSearch changes
  useEffect(() => {
    if (initialSearch?.value) {
      setSearchType(initialSearch.type)
      setInputValue(initialSearch.value)
      setActiveSearch({ type: initialSearch.type, value: initialSearch.value })
    }
  }, [initialSearch])

  const handleSearch = () => {
    if (!inputValue) return
    setActiveSearch({ type: searchType, value: inputValue })
  }

  const { data: statusData, isLoading: isStatusLoading } = useAuditQueryStatus(
    activeSearch?.type === "status" ? activeSearch.value : ""
  )
  const { data: farmerData, isLoading: isFarmerLoading } = useAuditQueryFarmer(
    activeSearch?.type === "farmer" ? activeSearch.value : ""
  )
  const { data: certData, isLoading: isCertLoading } = useAuditQueryCertifications(
    activeSearch?.type === "certifications" ? activeSearch.value : ""
  )
  const { data: shipmentData, isLoading: isShipmentLoading } = useShipmentReport(
    activeSearch?.type === "shipment" ? activeSearch.value : ""
  )
  const { data: ownerData, isLoading: isOwnerLoading } = useAuditQueryOwner(
    activeSearch?.type === "owner" ? activeSearch.value : ""
  )

  const isLoading = isStatusLoading || isFarmerLoading || isCertLoading || isShipmentLoading || isOwnerLoading
  const responseData =
    activeSearch?.type === "status"
      ? statusData
      : activeSearch?.type === "farmer"
      ? farmerData
      : activeSearch?.type === "certifications"
      ? certData
      : activeSearch?.type === "owner"
      ? ownerData
      : shipmentData

  const results = Array.isArray(responseData) ? responseData : (responseData && 'data' in responseData ? responseData.data : [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recherche d'Audit Avancée</CardTitle>
        <CardDescription>
          Interrogez directement la blockchain pour retrouver des lots selon différents critères.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={searchType}
            onValueChange={(val: SearchType) => {
              setSearchType(val)
              setInputValue("")
              setActiveSearch(null)
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Type de recherche" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Par Statut</SelectItem>
              {can.check("audit:query_farmer") && (
                <SelectItem value="farmer">Par ID Producteur</SelectItem>
              )}
              <SelectItem value="certifications">Par Réf. Certification</SelectItem>
              <SelectItem value="shipment">Rapport d'Expédition (ID)</SelectItem>
              <SelectItem value="owner">Par Détenteur (Owner ID)</SelectItem>
            </SelectContent>
          </Select>

          {searchType === "status" ? (
            <Select value={inputValue} onValueChange={setInputValue}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sélectionnez un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COLLECTE">Collecté</SelectItem>
                <SelectItem value="EN_TRANSIT">En Transit</SelectItem>
                <SelectItem value="TRANSFORME">Transformé</SelectItem>
                <SelectItem value="EXPORTE">Exporté</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              placeholder={
                searchType === "farmer"
                  ? "Ex: FARMER-001"
                  : searchType === "certifications"
                  ? "Ex: CERT-ABC-123"
                  : searchType === "owner"
                  ? "Ex: OWNER-ABC"
                  : "Ex: SHIP-XYZ-789"
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          )}

          <Button onClick={handleSearch} disabled={!inputValue || isLoading} className="gap-2">
            <Search className="h-4 w-4" />
            {isLoading ? "Recherche..." : "Rechercher"}
          </Button>
        </div>

        {activeSearch && activeSearch.type !== "shipment" && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {activeSearch.type === "certifications" ? (
                  <TableRow>
                    <TableHead>ID Certif</TableHead>
                    <TableHead>Vérificateur</TableHead>
                    <TableHead>Score ESG</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Rapport</TableHead>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableHead>Lot ID</TableHead>
                    <TableHead>Espèce</TableHead>
                    <TableHead>Poids (kg)</TableHead>
                    <TableHead>Producteur</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                )}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Chargement des résultats depuis la blockchain...
                    </TableCell>
                  </TableRow>
                ) : results && results.length > 0 ? (
                  results.map((item: any, idx: number) => {
                    if (activeSearch.type === "certifications") {
                      return (
                        <TableRow key={item.certHash || item.txId || idx}>
                          <TableCell className="font-mono text-xs font-medium">
                            {item.certHash || item.id || "—"}
                          </TableCell>
                          <TableCell className="text-xs">{item.verificateurId || "—"}</TableCell>
                          <TableCell>
                            {item.metadata?.esgScore ? (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                {item.metadata.esgScore}/100
                              </Badge>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.timestamp || item.certification_date || item.date 
                              ? new Date(item.timestamp || item.certification_date || item.date).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.statut === "CONFORME" ? "default" : "outline"} className="capitalize">
                              {item.statut || "—"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={async () => {
                                try {
                                  const lotHash = item.refHash || item.lotHash
                                  if (!lotHash) return
                                  const blob = await traceabilityService.getEUDRReportPdf(lotHash)
                                  const url = window.URL.createObjectURL(blob)
                                  const a = document.createElement("a")
                                  a.href = url
                                  a.download = `EUDR_Report_${lotHash}.pdf`
                                  document.body.appendChild(a)
                                  a.click()
                                  window.URL.revokeObjectURL(url)
                                  document.body.removeChild(a)
                                } catch (e) {
                                  console.error("EUDR Download failed", e)
                                }
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    }

                    return (
                      <TableRow key={item.lotHash || item.id || idx}>
                        <TableCell className="font-mono text-xs font-medium">
                          {item.lotHash || item.lotId || item.id}
                        </TableCell>
                        <TableCell>{item.espece}</TableCell>
                        <TableCell>{item.poidsKg}</TableCell>
                        <TableCell>{item.farmerId}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.statut}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucun résultat ne correspond à vos critères de recherche.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {activeSearch && activeSearch.type === "shipment" && shipmentData && (
          <div className="space-y-4">
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold">Rapport d'Expédition : {activeSearch.value}</h4>
                    <p className="text-sm text-muted-foreground">
                      Généré le {new Date(shipmentData.report_timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2"
                    onClick={async () => {
                      const blob = await traceabilityService.getShipmentReportPdf(activeSearch.value)
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `Shipment_Report_${activeSearch.value}.pdf`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    }}
                  >
                    <Download className="size-4" />
                    PDF
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 rounded bg-background border">
                    <p className="text-[10px] text-muted-foreground uppercase">Lots inclus</p>
                    <p className="text-xl font-bold">{shipmentData.lots.length}</p>
                  </div>
                  <div className="p-3 rounded bg-background border">
                    <p className="text-[10px] text-muted-foreground uppercase">Preuve Blockchain</p>
                    <p className="text-xs font-mono truncate">{shipmentData.proof_hash}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
