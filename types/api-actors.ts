/**
 * Types API pour les acteurs — basés sur /api/v1/auth et /api/v1/actors
 */

export type ActorType =
  | "PRODUCTEUR"
  | "EXPORTATEUR"
  | "CERTIF"
  | "MINISTERE"
  | "COOPERATIVE"
  | "TRANSFORMATEUR"

export type OrgName =
  | "producteurs"
  | "exportateurs"
  | "certif"
  | "ministere"
  | "transformateurs"
  | "cooperatives"

/** Réponse de GET /api/v1/auth/users et /api/v1/auth/pending-registrations */
export interface ApiUser {
  id: number
  email: string | null
  numero_telephone: string | null
  full_name: string
  role: ActorType
  org_name: string
  blockchain_id: string | null
  parent_id: string | null
  is_admin: boolean
  blockchain_validated: boolean
  document_legalite_hash: string | null
  is_active: boolean
  created_at: string
}

/** Corps de POST /api/v1/actors/register */
export interface RegisterActorPayload {
  actorIdHash: string
  typeActeur: ActorType
  clePublique: string
  orgName: OrgName
}

/** Réponse de POST /api/v1/actors/register */
export interface ActorRegisterResponse {
  success: boolean
  message: string
  ca_details?: Record<string, unknown>
  chaincode_details?: Record<string, unknown>
}

/** Corps de POST /api/v1/auth/register-producer (Coopérative → Producteur) */
export interface RegisterProducerPayload {
  fullName: string
  numeroTelephone: string
  location?: string
}

/** Corps de POST /api/v1/auth/register-agent (Admin org → Agent) */
export interface RegisterAgentPayload {
  full_name: string
  email?: string
  numero_telephone?: string
  password: string
  role: ActorType
  org_name: OrgName
}

/** Mapping rôle API → org Fabric */
export const roleToOrg: Record<ActorType, OrgName> = {
  PRODUCTEUR: "producteurs",
  EXPORTATEUR: "exportateurs",
  CERTIF: "certif",
  MINISTERE: "ministere",
  COOPERATIVE: "cooperatives",
  TRANSFORMATEUR: "transformateurs",
}

export const actorTypeLabels: Record<ActorType, string> = {
  PRODUCTEUR: "Producteur",
  EXPORTATEUR: "Exportateur",
  CERTIF: "Organisme de Certification",
  MINISTERE: "Ministère",
  COOPERATIVE: "Coopérative",
  TRANSFORMATEUR: "Transformateur",
}
