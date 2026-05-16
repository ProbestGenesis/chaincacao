/**
 * Auth hooks avec vérifications de permissions
 */

import { useLoginMutation as useLoginMutationBase } from "./useAuth"
import { useCurrentUser as useCurrentUserBase } from "./useAuth"
import {
  useListUsers as useListUsersBase,
  usePendingRegistrations as usePendingRegistrationsBase,
  useRegisterProducerMutation as useRegisterProducerMutationBase,
  useRegisterAgentMutation as useRegisterAgentMutationBase,
} from "./useAuth"
import { usePermission } from "@/hooks/usePermission"

/**
 * Mutation pour se connecter
 * Endpoint public - pas de vérification de permission
 */
export function useLoginMutationSecure() {
  return useLoginMutationBase()
}

/**
 * Query pour lire le profil courant
 * Requiert auth (permission auto-vérifiée par le backend)
 */
export function useCurrentUserSecure() {
  const { check } = usePermission()
  
  const query = useCurrentUserBase()
  
  // Ajouter un check côté client
  if (query.data && !check("auth:read_me")) {
    console.warn(
      "[SECURITY] Access denied to auth:read_me. Your role may not allow this action."
    )
  }
  
  return query
}

/**
 * Query pour lister les utilisateurs
 * Restrictions: COOPERATIVE (leurs membres), MINISTERE (tous)
 */
export function useListUsersSecure() {
  const { check, isCooperative, isAdmin } = usePermission()
  
  if (!check("auth:list_users")) {
    throw new Error(
      "Vous n'avez pas la permission de voir la liste des utilisateurs. " +
      "Seules les Coopératives (leurs membres) et le Ministère peuvent y accéder."
    )
  }
  
  // Note: L'endpoint lui-même filtre les résultats selon le rôle
  // COOPERATIVE voit ses membres, MINISTERE voit tous
  return useListUsersBase()
}

/**
 * Query pour lister les inscriptions en attente
 * Restriction: MINISTERE uniquement
 */
export function usePendingRegistrationsSecure() {
  const { check, isAdmin } = usePermission()
  
  if (!isAdmin()) {
    throw new Error(
      "Vous n'avez pas la permission de voir les inscriptions en attente. " +
      "Seul le Ministère peut accéder à cette liste."
    )
  }
  
  return usePendingRegistrationsBase()
}

/**
 * Mutation pour inscrire un producteur (délégué par Coopérative)
 * Restriction: COOPERATIVE uniquement
 */
export function useRegisterProducerMutationSecure() {
  const { check, isCooperative } = usePermission()
  
  if (!isCooperative()) {
    throw new Error(
      "Vous n'avez pas la permission d'inscrire des producteurs. " +
      "Seules les Coopératives peuvent le faire."
    )
  }
  
  return useRegisterProducerMutationBase()
}

/**
 * Mutation pour inscrire un agent
 * Restrictions: COOPERATIVE ou MINISTERE
 */
export function useRegisterAgentMutationSecure() {
  const { check } = usePermission()
  
  if (!check("auth:register_agent")) {
    throw new Error(
      "Vous n'avez pas la permission d'inscrire des agents. " +
      "Seules les Coopératives et le Ministère peuvent le faire."
    )
  }
  
  return useRegisterAgentMutationBase()
}
