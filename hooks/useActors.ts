"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  fetchUsers,
  fetchPendingRegistrations,
  fetchPendingProducers,
  registerActorOnBlockchain,
  registerProducer,
  registerAgent,
} from "@/lib/services/actors.service"
import type {
  ApiUser,
  RegisterActorPayload,
  RegisterProducerPayload,
  RegisterAgentPayload,
  ActorType,
} from "@/types/api-actors"
import { roleToOrg as roleToOrgMap } from "@/types/api-actors"
import { queryKeys } from "@/lib/query-keys"
import { useUser } from "@/context/useUser"
import { normalizeRole } from "@/lib/navigation/role-config"

export function useActors() {
  const queryClient = useQueryClient()
  const { activeRole } = useUser()
  const normalizedRole = normalizeRole(activeRole || "")

  // Queries
  const usersQuery = useQuery({
    queryKey: [queryKeys.actors],
    queryFn: () => fetchUsers(),
  })

  const pendingUsersQuery = useQuery({
    queryKey: [queryKeys.pendingActors, normalizedRole],
    queryFn: () => {
      if (normalizedRole === "CoopManager") {
        return fetchPendingProducers()
      }
      // Par défaut (Ministère)
      return fetchPendingRegistrations()
    },
    // Désactiver si le rôle n'est ni Admin ni Coop ni Ministry (évite les erreurs 403 inutiles)
    enabled: ["Admin", "CoopManager", "MinistryAnalyst"].includes(normalizedRole),
  })

  // Mutations
  const validateMutation = useMutation({
    mutationFn: async (user: ApiUser) => {
      const roleKey = user.role.toUpperCase() as ActorType
      const payload: RegisterActorPayload = {
        actorIdHash: user.blockchain_id || `USER-${user.id}`,
        typeActeur: roleKey,
        clePublique: `PUB-${user.id}-${Date.now()}`,
        orgName: roleToOrgMap[roleKey],
      }
      return registerActorOnBlockchain(payload)
    },
    onSuccess: (result, user) => {
      if (result.success) {
        toast.success(`${user.full_name} validé sur la Blockchain`)
        queryClient.invalidateQueries({ queryKey: [queryKeys.pendingActors] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.actors] })
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Échec de la validation blockchain")
    },
  })

  const addProducerMutation = useMutation({
    mutationFn: (data: RegisterProducerPayload) => registerProducer(data),
    onSuccess: (newUser) => {
      toast.success(`Producteur ${newUser.full_name} inscrit avec succès`)
      queryClient.invalidateQueries({ queryKey: [queryKeys.actors] })
    },
    onError: (err: any) => {
      toast.error(err.message || "Échec de l'inscription du producteur")
    },
  })

  const addAgentMutation = useMutation({
    mutationFn: (data: RegisterAgentPayload) => registerAgent(data),
    onSuccess: (newUser) => {
      toast.success(`Agent ${newUser.full_name} inscrit avec succès`)
      queryClient.invalidateQueries({ queryKey: [queryKeys.actors] })
    },
    onError: (err: any) => {
      toast.error(err.message || "Échec de l'inscription de l'agent")
    },
  })

  return {
    users: usersQuery.data || [],
    pendingUsers: pendingUsersQuery.data || [],
    isLoading: usersQuery.isLoading || pendingUsersQuery.isLoading,
    isSubmitting: validateMutation.isPending || addProducerMutation.isPending || addAgentMutation.isPending,
    loadUsers: usersQuery.refetch,
    loadPendingRegistrations: pendingUsersQuery.refetch,
    validateOnBlockchain: validateMutation.mutateAsync,
    addProducer: addProducerMutation.mutateAsync,
    addAgent: addAgentMutation.mutateAsync,
  }
}

