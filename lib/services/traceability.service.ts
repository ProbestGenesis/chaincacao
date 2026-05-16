import { api } from "@/lib/api"
import type {
  HistoryEntry,
  EUDRReport,
  TransferPayload,
  TransformationPayload,
  ShipmentPayload,
  VerificationResponse,
  AuditQueryResponse,
  CertificationPayload,
  ShipmentReport,
} from "@/types/api-traceability"

export const traceabilityService = {
  getHistory: (assetHash: string) => 
    api.get<HistoryEntry[]>(`/api/v1/audit/history/${assetHash}`),
    
  verifyLot: (lotHash: string) => 
    api.get<VerificationResponse>(`/api/v1/audit/verify/${lotHash}`),
    
  getEUDRReport: (lotHash: string) => 
    api.get<EUDRReport>(`/api/v1/audit/eudr-report/${lotHash}`),

  queryByStatus: (status: string) =>
    api.get<AuditQueryResponse>(`/api/v1/audit/query/status/${status}`),

  queryByFarmer: (farmerId: string) =>
    api.get<AuditQueryResponse>(`/api/v1/audit/query/farmer/${farmerId}`),

  queryByOwner: (ownerId: string) =>
    api.get<AuditQueryResponse>(`/api/v1/audit/query/owner/${ownerId}`),

  queryCertifications: (refHash: string) =>
    api.get<AuditQueryResponse>(`/api/v1/audit/query/certifications/${refHash}`),
    
  createCertification: (payload: CertificationPayload) =>
    api.post<any>("/api/v1/audit/certifications", payload),

  getEUDRReportPdf: (lotHash: string) =>
    api.get<Blob>(`/api/v1/audit/eudr-report/${lotHash}/pdf`, { responseType: "blob" }),

  getShipmentReport: (shipmentHash: string) =>
    api.get<ShipmentReport>(`/api/v1/audit/shipment-report/${shipmentHash}`),

  getShipmentReportPdf: (shipmentHash: string) =>
    api.get<Blob>(`/api/v1/audit/shipment-report/${shipmentHash}/pdf`, { responseType: "blob" }),

  createTransfer: (payload: TransferPayload) => {
    const formData = new FormData()
    formData.append("transferHash", payload.transferHash)
    formData.append("lotHashes", JSON.stringify(payload.lotHashes))
    formData.append("expediteurId", payload.expediteurId)
    if (payload.expediteurName) formData.append("expediteurName", payload.expediteurName)
    formData.append("destinataireId", payload.destinataireId)
    if (payload.destinataireName) formData.append("destinataireName", payload.destinataireName)
    if (payload.transporteurId) formData.append("transporteurId", payload.transporteurId)
    formData.append("file", payload.file)
    return api.post<any>("/api/v1/traceability/transfers", formData, { isFormData: true })
  },
    
  createTransformation: (payload: TransformationPayload) => {
    const formData = new FormData()
    formData.append("transformationHash", payload.transformationHash)
    formData.append("lotHashes", JSON.stringify(payload.lotHashes))
    formData.append("typeProcessus", payload.typeProcessus)
    formData.append("file", payload.file)
    return api.post<any>("/api/v1/traceability/transformations", formData, { isFormData: true })
  },
    
  createShipment: (payload: ShipmentPayload) => {
    const formData = new FormData()
    formData.append("shipmentHash", payload.shipmentHash)
    formData.append("lotHashes", JSON.stringify(payload.lotHashes))
    formData.append("exportateurId", payload.exportateurId)
    formData.append("destination", payload.destination)
    formData.append("dateDepartPrevue", payload.dateDepartPrevue)
    formData.append("dateArriveePrevue", payload.dateArriveePrevue)
    formData.append("file", payload.file)
    return api.post<any>("/api/v1/traceability/shipments", formData, { isFormData: true })
  },
}
