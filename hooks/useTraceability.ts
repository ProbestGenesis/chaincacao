"use client"

import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query"
import { toast } from "sonner"
import { traceabilityService } from "@/lib/services/traceability.service"
import type {
  TransferPayload,
  TransformationPayload,
  ShipmentPayload,
  CertificationPayload,
} from "@/types/api-traceability"
import { queryKeys } from "@/lib/query-keys"

const withSingleLotHash = <
  T extends {
    lotHashes: string[]
    transferHash?: string
    transformationHash?: string
    shipmentHash?: string
  },
>(
  payload: T,
  lotHash: string,
  index: number
): T => ({
  ...payload,
  lotHashes: [lotHash],
  transferHash: payload.transferHash
    ? `${payload.transferHash}-${index}`
    : payload.transferHash,
  transformationHash: payload.transformationHash
    ? `${payload.transformationHash}-${index}`
    : payload.transformationHash,
  shipmentHash: payload.shipmentHash
    ? `${payload.shipmentHash}-${index}`
    : payload.shipmentHash,
})

const submitPerLotHash = async <T extends { lotHashes: string[] }, R>(
  payload: T,
  submit: (singleLotPayload: T) => Promise<R>
) => {
  const uniqueLotHashes = Array.from(new Set(payload.lotHashes))

  return Promise.all(
    uniqueLotHashes.map((lotHash, index) =>
      submit(withSingleLotHash(payload as any, lotHash, index) as T)
    )
  )
}

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

export function useLotHistories(assetHashes: string[]) {
  const uniqueAssetHashes = Array.from(
    new Set(assetHashes.filter((assetHash) => assetHash.length > 0))
  )

  return useQueries({
    queries: uniqueAssetHashes.map((assetHash) => ({
      queryKey: [queryKeys.history(assetHash)],
      queryFn: async () => {
        const history = await traceabilityService.getHistory(assetHash)
        return history.map((entry) => ({ ...entry, assetHash }))
      },
      enabled: uniqueAssetHashes.length > 0,
    })),
    combine: (results) => ({
      data: results
        .flatMap((result) => result.data ?? [])
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ),
      isLoading: results.some((result) => result.isLoading),
      isError: results.some((result) => result.isError),
      errors: results.flatMap((result) => (result.error ? [result.error] : [])),
    }),
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

export function useAuditQueryOwner(ownerId: string) {
  return useQuery({
    queryKey: ["audit", "owner", ownerId],
    queryFn: () => traceabilityService.queryByOwner(ownerId),
    enabled: !!ownerId,
  })
}

export function useTraceability() {
  const queryClient = useQueryClient()

  // Mutations
  const createTransferMutation = useMutation({
    mutationFn: (payload: TransferPayload) =>
      submitPerLotHash(payload, traceabilityService.createTransfer),
    onSuccess: (response, variables) => {
      toast.success("Transfert enregistré avec succès sur la blockchain")
      variables.lotHashes.forEach((lotHash) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.history(lotHash)] })
      })
    },
    onError: (err: any) => {
      toast.error(err.message || "Échec de l'enregistrement du transfert")
    },
  })

  const createTransformationMutation = useMutation({
    mutationFn: (payload: TransformationPayload) =>
      submitPerLotHash(payload, traceabilityService.createTransformation),
    onSuccess: (response, variables) => {
      toast.success("Transformation enregistrée avec succès sur la blockchain")
      variables.lotHashes.forEach((lotHash) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.history(lotHash)] })
      })
    },
    onError: (err: any) => {
      toast.error(err.message || "Échec de l'enregistrement de la transformation")
    },
  })

  const createShipmentMutation = useMutation({
    mutationFn: (payload: ShipmentPayload) =>
      submitPerLotHash(payload, traceabilityService.createShipment),
    onSuccess: (response, variables) => {
      toast.success("Expédition enregistrée avec succès sur la blockchain")
      variables.lotHashes.forEach((lotHash) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.history(lotHash)] })
      })
    },
    onError: (err: any) => {
      toast.error(err.message || "Échec de l'enregistrement de l'expédition")
    },
  })

  const createCertificationMutation = useMutation({
    mutationFn: (payload: CertificationPayload) => traceabilityService.createCertification(payload),
    onSuccess: (response, variables) => {
      toast.success("Certification enregistrée avec succès sur la blockchain")
      queryClient.invalidateQueries({ queryKey: [queryKeys.history(variables.refHash)] })
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
