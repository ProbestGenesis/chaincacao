# 📦 Documentation API — ChainCacao Backend

> Version **2.0.0** · FastAPI · SQLite/PostgreSQL · Hyperledger Fabric via Node.js Gateway
> Mise à jour : 2026-05-02

---

## 1. Vue d'ensemble

Le backend ChainCacao est un pont entre les applications clientes et le réseau Hyperledger Fabric. Il gère :

- **L'authentification** des utilisateurs (JWT / OAuth2)
- **La création et la lecture** des lots de cacao (formulaire multipart + fichier image)
- **Le stockage des médias** (images de récolte, hash SHA-256)
- **La traçabilité** complète via le ledger Fabric (historique immuable)
- **Les rapports EUDR** (conformité réglementaire UE)

```
Client HTTP
   │
   ▼
FastAPI (port 8000)
   │ POST /invoke · GET /query
   ▼
Node.js Gateway (port 3000)
   │ gRPC
   ▼
Hyperledger Fabric Peers (ports 7051 / 8051 / 9051 / 10051 / 11051)
```

---

## 2. Technologies

| Composant         | Technologie                          |
| :---------------- | :----------------------------------- |
| Framework         | FastAPI (Python 3.x)                 |
| Base de données   | SQLite (dev) / PostgreSQL (prod)     |
| ORM               | SQLAlchemy                           |
| Auth              | JWT (HS256) via `python-jose`        |
| Hashage mdp       | bcrypt via `passlib`                 |
| Bridge Blockchain | Node.js Gateway (Express + Fabric SDK) |
| Stockage médias   | Système de fichiers local (`/uploads`) |

---

## 3. Configuration (`.env`)

```env
DATABASE_URL=sqlite:///./chaincacao.db   # ou postgresql://...
BLOCKCHAIN_GATEWAY_URL=http://localhost:3000
SECRET_KEY=<clé_secrète_longue>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
UPLOAD_DIR=uploads
```

---

## 4. Authentification

L'API utilise **OAuth2 avec Bearer Token (JWT)**. Toutes les routes protégées nécessitent le header :

```
Authorization: Bearer <access_token>
```

Le token est obtenu via `POST /api/v1/auth/login`.

---

## 5. Endpoints

### 🔐 Authentification (`/api/v1/auth`)

#### `POST /api/v1/auth/login`
Authentifie un utilisateur et retourne un JWT.

- **Content-Type** : `application/x-www-form-urlencoded`
- **Auth requise** : Non

**Corps de la requête :**
| Champ      | Type   | Description         |
| :--------- | :----- | :------------------ |
| `username` | string | Email de l'utilisateur |
| `password` | string | Mot de passe        |

