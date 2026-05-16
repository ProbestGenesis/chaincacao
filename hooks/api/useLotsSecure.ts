/**
 * Lot hooks avec vérifications de permissions
 */

import {
  useCreateLotMutation as useCreateLotMutationBase,
  useLotDetails as useLotDetailsBase,
  useUpdateLotStatusMutation as useUpdateLotStatusMutationBase,
  useRegroupLotsMutation as useRegroupLotsMutationBase,
} from "./useLots"
import { usePermission } from "@/hooks/usePermission"

/**
 * Mutation pour créer un lot
 * Restriction: PRODUCTEUR uniquement
 */
export function useCreateLotMutationSecure() {
  const { check, isProducer } = usePermission()
  
  if (!isProducer()) {
    throw new Error(
      "Vous n'avez pas la permission de créer des lots. " +
      "Seuls les Producteurs peuvent créer des lots."
    )
  }
  
  return useCreateLotMutationBase()
}

/**
 * Query pour lire les détails d'un lot
 * Accessible par tous (données publiques filtrées)
 */
export function useLotDetailsSecure(lotHash?: string) {
  const { check, role, isAdmin } = usePermission()
  
  const query = useLotDetailsBase(lotHash)
  
  // Note: Le backend filtre les données sensibles selon le rôle
  // - GPS: visible uniquement pour MINISTERE
  // - Coordonnées exactes: filtrées pour non-MINISTERE
  
  return query
}

/**
 * Mutation pour mettre à jour le statut d'un lot
 * Restrictions: selon le rôle et le statut cible
 */
export function useUpdateLotStatusMutationSecure(lotHash?: string) {
  const { check } = usePermission()
  
  if (!check("lots:update_status")) {
    throw new Error(
      "Vous n'avez pas la permission de mettre à jour le statut d'un lot. " +
      "Seuls les Producteurs, Coopératives, Exportateurs et Transformateurs peuvent le faire."
    )
  }
  
  return useUpdateLotStatusMutationBase(lotHash)
}

/**
 * Mutation pour regrouper des lots
 * Restriction: COOPERATIVE uniquement
 */
export function useRegroupLotsMutationSecure() {
  const { check, isCooperative } = usePermission()
  
  if (!isCooperative()) {
    throw new Error(
      "Vous n'avez pas la permission de regrouper des lots. " +
      "Seules les Coopératives peuvent créer des groupements."
    )
  }
  
  return useRegroupLotsMutationBase()
}
