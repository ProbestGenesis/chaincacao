/**
 * Hook pour vérifier les permissions avant d'accéder aux endpoints
 * À utiliser dans les composants et hooks API
 */

import { useUser } from "@/context/useUser"
import type { Permission } from "@/lib/auth/permissions"
import { hasPermission, hasAllPermissions, hasAnyPermission } from "@/lib/auth/permissions"
import type { UserRole as ApiUserRole } from "@/types/api"

export function usePermission() {
  const { activeRole, user } = useUser()

  // Normalize role from frontend legacy names to API role names
  const normalizedRole = (() => {
    switch (activeRole) {
      case "Agriculteur":
      case "PRODUCTEUR":
        return "PRODUCTEUR"
      case "CoopManager":
      case "COOPERATIVE":
        return "COOPERATIVE"
      case "Transformer":
      case "TRANSFORMATEUR":
        return "TRANSFORMATEUR"
      case "Exporter":
      case "EXPORTATEUR":
        return "EXPORTATEUR"
      case "Verifier":
      case "CERTIF":
        return "CERTIF"
      case "MinistryAnalyst":
      case "MINISTERE":
      case "Admin":
        return "MINISTERE"
      default:
        return null
    }
  })() as ApiUserRole | null

  return {
    /**
     * Vérifier une permission unique
     * @example
     * const can = usePermission()
     * if (!can.check("lots:create")) {
     *   return <AccessDenied />
     * }
     */
    check: (permission: Permission): boolean => {
      return hasPermission(normalizedRole, permission)
    },

    /**
     * Vérifier plusieurs permissions (tous requis)
     * @example
     * can.checkAll(["lots:create", "lots:read_own"])
     */
    checkAll: (permissions: Permission[]): boolean => {
      return hasAllPermissions(normalizedRole, permissions)
    },

    /**
     * Vérifier plusieurs permissions (au moins une)
     * @example
     * can.checkAny(["lots:read_own", "lots:read_any"])
     */
    checkAny: (permissions: Permission[]): boolean => {
      return hasAnyPermission(normalizedRole, permissions)
    },

    /**
     * Vérifier et envoyer une erreur si pas de permission
     * @throws Error
     * @example
     * can.require("lots:create")
     */
    require: (permission: Permission): boolean => {
      const allowed = hasPermission(normalizedRole, permission)
      if (!allowed) {
        throw new Error(
          `Vous n'avez pas la permission "${permission}". Rôle actuel: ${normalizedRole || "Anonyme"}`
        )
      }
      return true
    },

    /**
     * Obtenir le rôle courant (normalisé)
     */
    role: normalizedRole,

    /**
     * Vérifier si on peut créer un lot
     */
    canCreateLot: () => hasPermission(normalizedRole, "lots:create"),

    /**
     * Vérifier si on peut lire les lots
     */
    canReadLots: () =>
      hasAnyPermission(normalizedRole, ["lots:read_own", "lots:read_any"]),

    /**
     * Vérifier si on peut voir tous les lots (pas juste les siens)
     */
    canReadAllLots: () => hasPermission(normalizedRole, "lots:read_any"),

    /**
     * Vérifier si on peut mettre à jour le statut d'un lot
     */
    canUpdateLotStatus: () => hasPermission(normalizedRole, "lots:update_status"),

    /**
     * Vérifier si on peut créer une certification
     */
    canCreateCertification: () =>
      hasPermission(normalizedRole, "audit:create_certification"),

    /**
     * Vérifier si on peut voir les rapports EUDR
     */
    canReadEUDRReport: () =>
      hasAnyPermission(normalizedRole, ["audit:read_eudr_report", "audit:read_eudr_report_gps"]),

    /**
     * Vérifier si on peut voir les données GPS dans EUDR (MINISTERE only)
     */
    canReadEUDRWithGPS: () => hasPermission(normalizedRole, "audit:read_eudr_report_gps"),

    /**
     * Vérifier si on peut créer des transferts
     */
    canCreateTransfer: () =>
      hasPermission(normalizedRole, "traceability:create_transfer"),

    /**
     * Vérifier si on peut inscrire des producteurs (COOPERATIVE)
     */
    canRegisterProducers: () =>
      hasPermission(normalizedRole, "auth:register_producer_delegated"),

    /**
     * Vérifier si on peut valider sur blockchain (COOPERATIVE, MINISTERE)
     */
    canValidateOnBlockchain: () =>
      hasPermission(normalizedRole, "actors:register_on_blockchain"),

    /**
     * Vérifier si on peut voir la liste des utilisateurs
     */
    canListUsers: () => hasPermission(normalizedRole, "auth:list_users"),

    /**
     * Vérifier si c'est un admin (MINISTERE)
     */
    isAdmin: () => normalizedRole === "MINISTERE",

    /**
     * Vérifier si c'est une coopérative
     */
    isCooperative: () => normalizedRole === "COOPERATIVE",

    /**
     * ID de l'utilisateur courant
     */
    currentUserId: user?.userId || null,

    /**
     * Vérifier si c'est un producteur
     */
    isProducer: () => normalizedRole === "PRODUCTEUR",
  }
}

