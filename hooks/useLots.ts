"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { lotService, type CreateLotPayload } from "@/lib/services/lot.service"
import { traceabilityService } from "@/lib/services/traceability.service"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"

export function useLots() {
  const queryClient = useQueryClient()

  // Fetch lots
  const { 
    data: serverLots = [], 
    isLoading, 
    refetch: loadLots 
  } = useQuery({
    queryKey: [queryKeys.lots],
    queryFn: () => lotService.getLots(),
  })

  // Create lot mutation
  const createLotMutation = useMutation({
    mutationFn: (payload: CreateLotPayload) => lotService.createLot(payload),
    onSuccess: () => {
      toast.success("Lot de cacao créé et enregistré avec succès")
      queryClient.invalidateQueries({ queryKey: [queryKeys.lots] })
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de la création du lot")
    },
  })

  // Regroup lots mutation
  const regroupLotsMutation = useMutation({
    mutationFn: (payload: { bundleHash: string; lotHashes: string[]; coopId: string }) =>
      import("@/lib/api").then(({ api }) =>
        api.post("/api/v1/lots/regroup", payload)
      ),
    onSuccess: () => {
      toast.success("Groupement enregistré sur la blockchain")
      queryClient.invalidateQueries({ queryKey: [queryKeys.lots] })
    },
    onError: (err: any) => {
      toast.warning(err.message || "Groupement créé localement \u2014 la blockchain n'a pas répondu")
    },
  })

  return {
    serverLots,
    isLoading,
    isSubmitting: createLotMutation.isPending,
    isRegrouping: regroupLotsMutation.isPending,
    loadLots,
    createLot: createLotMutation.mutateAsync,
    regroupLots: regroupLotsMutation.mutateAsync,
  }
}

export function useFarmerLots(farmerId: string) {
  return useQuery({
    queryKey: [queryKeys.lots, "farmer", farmerId],
    queryFn: async () => {
      const response = await traceabilityService.queryByFarmer(farmerId)
      // Si la réponse est directement un tableau (cas du backend actuel)
      if (Array.isArray(response)) return response
      // Sinon on cherche la propriété .data (compatibilité)
      return (response as any).data || []
    },
    enabled: !!farmerId,
  })
}

export function useOwnedLots(ownerId: string) {
  return useQuery({
    queryKey: [queryKeys.lots, "owned", ownerId],
    queryFn: async () => {
      const response = await traceabilityService.queryByOwner(ownerId)
      if (Array.isArray(response)) return response
      return (response as any).data || []
    },
    enabled: !!ownerId,
  })
}

export function useLot(lotId: string) {
  return useQuery({
    queryKey: [queryKeys.lots, lotId],
    queryFn: async () => {
      try {
        return await lotService.getLot(lotId)
      } catch (error) {
        console.warn(`[useLot] Failed to fetch lot ${lotId}:`, error)
        return null
      }
    },
    enabled: !!lotId,
    retry: false, // Ne pas bloquer ou re-tenter indéfiniment si le lot n'existe pas
  })
}
