/**
 * Traceability hooks avec vérifications de permissions
 * Contrôle d'accès strict pour les opérations sensibles
 */

import {
  useCreateTransferMutation as useCreateTransferMutationBase,
  useCreateTransformationMutation as useCreateTransformationMutationBase,
  useCreateShipmentMutation as useCreateShipmentMutationBase,
  useTransferDetails as useTransferDetailsBase,
  useTransformationDetails as useTransformationDetailsBase,
  useShipmentDetails as useShipmentDetailsBase,
  useUserTransfers as useUserTransfersBase,
} from "./useTraceability"
import { usePermission } from "@/hooks/usePermission"

/**
 * Créer un transfer (PRODUCTEUR, COOPERATIVE, EXPORTATEUR, MINISTERE)
 */
export function useCreateTransferMutationSecure() {
  const { check } = usePermission()

  if (!check("traceability:create_transfer")) {
    throw new Error(
      "Vous n'avez pas la permission de créer un transfert. " +
      "Cette opération est réservée aux Producteurs, Coopératives, Exportateurs et au Ministère."
    )
  }

  return useCreateTransferMutationBase()
}

/**
 * Créer une transformation (PRODUCTEUR, COOPERATIVE, TRANSFORMATEUR, MINISTERE)
 */
export function useCreateTransformationMutationSecure() {
  const { check } = usePermission()

  if (!check("traceability:create_transformation")) {
    throw new Error(
      "Vous n'avez pas la permission de créer une transformation. " +
      "Cette opération est réservée aux Producteurs, Coopératives, Transformateurs et au Ministère."
    )
  }

  return useCreateTransformationMutationBase()
}

/**
 * Créer un shipment (EXPORTATEUR, MINISTERE)
 */
export function useCreateShipmentMutationSecure() {
  const { check } = usePermission()

  if (!check("traceability:create_shipment")) {
    throw new Error(
      "Vous n'avez pas la permission de créer un envoi. " +
      "Cette opération est réservée aux Exportateurs et au Ministère."
    )
  }

  return useCreateShipmentMutationBase()
}

/**
 * Voir un transfer (lecture générale - presque tout le monde)
 */
export function useTransferDetailsSecure(transferHash?: string) {
  const { check } = usePermission()

  if (!check("audit:read_history")) {
    throw new Error(
      "Vous n'avez pas la permission de consulter l'historique de transfert."
    )
  }

  return useTransferDetailsBase(transferHash)
}

/**
 * Voir une transformation (lecture générale)
 */
export function useTransformationDetailsSecure(transformationHash?: string) {
  const { check } = usePermission()

  if (!check("audit:read_history")) {
    throw new Error(
      "Vous n'avez pas la permission de consulter l'historique de transformation."
    )
  }

  return useTransformationDetailsBase(transformationHash)
}

/**
 * Voir un shipment (EXPORTATEUR, MINISTERE - lecture sensible)
 */
export function useShipmentDetailsSecure(shipmentHash?: string) {
  const { check } = usePermission()

  if (!check("audit:read_shipment_report")) {
    throw new Error(
      "Vous n'avez pas la permission de consulter les détails d'envoi. " +
      "Seuls les Exportateurs et le Ministère peuvent y accéder."
    )
  }

  return useShipmentDetailsBase(shipmentHash)
}

/**
 * Consulter ses propres transferts (tous les rôles ayant create_transfer)
 */
export function useUserTransfersSecure(userId?: string) {
  const { check } = usePermission()

  if (!check("traceability:create_transfer")) {
    throw new Error(
      "Vous n'avez pas la permission de consulter vos transferts."
    )
  }

  return useUserTransfersBase(userId)
}
