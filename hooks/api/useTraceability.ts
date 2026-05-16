import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  CreateTransferRequest,
  CreateTransformationRequest,
  CreateShipmentRequest,
  TransferEvent,
  ShipmentDetail,
} from "@/types/api"

// ============================================================================
// CREATE TRANSFER
// ============================================================================

export function useCreateTransferMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTransferRequest) => {
      return api.post<TransferEvent>("/api/v1/traceability/transfers", data)
    },
    onSuccess: () => {
      // Invalidate audit and lot queries
      queryClient.invalidateQueries({ queryKey: ["audit"] })
      queryClient.invalidateQueries({ queryKey: ["lots"] })
      queryClient.invalidateQueries({ queryKey: ["traceability", "transfers"] })
    },
  })
}

// ============================================================================
// GET TRANSFER
// ============================================================================

export function useTransferDetails(transferHash?: string) {
  return useQuery({
    queryKey: ["traceability", "transfers", transferHash],
    queryFn: () => api.get<TransferEvent>(`/api/v1/traceability/transfers/${transferHash}`),
    enabled: !!transferHash,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// GET USER TRANSFERS
// ============================================================================

export function useUserTransfers(userId?: string) {
  return useQuery({
    queryKey: ["traceability", "transfers", "user", userId],
    queryFn: () => api.get<TransferEvent[]>(`/api/v1/traceability/transfers/user/${userId}`),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// ============================================================================
// CREATE TRANSFORMATION
// ============================================================================

export function useCreateTransformationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTransformationRequest) => {
      return api.post("/api/v1/traceability/transformations", data)
    },
    onSuccess: () => {
      // Invalidate audit and lot queries
      queryClient.invalidateQueries({ queryKey: ["audit"] })
      queryClient.invalidateQueries({ queryKey: ["lots"] })
      queryClient.invalidateQueries({ queryKey: ["traceability", "transformations"] })
    },
  })
}

// ============================================================================
// GET TRANSFORMATION
// ============================================================================

export function useTransformationDetails(transformationHash?: string) {
  return useQuery({
    queryKey: ["traceability", "transformations", transformationHash],
    queryFn: () => api.get(`/api/v1/traceability/transformations/${transformationHash}`),
    enabled: !!transformationHash,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// CREATE SHIPMENT
// ============================================================================

export function useCreateShipmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateShipmentRequest) => {
      return api.post<ShipmentDetail>("/api/v1/traceability/shipments", data)
    },
    onSuccess: () => {
      // Invalidate audit and lot queries
      queryClient.invalidateQueries({ queryKey: ["audit"] })
      queryClient.invalidateQueries({ queryKey: ["lots"] })
      queryClient.invalidateQueries({ queryKey: ["traceability", "shipments"] })
    },
  })
}

// ============================================================================
// GET SHIPMENT
// ============================================================================

export function useShipmentDetails(shipmentHash?: string) {
  return useQuery({
    queryKey: ["traceability", "shipments", shipmentHash],
    queryFn: () => api.get<ShipmentDetail>(`/api/v1/traceability/shipments/${shipmentHash}`),
    enabled: !!shipmentHash,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
