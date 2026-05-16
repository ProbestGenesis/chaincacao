# ChainCacao API - Audit des Permissions par Endpoint

**Date**: 2026-05-15  
**Source**: API_DOC.md Section 8 - Rôles et Contrôle d'Accès

---

## 📊 Matrice Complète des Permissions

### Legend
- ✅ = Peut accéder
- ❌ = Accès refusé
- 🔒 = Données restreintes (GPS, infos sensibles)
- 👁️ = Lecture seule

---

## 🔐 AUTHENTICATION (8 endpoints)

| Endpoint | PRODUCTEUR | COOPERATIVE | EXPORTATEUR | TRANSFORMATEUR | CERTIF | MINISTERE | Public |
|----------|-----------|------------|------------|----------------|--------|----------|--------|
| `POST /auth/register` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /auth/login` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /auth/me` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `GET /auth/cooperatives/public` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /auth/users` | ❌ | ✅👁️ (membres) | ❌ | ❌ | ❌ | ✅👁️ (tous) | ❌ |
| `GET /auth/pending-registrations` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅👁️ | ❌ |
| `POST /auth/register-producer` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /auth/register-agent` | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |

**Restriction**: 
- COOPERATIVE ne voit que les utilisateurs de sa coopérative
- MINISTERE voit tous les utilisateurs

---

## 👤 ACTORS (2 endpoints)

| Endpoint | PRODUCTEUR | COOPERATIVE | EXPORTATEUR | TRANSFORMATEUR | CERTIF | MINISTERE |
|----------|-----------|------------|------------|----------------|--------|----------|
| `GET /actors/producers/pending` | ❌ | ✅👁️ | ❌ | ❌ | ❌ | ✅👁️ |
| `POST /actors/register` | ❌ | ✅ (PRODUCTEUR only) | ❌ | ❌ | ❌ | ✅ (any type) |

**Restrictions**:
- COOPERATIVE peut valider uniquement les PRODUCTEUR
- MINISTERE peut valider n'importe quel type d'acteur (PRODUCTEUR, EXPORTATEUR, CERTIF, etc.)

---

## 📦 LOTS (5 endpoints)

| Endpoint | PRODUCTEUR | COOPERATIVE | EXPORTATEUR | TRANSFORMATEUR | CERTIF | MINISTERE | Public |
|----------|-----------|------------|------------|----------------|--------|----------|--------|
| `POST /lots/` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /lots/{lot_hash}` | ✅👁️ (own) | ✅👁️ (members) | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ (public) |
| `PUT /lots/{lot_hash}/status` | ✅ (own) | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `POST /lots/regroup` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /lots/media/{media_hash}` | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ (public) |

**Restrictions**:
- PRODUCTEUR crée ses propres lots via sa parcelle
- PRODUCTEUR ne peut modifier le statut que de ses propres lots
- COOPERATIVE regroupe les lots de ses producteurs
- Les lots sont lisibles par tous (filtrage côté serveur pour données sensibles)

---

## 🌾 PARCELLES (3 endpoints)

| Endpoint | PRODUCTEUR | COOPERATIVE | EXPORTATEUR | TRANSFORMATEUR | CERTIF | MINISTERE |
|----------|-----------|------------|------------|----------------|--------|----------|
| `POST /parcelles/` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /parcelles/me` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /parcelles/{id}` | ✅👁️ (own) | ✅👁️ (members) | ❌ | ❌ | ❌ | ✅👁️ (all) |

**Restrictions**:
- PRODUCTEUR manage ses propres parcelles
- COOPERATIVE voit les parcelles de ses producteurs
- MINISTERE voit toutes les parcelles (inclut GPS)

---

## 🔗 TRACEABILITY (3 endpoints)

| Endpoint | PRODUCTEUR | COOPERATIVE | EXPORTATEUR | TRANSFORMATEUR | CERTIF | MINISTERE |
|----------|-----------|------------|------------|----------------|--------|----------|
| `POST /traceability/transfers` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `POST /traceability/transformations` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `POST /traceability/shipments` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |

**Restrictions**:
- PRODUCTEUR/COOPERATIVE: créent des transferts
- TRANSFORMATEUR: enregistre les transformations
- EXPORTATEUR: crée les envois internationaux

---

## 🔍 AUDIT & QUERIES (11 endpoints)

