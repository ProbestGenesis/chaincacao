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
    queryFn: async () => {
      const data = await parcellesService.getFarmerParcelles()
      return data.sort((a, b) => {
        const dateA = new Date(a.dateEnregistrement || 0).getTime()
        const dateB = new Date(b.dateEnregistrement || 0).getTime()
        return dateB - dateA
      })
    },
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
