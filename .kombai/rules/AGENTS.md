Databse Table {
    Utilisateur 

userId : String 

email : String 

telephone : String 

nomAffiche : String 

roles[] : Array of Strings (roleId) 

actorId? : String (optionnel, lié à un acteur) 

statut : String (actif / inactif) 

dateCreation : Timestamp 

derniereConnexion : Timestamp 

Role 

roleId : String 

nom : String (Agriculteur, CoopManager, Transformer, Exporter, CarrierUser, Verifier, Importer, MinistryAnalyst, Admin) 

permissions[] : Array of Strings (liste de permissions) 

Acteur 

actorId : String 

type : String (Farmer / Coop / Exporter / Transporter / Verifier / etc.) 

nom : String 

identifiantLegal : String 

localisation : Object (region, village) 

clePublique : String (optionnelle pour signature) 

LotOffChain 

lotId : String 

lotHashOnChain? : String (optionnel) 

farmerId : String 

photoUrls[] : Array of Strings 

photoHashes[] : Array of Strings 

gps : Object (latitude, longitude) 

region : String 

poidsKg : Number 

espece : String 

dateCollecte : Timestamp 

coopName : String 

statut : String (draft / pending / transferred / transformed / exported) 

syncStatus : String (synced / pending / error) 

createdBy : String 

createdAt : Timestamp 

updatedAt : Timestamp 

TransfertOffChain 

transferId : String 

transferHashOnChain? : String (optionnel) 

lotIds[] : Array of Strings 

expediteurNom : String 

destinataireNom : String 

preuveDocumentUrl : String 

syncStatus : String 

createdAt : Timestamp 

signedBy[] : Array of Strings 

TransformationOffChain 

transformationId : String 

lotIds[] : Array of Strings 

detailsProcessus : String (notes, mesures qualité) 

mediaUrls[] : Array of Strings 

documentsUrl[] : Array of Strings 

syncStatus : String 

ExpeditionOffChain (ShipmentOffChain) 

shipmentId : String 

lotIds[] : Array of Strings 

exportateurId : String 

destinationPort : String 

detailsTransport : String (camion, bateau, conteneur) 

documentsUrl[] : Array of Strings 

syncStatus : String 

eta : Timestamp 

status : String 

CertificationOffChain 

certId : String 

lotIds[] : Array of Strings 

shipmentId : String 

rapportUrl : String (PDF) 

commentaires : String 

syncStatus : String 

issuedAt : Timestamp 

Transporteur (entité unique combinée) 

transporterId : String (identifiant unique du transporteur) 

nomEntreprise : String (nom de l'entreprise de transport) 

identifiantLegal : String (numéro d'identification légale) 

contact : Object (coordonnées de contact) 

email : String (adresse email) 

telephone : String (numéro de téléphone) 

adresse : String (adresse postale complète) 

vehicule : Object (informations sur le véhicule) 

immatriculation : String (numéro d'immatriculation) 

typeVehicule : String (type de véhicule : camion / conteneur) 

capaciteKg : Number (capacité en kilogrammes) 

derniereInspection : Timestamp (date de la dernière inspection) 

statut : String (statut du véhicule) 

statutKYC : String (statut KYC : pending / verified / rejected) 

assurancesIds[] : Array of Strings (identifiants des assurances) 

createdAt : Timestamp (date de création de l'enregistrement) 

OrdreTransport 

orderId : String 

shipmentId ou transferId : String 

transporterId : String 

vehicleId? : String (optionnel) 

driverId? : String (optionnel) 

lieuPickup : String 

lieuDropoff : String 

datePickup : Timestamp 

eta : Timestamp 

statut : String (assigne / picked_up / in_transit / delivered / cancelled) 

EvenementSuivi (TrackingEvent) 

eventId : String 

orderId : String 

shipmentId? : String (optionnel) 

gps : Object (latitude, longitude) 

timestamp : Timestamp 

statut : String 

mediaIds[] : Array of Strings 

reportedBy : String (deviceId / driverId) 

ContratTransport (CarrierContract) 

contractId : String 

transporterId : String 

clientActorId : String 

termsUrl : String 

dateDebut : Timestamp 

dateFin : Timestamp 

statut : String 

Assurance 

insuranceId : String 

fournisseur : String 

numPolice : String 

couvertureUrl : String 

valideDe : Timestamp 

valideA : Timestamp 

Media 

mediaId : String 

url : String 

hash : String 

type : String (photo / pdf) 

taille : Number 

uploadePar : String 

dateUpload : Timestamp 

FileAttente (QueueItem) 

queueId : String 

payloadType : String (create_lot / transfer / sync_media / etc.) 

payloadRef : String (référence à l’objet off‑chain) 

mediaRefs[] : Array of Strings 

tentatives : Number 

statut : String (pending / failed / sent) 

dateCreation : Timestamp 

JournalAudit (AuditLog) 

logId : String 

actorId : String 

userId? : String (optionnel) 

action : String 

cibleType : String 

cibleId : String 

details : String 

timestamp : Timestamp 

Notification 

notifId : String 

destinataireUserId : String 

type : String 

contenu : String 

lu : Boolean 

dateCreation : Timestamp 
}