**Réponse 200 :**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "user": {
    "full_name": "Amadou Koffi",
    "role": "PRODUCTEUR",
    "org": "producteurs"
  }
}
```

#### `POST /api/v1/auth/register`
Inscrit un nouvel utilisateur et stocke ses preuves de légalité.

- **Content-Type** : `multipart/form-data`
- **Auth requise** : Non

**Champs du formulaire :**
| Champ | Type | Obligatoire | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | Non* | Email (*requis si pas de téléphone) |
| `numero_telephone` | string | Non* | Téléphone (*requis si pas d'email) |
| `password` | string | Oui | Min 8 caractères |
| `full_name` | string | Oui | Nom complet de la personne ou entité |
| `role` | string | Oui | [PRODUCTEUR, COOPERATIVE, EXPORTATEUR, etc.] |
| `org_name` | string | Oui | Org Fabric associée |
| `file` | file | **Oui** | **Preuve de légalité** (Requis pour COOPERATIVE, EXPORTATEUR, CERTIF) |

**Réponse 201 :** Identique à `UserPublicResponse`.

---

#### `GET /api/v1/auth/me`
Retourne le profil complet de l'utilisateur connecté.

- **Auth requise** : ✅ Bearer Token

**Réponse 200 :**
```json
{
  "email": "prod@test.com",
  "full_name": "Producteur de Test",
  "role": "PRODUCTEUR",
  "org": "producteurs",
  "blockchain_id": "admin"
}
```

---

### 🗳️ Lots de Cacao (`/api/v1/lots`)

#### `POST /api/v1/lots/`
Crée un nouveau lot de récolte. Opération complète en une seule requête :

1. Vérifie que l'utilisateur a le rôle `PRODUCTEUR`
2. Génère un ID de lot unique (`LOT-YYYYMMDD-XXXXXXXX`)
3. Calcule le hash SHA-256 du fichier image
4. Sauvegarde l'image dans `uploads/` et les métadonnées en base
5. Invoque le Smart Contract `CreateLot` sur le ledger Fabric

- **Content-Type** : `multipart/form-data`
- **Auth requise** : ✅ Bearer Token (rôle `PRODUCTEUR`)

**Corps de la requête :**
| Champ          | Type   | Requis | Description                        |
| :------------- | :----- | :----- | :--------------------------------- |
| `parcelle_id`  | string | ✅     | ID de la parcelle (ex: `"PARC-01"`) |
| `poids_kg`     | string | ✅     | Poids du lot en kg (ex: `"120.5"`) |
| `espece`       | string | ✅     | Espèce de cacao (ex: `"Forastero"`) |
| `date_collecte`| string | ✅     | Date ISO 8601 (ex: `"2026-05-02"`) |
| `coop_id`      | string | ❌     | Identifiant de la coopérative      |
| `file`         | file   | ✅     | Photo de la récolte (image)        |

**Note :** Les coordonnées GPS sont héritées de la parcelle.

**Réponse 201 :**
```json
{
  "success": true,
  "lot_id": "LOT-20260502-6D06C35D",
  "blockchain": {
    "success": true,
    "result": {
      "docType": "lot",
      "lotHash": "LOT-20260502-6D06C35D",
      "espece": "Forastero Togo",
      "poidsKg": 120.5,
      "statut": "COLLECTE"
    }
  },
  "media": {
    "hash": "0e1137dc983e...",
    "url": "/api/v1/lots/media/0e1137dc983e..."
  }
}
```

**Erreurs :**
| Code | Cause |
| :--- | :---- |
| 400  | Erreur de format numérique (latitude/longitude/poids) |
| 403  | Utilisateur non-PRODUCTEUR |
| 500  | Erreur interne backend ou gateway blockchain |

---

#### `GET /api/v1/lots/{lot_hash}`
Récupère l'état actuel d'un lot directement depuis le ledger Fabric.

- **Auth requise** : Non
- **Paramètre URL** : `lot_hash` — ex: `LOT-20260502-6D06C35D`
- **Query** : `org_name` (optionnel, défaut: `"producteurs"`) — organisation qui soumet la requête

**Réponse 200 :**
```json
{
  "success": true,
  "data": {
    "docType": "lot",
    "lotHash": "LOT-20260502-6D06C35D",
    "farmerId": "admin",
    "espece": "Forastero Togo",
    "poidsKg": 120.5,
    "dateCollecte": "2026-05-02",
    "statut": "COLLECTE",
    "coopId": "COOP-SECURE-001",
    "gps": { "latitude": 6.1234, "longitude": 1.1234 },
    "mediaHash": "0e1137dc983e..."
  }
}
```

**Erreurs :**
| Code | Cause |
| :--- | :---- |
| 404  | Lot introuvable sur le ledger |

---

#### `GET /api/v1/lots/media/{media_hash}`
Retourne le fichier image associé à un lot (servi depuis le disque local).

- **Auth requise** : Non
- **Paramètre URL** : `media_hash` — hash SHA-256 du fichier

**Réponse 200 :** Fichier binaire (image)

**Erreurs :**
| Code | Cause |
| :--- | :---- |
| 404  | Fichier introuvable dans la base de métadonnées |

---

### 👤 Acteurs (`/api/v1/actors`)

#### `POST /api/v1/actors/register`
Enregistre un nouvel acteur en deux étapes :
1. Enrôlement de l'identité dans la **Fabric CA** (certificats X.509)
2. Inscription des métadonnées métier dans le **Smart Contract** (`RegisterActor`)

- **Content-Type** : `application/json`
- **Auth requise** : Non (endpoint interne, sécuriser en prod)

**Corps de la requête :**
```json
{
  "actorIdHash": "FARMER-001",
  "typeActeur": "PRODUCTEUR",
  "clePublique": "PUB-KEY-XXXXX",
  "orgName": "producteurs"
}
```

| Champ         | Type   | Valeurs possibles                         |
| :------------ | :----- | :---------------------------------------- |
| `actorIdHash` | string | Identifiant unique de l'acteur            |
| `typeActeur`  | string | `PRODUCTEUR`, `EXPORTATEUR`, `CERTIF`, `MINISTERE` |
| `clePublique` | string | Clé publique de l'acteur                  |
| `orgName`     | string | `producteurs`, `exportateurs`, `certif`, `ministere`, `transformateurs` |

**Réponse 201 :**
```json
{
  "success": true,
  "message": "Actor fully registered in CA and Blockchain",
  "ca_details": { ... },
  "chaincode_details": { ... }
}
```

---

### 🔗 Traçabilité (`/api/v1/traceability`)

#### `POST /api/v1/traceability/transfers`
Enregistre un transfert de propriété entre deux acteurs.

- **Auth requise** : Non
- **Chaincode** : `CreateTransfer`

**Corps :**
```json
{
  "transfer_hash": "TRANSFER-XXX",
  "lot_hashes": ["LOT-20260502-6D06C35D"],
  "expediteur_id": "FARMER-001",
  "destinataire_id": "EXPORTER-001",
  "preuve_hash": "sha256_du_document_de_transfert"
}
```

---

#### `POST /api/v1/traceability/transformations`
Enregistre une transformation industrielle d'un ou plusieurs lots.

- **Auth requise** : Non
- **Chaincode** : `CreateTransformation`

**Corps :**
```json
{
  "transformation_hash": "TRANSFORM-XXX",
  "lot_hashes": ["LOT-20260502-6D06C35D"],
  "type_processus": "FERMENTATION",
  "preuve_hash": "sha256_du_rapport"
}
```

---

#### `POST /api/v1/traceability/shipments`
Enregistre un envoi international.

- **Auth requise** : Non
- **Chaincode** : `CreateShipment`

**Corps :**
```json
{
  "shipmentHash": "SHIP-XXX",
  "lotHashes": ["LOT-20260502-6D06C35D"],
  "exportateurId": "EXPORTER-001",
  "destination": "Rotterdam, NL",
  "documentsHash": "sha256_des_docs_douane",
  "dateDepartPrevue": "2026-06-01",
  "dateArriveePrevue": "2026-06-15"
}
```

---

### 📊 Audit & Requêtes (`/api/v1/audit`)

#### `GET /api/v1/audit/history/{asset_hash}`
Retourne l'historique immuable complet d'un actif (lot, transfert, envoi).

- **Auth requise** : Non

**Réponse 200 :** Liste d'entrées de l'historique Fabric :
```json
[
  {
    "txId": "abc123...",
    "timestamp": "2026-05-02T10:00:00Z",
    "isDelete": false,
    "value": { "statut": "COLLECTE", ... }
  }
]
```

---

#### `GET /api/v1/audit/query/status/{status}`
Recherche tous les lots ayant un statut donné (index CouchDB).

- **Auth requise** : Non
- **Valeurs de `status`** : `COLLECTE`, `EN_TRANSIT`, `TRANSFORME`, `EXPORTE`

---

#### `GET /api/v1/audit/query/farmer/{farmer_id}`
Retourne tous les lots associés à un producteur donné.

- **Auth requise** : Non

---

#### `GET /api/v1/audit/query/certifications/{ref_hash}`
Retourne toutes les certifications liées à un lot ou un envoi.

- **Auth requise** : Non

---

#### `GET /api/v1/audit/verify/{lot_hash}`
**Endpoint public** — conçu pour les QR Codes consommateurs. Retourne une vue simplifiée du parcours du lot.

- **Auth requise** : Non

**Réponse 200 :**
```json
{
  "lot_id": "LOT-20260502-6D06C35D",
  "product": "Cacao du Togo",
  "harvest_info": {
    "date": "2026-05-02",
    "species": "Forastero Togo",
    "weight": 120.5
  },
  "origin_photo": "/api/v1/lots/media/0e1137dc...",
  "journey": [
    { "step": "COLLECTE", "date": "2026-05-02T10:00:00Z", "txId": "abc123..." }
  ],
  "blockchain_verified": true
}
```

---

#### `GET /api/v1/audit/eudr-report/{lot_hash}`
Génère un rapport de conformité structuré pour le règlement européen **EUDR** (EU Deforestation Regulation).
Agrège : état du lot, historique complet, et certifications. Accès aux données GPS privées si la requête provient de l'org `ministere`.

- **Auth requise** : Non

**Réponse 200 :**
```json
{
  "success": true,
  "report_timestamp": "2026-05-02",
  "compliance_status": "COMPLIANT",
  "access_level": "FULL",
  "data": {
    "lot": { ... },
    "history": [ ... ],
    "certifications": [ ... ]
  },
  "proof_hash": "LOT-20260502-6D06C35D"
}
```

**Erreurs :**
| Code | Cause |
| :--- | :---- |
| 404  | Lot introuvable |

---

## 6. Schémas de la Base de Données (SQLite/PostgreSQL)

### Table `users`
| Colonne           | Type     | Description                           |
| :---------------- | :------- | :------------------------------------ |
| `id`              | Integer  | Clé primaire auto-incrémentée         |
| `email`           | String   | Email unique (sert de login)          |
| `hashed_password` | String   | Mot de passe hashé (bcrypt)           |
| `full_name`       | String   | Nom complet                           |
| `role`            | String   | `PRODUCTEUR`, `EXPORTATEUR`, etc.     |
| `org_name`        | String   | Org Fabric : `producteurs`, `exportateurs`… |
| `blockchain_id`   | String   | Identifiant unique dans le wallet Fabric |
| `is_active`       | Boolean  | Compte actif (défaut: `true`)         |
| `created_at`      | DateTime | Date de création                      |

### Table `media_metadata`
| Colonne      | Type     | Description                          |
| :----------- | :------- | :----------------------------------- |
| `id`         | Integer  | Clé primaire auto-incrémentée        |
| `lot_hash`   | String   | Lien avec le lot blockchain          |
| `filename`   | String   | Nom du fichier original              |
| `file_path`  | String   | Chemin sur le disque                 |
| `sha256_hash`| String   | Hash unique du fichier (clé unique)  |
| `created_at` | DateTime | Date d'upload                        |

---

## 7. Intégration Gateway Node.js

Le backend communique avec la Gateway Node.js (`http://localhost:3000`) via trois endpoints internes :

