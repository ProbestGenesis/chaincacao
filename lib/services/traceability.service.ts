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

  createTransfer: (payload: TransferPayload) => 
    api.post<any>("/api/v1/traceability/transfers", payload),
    
  createTransformation: (payload: TransformationPayload) => 
    api.post<any>("/api/v1/traceability/transformations", payload),
    
  createShipment: (payload: ShipmentPayload) => 
    api.post<any>("/api/v1/traceability/shipments", payload),
}
