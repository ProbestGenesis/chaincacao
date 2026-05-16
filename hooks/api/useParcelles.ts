import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { ParcelleCreate, ParcelleDetail } from "@/types/api"

const PARCELLES_QUERY_KEY = ["parcelles"]

// ============================================================================
// CREATE PARCELLE
// ============================================================================

export function useCreateParcelMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ParcelleCreate) => {
      return api.post<ParcelleDetail>("/api/v1/parcelles/", data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARCELLES_QUERY_KEY })
    },
  })
}

// ============================================================================
// GET MY PARCELLES
// ============================================================================

export function useMyParcelles() {
  return useQuery({
    queryKey: [...PARCELLES_QUERY_KEY, "me"],
    queryFn: () => api.get<ParcelleDetail[]>("/api/v1/parcelles/me"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// GET PARCELLE DETAILS
// ============================================================================

export function useParcelleDetails(parcelleId?: string) {
  return useQuery({
    queryKey: [...PARCELLES_QUERY_KEY, parcelleId],
    queryFn: () => api.get<ParcelleDetail>(`/api/v1/parcelles/${parcelleId}`),
    enabled: !!parcelleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
