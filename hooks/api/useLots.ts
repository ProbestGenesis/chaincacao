import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  CreateLotRequest,
  CreateLotResponse,
  LotDetail,
  LotStatusUpdate,
  RegroupRequest,
  BundleCreate,
} from "@/types/api"

const LOTS_QUERY_KEY = ["lots"]

// ============================================================================
// CREATE LOT
// ============================================================================

export function useCreateLotMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateLotRequest) => {
      const formData = new FormData()
      formData.append("parcelle_id", data.parcelle_id)
      formData.append("poids_kg", data.poids_kg.toString())
      formData.append("espece", data.espece)
      formData.append("date_collecte", data.date_collecte)
      formData.append("file", data.file)

      if (data.coop_id) {
        formData.append("coop_id", data.coop_id)
      }

      return api.post<CreateLotResponse>("/api/v1/lots/", formData, {
        isFormData: true,
      })
    },
    onSuccess: () => {
      // Invalidate all lot queries to refetch
      queryClient.invalidateQueries({ queryKey: LOTS_QUERY_KEY })
    },
  })
}

// ============================================================================
// GET LOT DETAILS
// ============================================================================

export function useLotDetails(lotHash?: string) {
  return useQuery({
    queryKey: ["lots", "detail", lotHash],
    queryFn: () => api.get<LotDetail>(`/api/v1/lots/${lotHash}`),
    enabled: !!lotHash,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// GET LOT MEDIA
// ============================================================================

export function useLotMedia(mediaHash?: string) {
  return useQuery({
    queryKey: ["lots", "media", mediaHash],
    queryFn: async () => {
      const blob = await api.get<Blob>(`/api/v1/lots/media/${mediaHash}`, {
        responseType: "blob",
      })
      return URL.createObjectURL(blob)
    },
    enabled: !!mediaHash,
    staleTime: Infinity, // Media doesn't change
  })
}

// ============================================================================
// UPDATE LOT STATUS
// ============================================================================

export function useUpdateLotStatusMutation(lotHash?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LotStatusUpdate) => {
      return api.put<LotDetail>(`/api/v1/lots/${lotHash}/status`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lots", "detail", lotHash] })
      queryClient.invalidateQueries({ queryKey: LOTS_QUERY_KEY })
    },
  })
}

// ============================================================================
// REGROUP LOTS
// ============================================================================

export function useRegroupLotsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: RegroupRequest) => {
      return api.post<BundleCreate>("/api/v1/lots/regroup", data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOTS_QUERY_KEY })
    },
  })
}
