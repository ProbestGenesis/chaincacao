"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { parcellesService } from "@/lib/services/parcelles.service"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import type { ParcelleCreate } from "@/types/api"

export function useParcelles() {
  const queryClient = useQueryClient()

  const {
    data: parcelles = [],
    isLoading,
    refetch: loadParcelles,
  } = useQuery({
    queryKey: [queryKeys.parcelles],
    queryFn: () => parcellesService.getFarmerParcelles(),
  })

  const registerParcelleMutation = useMutation({
    mutationFn: (payload: ParcelleCreate) => parcellesService.registerParcelle(payload),
    onSuccess: () => {
      toast.success("Parcelle enregistrée avec succès")
      queryClient.invalidateQueries({ queryKey: [queryKeys.parcelles] })
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de l'enregistrement de la parcelle")
    },
  })

  return {
    parcelles,
    isLoading,
    isSubmitting: registerParcelleMutation.isPending,
    loadParcelles,
    registerParcelle: registerParcelleMutation.mutateAsync,
  }
}
