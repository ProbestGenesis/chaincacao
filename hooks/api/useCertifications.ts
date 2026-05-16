import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { CertificationCreate, CertificationDetail } from "@/types/api"

// ============================================================================
// CREATE CERTIFICATION
// ============================================================================

export function useCreateCertificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CertificationCreate) => {
      return api.post<CertificationDetail>("/api/v1/audit/certifications", data)
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["audit", "certifications"] })
      queryClient.invalidateQueries({ queryKey: ["lots"] })
    },
  })
}
