import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  AssetHistory,
  EUDRReportData,
  ShipmentReportData,
  VerifyLotPublic,
  GetCertificationsResponse,
  QueryByStatusResponse,
  QueryByFarmerResponse,
  LotStatus,
} from "@/types/api"

// ============================================================================
// GET ASSET HISTORY
// ============================================================================

export function useAssetHistory(assetHash?: string) {
  return useQuery({
    queryKey: ["audit", "history", assetHash],
    queryFn: () => api.get<AssetHistory[]>(`/api/v1/audit/history/${assetHash}`),
    enabled: !!assetHash,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// QUERY BY STATUS
// ============================================================================

export function useQueryByStatus(status?: LotStatus) {
  return useQuery({
    queryKey: ["audit", "query", "status", status],
    queryFn: () => api.get<QueryByStatusResponse>(`/api/v1/audit/query/status/${status}`),
    enabled: !!status,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// ============================================================================
// QUERY BY FARMER
// ============================================================================

export function useQueryByFarmer(farmerId?: string) {
  return useQuery({
    queryKey: ["audit", "query", "farmer", farmerId],
    queryFn: () => api.get<QueryByFarmerResponse>(`/api/v1/audit/query/farmer/${farmerId}`),
    enabled: !!farmerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// QUERY BY OWNER
// ============================================================================

export function useQueryByOwner(ownerId?: string) {
  return useQuery({
    queryKey: ["audit", "query", "owner", ownerId],
    queryFn: () => api.get<QueryByFarmerResponse>(`/api/v1/audit/query/owner/${ownerId}`),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// GET CERTIFICATIONS
// ============================================================================

export function useGetCertifications(refHash?: string) {
  return useQuery({
    queryKey: ["audit", "certifications", refHash],
    queryFn: () => api.get<GetCertificationsResponse>(`/api/v1/audit/query/certifications/${refHash}`),
    enabled: !!refHash,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// EUDR REPORT (JSON)
// ============================================================================

export function useEUDRReport(lotHash?: string) {
  return useQuery({
    queryKey: ["audit", "eudr-report", lotHash],
    queryFn: () => api.get<EUDRReportData>(`/api/v1/audit/eudr-report/${lotHash}`),
    enabled: !!lotHash,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// ============================================================================
// EUDR REPORT PDF
// ============================================================================

export function useEUDRReportPDF(lotHash?: string) {
  return useQuery({
    queryKey: ["audit", "eudr-report-pdf", lotHash],
    queryFn: async () => {
      const blob = await api.get<Blob>(`/api/v1/audit/eudr-report/${lotHash}/pdf`, {
        responseType: "blob",
      })
      return URL.createObjectURL(blob)
    },
    enabled: !!lotHash,
    staleTime: Infinity, // Static PDF
  })
}

// ============================================================================
// VERIFY LOT PUBLIC
// ============================================================================

export function useVerifyLot(lotHash?: string) {
  return useQuery({
    queryKey: ["audit", "verify", lotHash],
    queryFn: () => api.get<VerifyLotPublic>(`/api/v1/audit/verify/${lotHash}`),
    enabled: !!lotHash,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// SHIPMENT REPORT (JSON)
// ============================================================================

export function useShipmentReport(shipmentHash?: string) {
  return useQuery({
    queryKey: ["audit", "shipment-report", shipmentHash],
    queryFn: () => api.get<ShipmentReportData>(`/api/v1/audit/shipment-report/${shipmentHash}`),
    enabled: !!shipmentHash,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// ============================================================================
// SHIPMENT REPORT PDF
// ============================================================================

export function useShipmentReportPDF(shipmentHash?: string) {
  return useQuery({
    queryKey: ["audit", "shipment-report-pdf", shipmentHash],
    queryFn: async () => {
      const blob = await api.get<Blob>(`/api/v1/audit/shipment-report/${shipmentHash}/pdf`, {
        responseType: "blob",
      })
      return URL.createObjectURL(blob)
    },
    enabled: !!shipmentHash,
    staleTime: Infinity, // Static PDF
  })
}
