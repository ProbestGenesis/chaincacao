/**
 * Audit hooks avec vérifications de permissions
 */

import {
  useEUDRReport as useEUDRReportBase,
  useEUDRReportPDF as useEUDRReportPDFBase,
  useQueryByStatus as useQueryByStatusBase,
  useQueryByFarmer as useQueryByFarmerBase,
  useQueryByOwner as useQueryByOwnerBase,
  useAssetHistory as useAssetHistoryBase,
  useGetCertifications as useGetCertificationsBase,
  useShipmentReport as useShipmentReportBase,
  useShipmentReportPDF as useShipmentReportPDFBase,
} from "./useAudit"
import { useCreateCertificationMutation as useCreateCertificationMutationBase } from "./useCertifications"
import type { LotStatus } from "@/types/api"
import { usePermission } from "@/hooks/usePermission"

/**
 * Query pour lire le rapport EUDR
 * Accessible par tous avec données filtrées selon rôle
 * MINISTERE: inclut les données GPS
 * Autres: sans GPS (données publiques)
 */
export function useEUDRReportSecure(lotHash?: string) {
  const { check, canReadEUDRWithGPS, isAdmin } = usePermission()
  
  if (!check("audit:read_eudr_report") && !check("audit:read_eudr_report_gps")) {
    throw new Error(
      "Vous n'avez pas la permission de lire les rapports EUDR."
    )
  }
  
  const query = useEUDRReportBase(lotHash)
  
  // Le backend filtre les données GPS automatiquement
  // Mais on peut le documenter ici pour les devs
  if (query.data) {
    const hasGPS = !!query.data.data?.gps
    if (hasGPS && !canReadEUDRWithGPS()) {
      console.info(
        "[SECURITY] EUDR report filtered: GPS data excluded for non-MINISTERE users"
      )
    }
  }
  
  return query
}

/**
 * Query pour télécharger le PDF du rapport EUDR
 * Même restrictions que useEUDRReport
 */
export function useEUDRReportPDFSecure(lotHash?: string) {
  const { check } = usePermission()
  
  if (!check("audit:read_eudr_report")) {
    throw new Error(
      "Vous n'avez pas la permission de télécharger le rapport EUDR."
    )
  }
  
  return useEUDRReportPDFBase(lotHash)
}

/**
 * Query pour rechercher les lots par statut
 * Accessible par tous (données publiques)
 */
export function useQueryByStatusSecure(status?: LotStatus) {
  const { check } = usePermission()
  
  if (!check("audit:query_status")) {
    // Public endpoint, mais on peut vérifier quand même
    console.info("[SECURITY] Query by status - using public/filtered data")
  }
  
  return useQueryByStatusBase(status)
}

/**
 * Query pour rechercher les lots d'un producteur
 * Restrictions:
 * - PRODUCTEUR: voit ses propres lots
 * - COOPERATIVE: voit les lots de ses producteurs
 * - EXPORTATEUR: voit tous les lots
 * - MINISTERE: voit tous les lots
 */
export function useQueryByFarmerSecure(farmerId?: string) {
  const { check, role, isCooperative, isProducer, isAdmin } = usePermission()
  
  if (!check("audit:query_farmer")) {
    throw new Error(
      "Vous n'avez pas la permission de rechercher les lots d'un producteur."
    )
  }
  
  // Vérifications de cohérence côté client
  if (isProducer() && farmerId) {
    // PRODUCTEUR ne peut voir que ses propres lots
    // (vérification complète se fait côté serveur, mais on peut warning ici)
    console.info(
      `[SECURITY] PRODUCTEUR: querying farmer data for ${farmerId}. Server will filter to own data only.`
    )
  }
  
  if (isCooperative() && farmerId) {
    // COOPERATIVE ne peut voir que les producteurs de sa coop
    console.info(
      `[SECURITY] COOPERATIVE: querying farmer data for ${farmerId}. Server will verify membership.`
    )
  }
  
  return useQueryByFarmerBase(farmerId)
}

/**
 * Mutation pour créer une certification
 * Restrictions: COOPERATIVE, CERTIF, MINISTERE
 */
export function useCreateCertificationMutationSecure() {
  const { check } = usePermission()
  
  if (!check("audit:create_certification")) {
    throw new Error(
      "Vous n'avez pas la permission de créer des certifications. " +
      "Seules les Coopératives, Certificateurs et le Ministère peuvent le faire."
    )
  }
  
  return useCreateCertificationMutationBase()
}

/**
 * Query pour lire l'historique d'un asset
 * Accessible par tous (données publiques)
 */
export function useAssetHistorySecure(assetHash?: string) {
  return useAssetHistoryBase(assetHash)
}

/**
 * Query pour rechercher les lots d'un propriétaire
 * Restrictions: MINISTERE et propriétaire lui-même
 */
export function useQueryByOwnerSecure(ownerId?: string) {
  const { check, isAdmin, currentUserId } = usePermission()

  if (!isAdmin() && currentUserId !== ownerId) {
    throw new Error(
      "Vous n'avez pas la permission de consulter les lots de ce propriétaire. " +
      "Seul le Ministère et le propriétaire lui-même peuvent y accéder."
    )
  }

  return useQueryByOwnerBase(ownerId)
}

/**
 * Query pour lire les certifications d'un asset
 * Accessible par tous (données publiques)
 */
export function useGetCertificationsSecure(refHash?: string) {
  const { check } = usePermission()

  if (!check("audit:query_certifications")) {
    throw new Error(
      "Vous n'avez pas la permission de consulter les certifications."
    )
  }

  return useGetCertificationsBase(refHash)
}

/**
 * Query pour lire le rapport de shipment
 * Restrictions: EXPORTATEUR, MINISTERE
 */
export function useShipmentReportSecure(shipmentHash?: string) {
  const { check } = usePermission()

  if (!check("audit:read_shipment_report")) {
    throw new Error(
      "Vous n'avez pas la permission de lire les rapports d'envoi. " +
      "Seuls les Exportateurs et le Ministère peuvent y accéder."
    )
  }

  return useShipmentReportBase(shipmentHash)
}

/**
 * Query pour télécharger le PDF du rapport de shipment
 */
export function useShipmentReportPDFSecure(shipmentHash?: string) {
  const { check } = usePermission()

  if (!check("audit:read_shipment_report")) {
    throw new Error(
      "Vous n'avez pas la permission de télécharger le rapport d'envoi."
    )
  }

  return useShipmentReportPDFBase(shipmentHash)
}
