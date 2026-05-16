import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  ActorRegister,
  PendingProducer,
  ActorRegistrationResponse,
} from "@/types/api"

// ============================================================================
// LIST PENDING PRODUCERS
// ============================================================================

export function usePendingProducers() {
  return useQuery({
    queryKey: ["actors", "producers", "pending"],
    queryFn: () => api.get<PendingProducer[]>("/api/v1/actors/producers/pending"),
    retry: 1,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// ============================================================================
// REGISTER ACTOR
// ============================================================================

export function useRegisterActorMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ActorRegister) => {
      return api.post<ActorRegistrationResponse>("/api/v1/actors/register", data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actors"] })
      queryClient.invalidateQueries({ queryKey: ["auth", "pending-registrations"] })
    },
  })
}
