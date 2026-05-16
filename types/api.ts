/**
 * Complete API Types for ChainCacao Backend
 * Based on OpenAPI 3.1 / Swagger documentation
 * Generated: 2026-05-15
 */

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface LoginRequest {
  username: string // email or phone
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: "bearer"
  user: {
    email: string
    full_name: string
    role: UserRole
    org_name: OrgName
    blockchain_id: string
  }
}

export interface RegisterRequest {
  email?: string // required if no phone
  numero_telephone?: string // required if no email
  password: string // min 8 chars
  full_name: string
  role: UserRole
  org_name: OrgName
  file?: File // proof document
}

export interface UserPublicResponse {
  email: string
  full_name: string
  numero_telephone?: string
  role: UserRole
  org_name: OrgName
  blockchain_id: string
  blockchain_validated: boolean
  document_legalite_hash?: string
  is_active?: boolean
  created_at?: string
}

export interface CooperativePublic {
  blockchain_id: string
  full_name: string
  org_name: OrgName
  role: "COOPERATIVE"
}

export interface ProducerRegisterDelegated {
  fullName: string
  numeroTelephone: string
  location?: string
}

export interface AgentRegister {
  email: string
  full_name: string
  numero_telephone?: string
  role: UserRole
}

export interface PendingRegistration {
  id: number
  email: string
  full_name: string
  role: UserRole
  org_name: OrgName
  blockchain_validated: boolean
  created_at: string
}

// ============================================================================
// ACTOR TYPES
// ============================================================================

export type UserRole = "PRODUCTEUR" | "COOPERATIVE" | "EXPORTATEUR" | "CERTIF" | "MINISTERE" | "TRANSFORMATEUR"

export type OrgName = "producteurs" | "cooperatives" | "exportateurs" | "certif" | "ministere" | "transformateurs"

export interface ActorRegister {
  actorIdHash: string
  typeActeur: UserRole
  clePublique: string
  orgName: OrgName
}

export interface PendingProducer {
  actor_id: string
  full_name: string
  email?: string
  created_at: string
}

export interface ActorRegistrationResponse {
  success: boolean
  message: string
  ca_details?: Record<string, any>
  chaincode_details?: Record<string, any>
}

// ============================================================================
// LOT TYPES
// ============================================================================

export interface CreateLotRequest {
  parcelle_id: string
  poids_kg: number
  espece: string
  date_collecte: string // ISO 8601
  coop_id?: string
  file: File // harvest photo
}

export interface LotDetail {
  docType: "lot"
  lotHash: string
  farmerId: string
  espece: string
  poidsKg: number
  dateCollecte: string
  statut: LotStatus
  coopId?: string
  gps?: GPSModel
  mediaHash?: string
  createdAt?: string
}

export interface CreateLotResponse {
  success: boolean
  lot_id: string
  blockchain: {
    success: boolean
    result: LotDetail
  }
  media: {
    hash: string
    url: string
  }
}

export type LotStatus = "COLLECTE" | "EN_TRANSIT" | "TRANSFORME" | "EXPORTE"

export interface LotStatusUpdate {
  statut: LotStatus
}

export interface RegroupRequest {
  lot_hashes: string[]
  nouveau_lot_id?: string
}

export interface BundleCreate {
  bundle_hash: string
  lot_hashes: string[]
  type: "REGROUPEMENT" | "TRANSFORMATION"
  poids_kg_final?: number
}

// ============================================================================
// PARCELLE (LAND PLOT) TYPES
// ============================================================================

export interface ParcelleCreate {
  parcelleId?: string
  farmerId?: string
  gps: GPSModel[]
  culture: string
  surface: number
}

export interface ParcelleDetail extends ParcelleCreate {
  dateEnregistrement?: string
}

export interface GPSModel {
  latitude: number
  longitude: number
}

// ============================================================================
// TRACEABILITY TYPES
// ============================================================================

export interface CreateTransferRequest {
  transfer_hash: string
  lot_hashes: string[]
  expediteur_id: string
  destinataire_id: string
  preuve_hash: string // SHA-256 of transfer document
}

export interface CreateTransformationRequest {
  transformation_hash: string
  lot_hashes: string[]
  type_processus: "FERMENTATION" | "SECHAGE" | "TORREFACTION"
  preuve_hash: string
}

export interface CreateShipmentRequest {
  shipmentHash: string
  lotHashes: string[]
  exportateurId: string
  destination: string
  documentsHash: string
  dateDepartPrevue: string // ISO 8601
  dateArriveePrevue: string // ISO 8601
}

export interface TransferEvent {
  transfer_hash: string
  lot_hashes: string[]
  expediteur_id: string
  destinataire_id: string
  timestamp: string
  status: "EN_ATTENTE" | "CONFIRMÉ" | "REJETÉ"
}

export interface ShipmentDetail {
  shipmentHash: string
  lotHashes: string[]
  exportateurId: string
  destination: string
  documentsHash: string
  dateDepartPrevue: string
  dateArriveePrevue: string
  dateDepart?: string
  dateArrivee?: string
  status: "PLANIFIÉ" | "EN_TRANSIT" | "ARRIVÉ" | "LIVRÉ"
}

// ============================================================================
// AUDIT & CERTIFICATION TYPES
// ============================================================================

export interface CertificationCreate {
  lot_hash: string
  certification_type: string // UTZ, RainForest, Fairtrade, etc.
  certified_by: string
  certification_date: string
  valid_until: string
  document_hash: string
}

export interface CertificationDetail {
  cert_id: string
  lot_hash: string
  certification_type: string
  certified_by: string
  certification_date: string
  valid_until: string
  document_hash: string
  status: "VALID" | "EXPIRED" | "REVOKED"
}

export interface AssetHistory {
  txId: string
  timestamp: string
  isDelete: boolean
  value: Record<string, any>
}

export interface EUDRReportData {
  success: boolean
  report_timestamp: string
  compliance_status: "COMPLIANT" | "NON_COMPLIANT" | "PENDING_REVIEW"
  access_level: "FULL" | "RESTRICTED" | "PUBLIC"
  data: {
    lot: LotDetail
    history: AssetHistory[]
    certifications: CertificationDetail[]
    gps?: GPSModel // only for MINISTERE
  }
  proof_hash: string
}

export interface ShipmentReportData {
  success: boolean
  report_timestamp: string
  shipment: ShipmentDetail
  lots: LotDetail[]
  history: AssetHistory[]
  certifications: CertificationDetail[]
}

export interface VerifyLotPublic {
  lot_id: string
  product: string
  harvest_info: {
    date: string
    species: string
    weight: number
  }
  origin_photo: string
  journey: Array<{
    step: LotStatus
    date: string
    txId: string
  }>
  blockchain_verified: boolean
}

export interface QueryByStatusResponse {
  [key: string]: LotDetail[]
}

export interface QueryByFarmerResponse {
  farmer_id: string
  lots: LotDetail[]
}

export interface GetCertificationsResponse {
  certifications: CertificationDetail[]
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface HTTPValidationError {
  detail: Array<{
    loc: (string | number)[]
    msg: string
    type: string
  }>
}

export interface APIError {
  detail: string
  status: number
  error_code?: string
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type APIMethod = "GET" | "POST" | "PUT" | "DELETE"

export interface APIResponse<T> {
  data: T
  success: boolean
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  has_more: boolean
}
