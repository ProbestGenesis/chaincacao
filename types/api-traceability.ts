export type LotStatus = "COLLECTE" | "EN_TRANSIT" | "TRANSFORME" | "EXPORTE"

export interface HistoryEntry {
  txId: string
  timestamp: string
  isDelete: boolean
  value: {
    statut: LotStatus
    [key: string]: any
  }
}

export interface EUDRReport {
  success: boolean
  report_timestamp: string
  compliance_status: "COMPLIANT" | "NON_COMPLIANT" | "PENDING"
  access_level: "FULL" | "PARTIAL"
  data: {
    lot: Record<string, any>
    history: HistoryEntry[]
    certifications: Record<string, any>[]
  }
  proof_hash: string
}

export interface TransferPayload {
  transferHash: string
  lotHashes: string[]      // Sera JSON.stringify() avant envoi
  expediteurId: string
  destinataireId: string
  transporteurId?: string
  file: File               // Document de preuve obligatoire
}

export interface TransformationPayload {
  transformationHash: string
  lotHashes: string[]
  typeProcessus: string
  file: File
}

export interface ShipmentPayload {
  shipmentHash: string
  lotHashes: string[]
  exportateurId: string
  destination: string
  dateDepartPrevue: string
  dateArriveePrevue: string
  file: File
}

export interface VerificationResponse {
  lot_id: string
  product: string
  harvest_info: {
    date: string
    species: string
    weight: number
  }
  origin_photo: string
  journey: {
    step: LotStatus
    date: string
    txId: string
  }[]
  blockchain_verified: boolean
}

export interface AuditQueryLot {
  docType: string
  lotHash: string
  farmerId: string
  espece: string
  poidsKg: number
  dateCollecte: string
  statut: LotStatus
  coopId?: string
  gps?: { latitude: number; longitude: number }
  mediaHash?: string
}

export type AuditQueryResponse = AuditQueryLot[] | {
  success: boolean
  data: AuditQueryLot[]
}

export interface CertificationPayload {
  lot_hash: string
  certifier_id: string
  type: string
  ref_hash: string
  metadata?: Record<string, any>
}

export interface ShipmentReport {
  success: boolean
  report_timestamp: string
  shipment: Record<string, any>
  lots: Record<string, any>[]
  compliance_summary: any
  proof_hash: string
}
