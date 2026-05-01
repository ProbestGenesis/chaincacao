export type UserRole = 'Agriculteur' | 'CoopManager' | 'Transformer' | 'Exporter' | 'CarrierUser' | 'Verifier' | 'Importer' | 'MinistryAnalyst' | 'Admin';

export type LotStatus = 'draft' | 'pending' | 'verified'| 'transferred' | 'transformed' | 'exported';
export type TransportStatus = 'assigne' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

export interface Role {
  roleId: string;
  nom: UserRole;
  permissions: string[];
}

export interface Actor {
  actorId: string;
  type: string;
  nom: string;
  identifiantLegal: string;
  localisation: {
    region: string;
    village: string;
  };
  clePublique?: string;
}

export interface User {
  userId: string;
  email: string;
  telephone: string;
  nomAffiche: string;
  roles: UserRole[];
  actorId?: string;
  statut: 'actif' | 'inactif';
  dateCreation: number;
  derniereConnexion: number;
}

export interface Lot {
  lotId: string;
  farmerId: string;
  photoUrls: string[];
  photoHashes: string[];
  gps: { latitude: number; longitude: number };
  region: string;
  poidsKg: number;
  espece: string;
  dateCollecte: number;
  coopName: string;
  statut: LotStatus;
  syncStatus: 'synced' | 'pending' | 'error';
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  isGroup?: boolean;
  groupId?: string;
  groupName?: string;
  sourceLotIds?: string[];
}

export interface TransportOrder {
  orderId: string;
  transporterId: string;
  lieuPickup: string;
  lieuDropoff: string;
  datePickup: number;
  eta: number;
  statut: TransportStatus;
  vehicleInfo?: {
    immatriculation: string;
    typeVehicule: string;
    capaciteKg: number;
  };
  driverId?: string;
}
