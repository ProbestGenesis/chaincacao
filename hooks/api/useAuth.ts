import { useMutation, useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserPublicResponse,
  CooperativePublic,
  PendingRegistration,
  ProducerRegisterDelegated,
  AgentRegister,
} from "@/types/api"

// ============================================================================
// LOGIN
// ============================================================================

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      return api.post<LoginResponse>("/api/v1/auth/login", data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
    },
  })
}

// ============================================================================
// REGISTER
// ============================================================================

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const formData = new FormData()
      formData.append("email", data.email || "")
      formData.append("numero_telephone", data.numero_telephone || "")
      formData.append("password", data.password)
      formData.append("full_name", data.full_name)
      formData.append("role", data.role)
      formData.append("org_name", data.org_name)
      
      if (data.file) {
        formData.append("file", data.file)
      }

      return api.post<UserPublicResponse>("/api/v1/auth/register", formData, {
        isFormData: true,
      })
    },
  })
}

// ============================================================================
// CURRENT USER
// ============================================================================

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.get<UserPublicResponse>("/api/v1/auth/me"),
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// PUBLIC COOPERATIVES
// ============================================================================

export function usePublicCooperatives() {
  return useQuery({
    queryKey: ["cooperatives", "public"],
    queryFn: () => api.get<CooperativePublic[]>("/api/v1/auth/cooperatives/public"),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// ============================================================================
// LIST USERS
// ============================================================================

export function useListUsers() {
  return useQuery({
    queryKey: ["auth", "users"],
    queryFn: () => api.get<UserPublicResponse[]>("/api/v1/auth/users"),
    retry: 1,
  })
}

// ============================================================================
// PENDING REGISTRATIONS
// ============================================================================

export function usePendingRegistrations() {
  return useQuery({
    queryKey: ["auth", "pending-registrations"],
    queryFn: () => api.get<PendingRegistration[]>("/api/v1/auth/pending-registrations"),
    retry: 1,
  })
}

// ============================================================================
// REGISTER PRODUCER (Delegated)
// ============================================================================

export function useRegisterProducerMutation() {
  return useMutation({
    mutationFn: async (data: ProducerRegisterDelegated) => {
      return api.post<UserPublicResponse>("/api/v1/auth/register-producer", data)
    },
  })
}

// ============================================================================
// REGISTER AGENT
// ============================================================================

export function useRegisterAgentMutation() {
  return useMutation({
    mutationFn: async (data: AgentRegister) => {
      return api.post<UserPublicResponse>("/api/v1/auth/register-agent", data)
    },
  })
}

// ============================================================================
// REFRESH TOKEN
// ============================================================================

export function useRefreshTokenMutation() {
  return useMutation({
    mutationFn: async () => {
      return api.post<LoginResponse>("/api/v1/auth/refresh", {})
    },
  })
}

// ============================================================================
// RECIPIENTS (TRANSFERS)
// ============================================================================

export function useRecipients() {
  return useQuery({
    queryKey: ["actors", "recipients"],
    queryFn: () => api.get<UserPublicResponse[]>("/api/v1/actors/recipients"),
    retry: 1,
  })
}