| Endpoint Gateway | Rôle                                          |
| :--------------- | :-------------------------------------------- |
| `POST /invoke`   | Soumettre une transaction (écriture ledger)   |
| `POST /query`    | Évaluer une transaction (lecture ledger)      |
| `POST /register` | Enrôler un nouvel utilisateur dans la CA      |

**Headers transmis à la Gateway :**
```
X-Org-Name: producteurs   # Organisation Fabric de l'appelant
X-User-ID:  admin         # Identité dans le wallet Fabric
```

**Timeouts configurés :**
| Opération | Timeout |
| :-------- | :------ |
| Invoke    | 45 s    |
| Query     | 10 s    |
| Register  | 30 s    |

---

## 8. Rôles et Contrôle d'Accès

| Rôle          | Org Fabric       | Permissions                              |
| :------------ | :--------------- | :--------------------------------------- |
| `PRODUCTEUR`  | `producteurs`    | Créer des lots (`POST /lots/`)           |
| `EXPORTATEUR` | `exportateurs`   | Créer des envois et transformations      |
| `CERTIF`      | `certif`         | Ajouter des certifications               |
| `MINISTERE`   | `ministere`      | Accès complet + données GPS privées      |

---

## 9. Codes d'Erreur Communs

| Code HTTP | Signification                          |
| :-------- | :------------------------------------- |
| 400       | Données invalides (format, type)       |
| 401       | Token manquant ou expiré               |
| 403       | Rôle insuffisant                       |
| 404       | Ressource introuvable (lot, média)     |
| 500       | Erreur interne (backend ou gateway)    |