| Endpoint | PRODUCTEUR | COOPERATIVE | EXPORTATEUR | TRANSFORMATEUR | CERTIF | MINISTERE | Public |
|----------|-----------|------------|------------|----------------|--------|----------|--------|
| `POST /audit/certifications` | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `GET /audit/history/{hash}` | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ (public) |
| `GET /audit/query/status/{status}` | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ (public) |
| `GET /audit/query/farmer/{id}` | ✅👁️ (own) | ✅👁️ (members) | ✅👁️ | ❌ | ✅👁️ | ✅👁️ | ❌ |
| `GET /audit/query/certifications/{hash}` | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ | ✅👁️ (public) |
| `GET /audit/eudr-report/{hash}` | ✅👁️ 🔒(no GPS) | ✅👁️ 🔒(no GPS) | ✅👁️ 🔒(no GPS) | ❌ | ✅👁️ 🔒(no GPS) | ✅👁️ 🔒(+GPS) | ✅👁️ 🔒(restricted) |
| `GET /audit/eudr-report/{hash}/pdf` | ✅ 🔒 | ✅ 🔒 | ✅ 🔒 | ❌ | ✅ 🔒 | ✅ 🔒 | ✅ 🔒 |
| `GET /audit/verify/{hash}` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (QR code public) |
| `GET /audit/shipment-report/{hash}` | ❌ | ❌ | ✅👁️ | ❌ | ❌ | ✅👁️ | ❌ |
| `GET /audit/shipment-report/{hash}/pdf` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |

**Restrictions Importantes**:

1. **EUDR Report avec GPS**:
   - MINISTERE: ✅ (données complètes avec GPS)
   - Autres: ✅ (données publiques, sans GPS)
   - Public: ✅ (très restreint)

2. **Query by Farmer**:
   - PRODUCTEUR: voit ses propres lots
   - COOPERATIVE: voit les lots de ses producteurs
   - EXPORTATEUR: voit tous les lots
   - TRANSFORMATEUR: accès refusé
   - MINISTERE: voit tous

3. **Shipment Reports**:
   - EXPORTATEUR: ✅ (crée et lit)
   - MINISTERE: ✅
   - Autres: ❌

---

## 📋 Résumé par Rôle

### 👨‍🌾 PRODUCTEUR
- **Créer**: Lots, Parcelles
- **Lire**: Ses propres lots/parcelles + historique public
- **Participer**: Transferts
- **Total Permissions**: 12

### 🏢 COOPERATIVE
- **Inscrire**: Producteurs, Agents
- **Valider**: Producteurs sur blockchain
- **Créer**: Groupements, Certifications, Transferts
- **Lire**: Lots/Parcelles des membres
- **Total Permissions**: 18

### 📤 EXPORTATEUR
- **Créer**: Transferts, Envois internationaux
- **Lire**: Tous les lots, Rapports d'expédition, EUDR reports
- **Total Permissions**: 13

### ⚙️ TRANSFORMATEUR
- **Créer**: Transformations, Transferts
- **Lire**: Lots, Historique, Statuts
- **Total Permissions**: 8

### ✅ CERTIF (Certificateur)
- **Créer**: Certifications
- **Lire**: Lots, Historique, Certifications
- **Total Permissions**: 8

### 🏛️ MINISTERE (Admin)
- **Accès Complet**: Toutes les actions ✅
- **Données Sensibles**: GPS incluses dans rapports
- **Total Permissions**: 26 (toutes)

---

## 🔒 Données Sensibles par Rôle

| Données | PRODUCTEUR | COOPERATIVE | EXPORTATEUR | TRANSFORMATEUR | CERTIF | MINISTERE |
|---------|-----------|------------|------------|----------------|--------|----------|
| GPS Parcelles | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| GPS dans EUDR | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Email Users | ❌ | ✅ (membres) | ❌ | ❌ | ❌ | ✅ |
| Pending Registrations | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Document Légalité Hash | ❌ | ✅ (membres) | ❌ | ❌ | ❌ | ✅ |

---

## 🚨 Erreurs Courants à Éviter

### ❌ ERREUR: PRODUCTEUR crée un transfert sans lot existant
**Correction**: Vérifier que le producteur a créé le lot d'abord

### ❌ ERREUR: COOPERATIVE valide un EXPORTATEUR
**Correction**: COOPERATIVE ne peut valider que les PRODUCTEUR (hiérarchie)

### ❌ ERREUR: TRANSFORMATEUR accède aux rapports d'expédition
**Correction**: Seul EXPORTATEUR et MINISTERE peuvent voir shipment-reports

### ❌ ERREUR: PRODUCTEUR voit les lots d'autres producteurs
**Correction**: Les données sont filtrées côté serveur, frontend doit aussi filtrer

### ❌ ERREUR: Afficher GPS à non-MINISTERE
**Correction**: Toujours vérifier `canReadEUDRWithGPS()` avant d'afficher GPS

---

## ✅ Checklist d'Implémentation

- [x] Matrice des permissions définie
- [x] Hook `usePermission()` créé
- [ ] Vérifications dans les hooks API
- [ ] Guards sur les composants/pages
- [ ] Tests d'autorisation
- [ ] Logging des accès refusés
- [ ] UI pour "Accès Refusé"

---

## 📖 Fichiers Concernés

- `web/lib/auth/permissions.ts` - Matrice des permissions
- `web/hooks/usePermission.ts` - Hook pour vérifier les permissions
- `web/hooks/api/*.ts` - Ajouter checks de permission
- `web/components/*` - Ajouter guards de permission
- `web/app/(protected)/*` - Ajouter middleware de protection
