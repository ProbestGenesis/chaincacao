"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { traceabilityService } from "@/lib/services/traceability.service"
import type {
  TransferPayload,
  TransformationPayload,
  ShipmentPayload,
  CertificationPayload,
} from "@/types/api-traceability"
import { queryKeys } from "@/lib/query-keys"

export function useShipmentReport(shipmentHash: string) {
  return useQuery({
    queryKey: ["audit", "shipment", shipmentHash],
    queryFn: () => traceabilityService.getShipmentReport(shipmentHash),
    enabled: !!shipmentHash,
  })
}

export function useLotHistory(assetHash: string) {
  return useQuery({
    queryKey: [queryKeys.history(assetHash)],
    queryFn: () => traceabilityService.getHistory(assetHash),
    enabled: !!assetHash,
  })
}

export function useLotEUDR(lotHash: string) {
  return useQuery({
    queryKey: [queryKeys.eudr(lotHash)],
    queryFn: () => traceabilityService.getEUDRReport(lotHash),
    enabled: !!lotHash,
  })
}

export function useLotVerification(lotHash: string) {
  return useQuery({
    queryKey: [queryKeys.verification(lotHash)],
    queryFn: () => traceabilityService.verifyLot(lotHash),
    enabled: !!lotHash,
  })
}

export function useAuditQueryStatus(status: string) {
  return useQuery({
    queryKey: ["audit", "status", status],
    queryFn: () => traceabilityService.queryByStatus(status),
    enabled: !!status,
  })
}

export function useAuditQueryFarmer(farmerId: string) {
  return useQuery({
    queryKey: ["audit", "farmer", farmerId],
    queryFn: () => traceabilityService.queryByFarmer(farmerId),
    enabled: !!farmerId,
  })
}

export function useAuditQueryCertifications(refHash: string) {
  return useQuery({
    queryKey: ["audit", "certifications", refHash],
    queryFn: () => traceabilityService.queryCertifications(refHash),
    enabled: !!refHash,
  })
}

export function useTraceability() {
  const queryClient = useQueryClient()

  // Mutations
  const createTransferMutation = useMutation({
    mutationFn: (payload: TransferPayload) => traceabilityService.createTransfer(payload),
    onSuccess: (response, variables) => {
      toast.success("Transfert enregistré avec succès sur la blockchain")
      if (variables.lot_hashes.length > 0) {
        queryClient.invalidateQueries({ queryKey: [queryKeys.history(variables.lot_hashes[0])] })
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Échec de l'enregistrement du transfert")
    },
  })

  const createTransformationMutation = useMutation({
    mutationFn: (payload: TransformationPayload) => traceabilityService.createTransformation(payload),
    onSuccess: (response, variables) => {
      toast.success("Transformation enregistrée avec succès sur la blockchain")
      if (variables.lot_hashes.length > 0) {
        queryClient.invalidateQueries({ queryKey: [queryKeys.history(variables.lot_hashes[0])] })
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Échec de l'enregistrement de la transformation")
    },
  })

  const createShipmentMutation = useMutation({
    mutationFn: (payload: ShipmentPayload) => traceabilityService.createShipment(payload),
    onSuccess: (response, variables) => {
      toast.success("Expédition enregistrée avec succès sur la blockchain")
      if (variables.lotHashes.length > 0) {
        queryClient.invalidateQueries({ queryKey: [queryKeys.history(variables.lotHashes[0])] })
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Échec de l'enregistrement de l'expédition")
    },
  })

  const createCertificationMutation = useMutation({
    mutationFn: (payload: CertificationPayload) => traceabilityService.createCertification(payload),
    onSuccess: () => {
      toast.success("Certification enregistrée avec succès sur la blockchain")
    },
    onError: (err: any) => {
      toast.error(err.message || "Échec de l'enregistrement de la certification")
    },
  })

  return {
    isSubmitting: 
      createTransferMutation.isPending || 
      createTransformationMutation.isPending || 
      createShipmentMutation.isPending ||
      createCertificationMutation.isPending,
    createTransfer: createTransferMutation.mutateAsync,
    createTransformation: createTransformationMutation.mutateAsync,
    createShipment: createShipmentMutation.mutateAsync,
    createCertification: createCertificationMutation.mutateAsync,
  }
}


