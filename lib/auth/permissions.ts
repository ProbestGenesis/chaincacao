/**
 * Role-Based Access Control (RBAC) pour ChainCacao
 * Basé sur API_DOC.md - Section 8: Rôles et Contrôle d'Accès
 */

import type { UserRole } from "@/types/api"

export type Permission =
  // Auth
  | "auth:login"
  | "auth:register"
  | "auth:read_me"
  | "auth:list_users"
  | "auth:list_pending_registrations"
  | "auth:register_producer_delegated"
  | "auth:register_agent"

  // Actors
  | "actors:list_pending_producers"
  | "actors:register_on_blockchain"

  // Lots
  | "lots:create"
  | "lots:read_own"
  | "lots:read_any"
  | "lots:update_status"
  | "lots:regroup"

  // Parcelles
  | "parcelles:create"
  | "parcelles:read_own"
  | "parcelles:read_any"

  // Traceability
  | "traceability:create_transfer"
  | "traceability:create_transformation"
  | "traceability:create_shipment"

  // Audit & Queries
  | "audit:create_certification"
  | "audit:read_history"
  | "audit:query_status"
  | "audit:query_farmer"
  | "audit:query_certifications"
  | "audit:read_eudr_report"
  | "audit:read_eudr_report_gps" // MINISTERE only - includes GPS data
  | "audit:read_shipment_report"
  | "audit:verify_lot_public"

/**
 * Matrice de permissions par rôle
 * Source: API_DOC.md Section 8
 */
export const rolePermissions: Record<UserRole, Permission[]> = {
  PRODUCTEUR: [
    // Auth
    "auth:login",
    "auth:register",
    "auth:read_me",

    // Lots - create and read own
    "lots:create",
    "lots:read_own",
    "lots:update_status",

    // Parcelles - manage own
    "parcelles:create",
    "parcelles:read_own",

    // Traceability - participate in chain
    "traceability:create_transfer",
    "traceability:create_transformation",

    // Audit
    "audit:read_history",
    "audit:query_farmer", // Own farmer data
    "audit:verify_lot_public",
  ],

  COOPERATIVE: [
    // Auth
    "auth:login",
    "auth:register",
    "auth:read_me",
    "auth:list_users", // See members only
    "auth:register_producer_delegated", // Inscribe producers
    "auth:register_agent", // Inscribe agents

    // Actors - validate PRODUCTEUR only
    "actors:list_pending_producers",
    "actors:register_on_blockchain", // PRODUCTEUR only

    // Lots - read cooperative lots
    "lots:read_any",
    "lots:update_status",
    "lots:regroup", // Group producer lots

    // Parcelles
    "parcelles:read_any",

    // Traceability
    "traceability:create_transfer",
    "traceability:create_transformation",

    // Audit
    "audit:create_certification",
    "audit:read_history",
    "audit:query_status",
    "audit:query_farmer",
    "audit:query_certifications",
    "audit:read_eudr_report",
    "audit:verify_lot_public",
  ],

  EXPORTATEUR: [
    // Auth
    "auth:login",
    "auth:register",
    "auth:read_me",

    // Lots - read all
    "lots:read_any",
    "lots:update_status",

    // Traceability
    "traceability:create_transfer",
    "traceability:create_shipment",

    // Audit - access compliance reports
    "audit:read_history",
    "audit:query_status",
    "audit:query_certifications",
    "audit:read_eudr_report",
    "audit:read_shipment_report",
    "audit:verify_lot_public",
  ],

  TRANSFORMATEUR: [
    // Auth
    "auth:login",
    "auth:register",
    "auth:read_me",

    // Lots - read and update
    "lots:read_any",
    "lots:update_status",

    // Traceability - log transformations
    "traceability:create_transfer",
    "traceability:create_transformation",

    // Audit
    "audit:read_history",
    "audit:query_status",
    "audit:verify_lot_public",
  ],

  CERTIF: [
    // Auth
    "auth:login",
    "auth:register",
    "auth:read_me",

    // Lots - read all
    "lots:read_any",

    // Audit - create and read certifications
    "audit:create_certification",
    "audit:read_history",
    "audit:query_status",
    "audit:verify_lot_public",
  ],

  MINISTERE: [
    // Auth - full access
    "auth:login",
    "auth:register",
    "auth:read_me",
    "auth:list_users", // All users
    "auth:list_pending_registrations", // All pending
    "auth:register_agent", // Any agent

    // Actors - validate any actor
    "actors:list_pending_producers",
    "actors:register_on_blockchain", // Any actor type

    // Lots - read all
    "lots:read_any",
    "lots:update_status",

    // Parcelles - read all
    "parcelles:read_any",

    // Traceability - full access
    "traceability:create_transfer",
    "traceability:create_transformation",
    "traceability:create_shipment",

    // Audit - full access with GPS
    "audit:create_certification",
    "audit:read_history",
    "audit:query_status",
    "audit:query_farmer",
    "audit:query_certifications",
    "audit:read_eudr_report",
    "audit:read_eudr_report_gps", // MINISTERE gets GPS data
    "audit:read_shipment_report",
    "audit:verify_lot_public",
  ],
}

/**
 * Public endpoints (no auth required)
 */
export const publicPermissions = new Set<Permission>([
  "auth:login",
  "auth:register",
  "lots:read_any", // Public lot info (no sensitive data)
  "audit:read_history",
  "audit:query_status",
  "audit:query_certifications",
  "audit:read_eudr_report", // Public/restricted access
  "audit:verify_lot_public", // QR code scanning
])

/**
 * Vérifier si un rôle a une permission
 */
export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return publicPermissions.has(permission)
  return rolePermissions[role]?.includes(permission) ?? false
}

/**
 * Vérifier si un rôle a TOUTES les permissions
 */
export function hasAllPermissions(role: UserRole | null | undefined, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}

/**
 * Vérifier si un rôle a AU MOINS UNE permission
 */
export function hasAnyPermission(role: UserRole | null | undefined, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

/**
 * Obtenir toutes les permissions pour un rôle
 */
export function getPermissions(role: UserRole | null | undefined): Permission[] {
  if (!role) return Array.from(publicPermissions)
  return rolePermissions[role] ?? []
}

/**
 * Vérifier si un endpoint est public
 */
export function isPublicEndpoint(permission: Permission): boolean {
  return publicPermissions.has(permission)
}
