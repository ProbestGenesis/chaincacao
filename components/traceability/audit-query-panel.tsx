"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuditQueryStatus, useAuditQueryFarmer, useAuditQueryCertifications, useShipmentReport } from "@/hooks/useTraceability"
import { Download } from "lucide-react"
import { traceabilityService } from "@/lib/services/traceability.service"
import { usePermission } from "@/hooks/usePermission"

type SearchType = "status" | "farmer" | "certifications" | "shipment"

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

  const isLoading = isStatusLoading || isFarmerLoading || isCertLoading || isShipmentLoading
  const responseData =
    activeSearch?.type === "status"
      ? statusData
      : activeSearch?.type === "farmer"
      ? farmerData
      : activeSearch?.type === "certifications"
      ? certData
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
                <TableRow>
                  <TableHead>Lot ID</TableHead>
                  <TableHead>Espèce</TableHead>
                  <TableHead>Poids (kg)</TableHead>
                  <TableHead>Producteur</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Chargement des résultats depuis la blockchain...
                    </TableCell>
                  </TableRow>
                ) : results && results.length > 0 ? (
                  results.map((lot: any) => (
                    <TableRow key={lot.lotHash}>
                      <TableCell className="font-mono text-xs font-medium">
                        {lot.lotHash}
                      </TableCell>
                      <TableCell>{lot.espece}</TableCell>
                      <TableCell>{lot.poidsKg}</TableCell>
                      <TableCell>{lot.farmerId}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {lot.statut}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucun lot ne correspond à vos critères de recherche.
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
