# ChainCacao - Guide d'Autorisation (RBAC)

**Version**: 1.0  
**Date**: 2026-05-15

---

## 🔐 Vue d'Ensemble

Le système d'autorisation ChainCacao utilise un modèle **Role-Based Access Control (RBAC)** à 6 rôles:

```
PRODUCTEUR → Crée les lots
   ↓
COOPERATIVE → Regroupe et valide les producteurs
   ↓
TRANSFORMATEUR → Transforme les lots
   ↓
EXPORTATEUR → Exporte internationalement
   ↓
CERTIF → Certifie les lots
   ↓
MINISTERE → Super-admin (accès complet)
```

---

## 📁 Fichiers du Système d'Autorisation

```
web/
├── lib/auth/
│   └── permissions.ts                      # Matrice des permissions
├── hooks/
│   ├── usePermission.ts                    # Hook principal
│   └── api/
│       ├── useAuthSecure.ts                # Auth avec permissions
│       ├── useLotsSecure.ts                # Lots avec permissions
│       ├── useAuditSecure.ts               # Audit avec permissions
│       └── useTraceabilitySecure.ts        # Traceability avec permissions
└── ENDPOINT_PERMISSIONS_AUDIT.md           # Tableau complet des permissions
```

---

## 🪝 Utilisation du Hook `usePermission()`

### Dans les Composants

```typescript
import { usePermission } from "@/hooks/usePermission"

export function MyComponent() {
  const can = usePermission()
  
  // Vérifier une permission unique
  if (!can.check("lots:create")) {
    return <AccessDenied />
  }
  
  // Vérifier plusieurs permissions (tous requis)
  if (can.checkAll(["lots:create", "lots:read_own"])) {
    // Peut créer ET lire ses lots
  }
  
  // Vérifier plusieurs permissions (au moins une)
  if (can.checkAny(["lots:read_own", "lots:read_any"])) {
    // Peut lire ses lots OU tous les lots
  }
  
  // Vérifier et lever une erreur
  try {
    can.require("lots:create")
  } catch (error) {
    console.error("Permission refusée:", error.message)
  }
  
  // Helpers spécifiques
  if (can.canCreateLot()) {
    // Afficher formulaire de création
  }
  
  if (can.isAdmin()) {
    // Afficher panneau admin
  }
  
  return <YourContent />
}
```

### Patterns Courants

```typescript
// Pattern 1: Guard avec early return
const can = usePermission()

if (!can.canReadAllLots()) {
  return <Redirect to="/access-denied" />
}

// Pattern 2: Conditional rendering
{can.canCreateCertification() && (
  <CreateCertificationButton />
)}

// Pattern 3: Disable button
<Button disabled={!can.canCreateTransfer()}>
  Create Transfer
</Button>

// Pattern 4: Role-specific UI
{can.isAdmin() && <AdminPanel />}
{can.isCooperative() && <CoopPanel />}
{can.isProducer() && <ProducerPanel />}
```

---

## 🔌 Utilisation des Hooks API Sécurisés

### Before (Sans permissions)

```typescript
import { useCreateLotMutation } from "@/hooks/api"

export function CreateLotForm() {
  // ❌ Aucune vérification de permission
  const mutation = useCreateLotMutation()
  
  // L'API backend rejettera l'appel si non autorisé
  // Erreur à l'exécution, pas en chargement du composant
}
```

### After (Avec permissions)

```typescript
import { useCreateLotMutationSecure } from "@/hooks/api/useLotsSecure"

export function CreateLotForm() {
  // ✅ Vérification de permission au chargement
  // Lève une erreur si PRODUCTEUR n'est pas le rôle courant
  try {
    const mutation = useCreateLotMutationSecure()
    
    // Sûr: on sait qu'on a la permission
    await mutation.mutateAsync(data)
  } catch (error) {
    // Gestion de l'erreur de permission
    console.error(error.message)
    return <AccessDenied />
  }
}
```

### Hooks Sécurisés Disponibles

```typescript
// Auth
import {
  useLoginMutation,
  useCurrentUser,
  useListUsersSecure,
  usePendingRegistrationsSecure,
  useRegisterProducerMutationSecure,
  useRegisterAgentMutationSecure,
} from "@/hooks/api/useAuthSecure"

// Lots
import {
  useCreateLotMutationSecure,
  useLotDetailsSecure,
  useUpdateLotStatusMutationSecure,
  useRegroupLotsMutationSecure,
} from "@/hooks/api/useLotsSecure"

// Audit
import {
  useEUDRReportSecure,
  useEUDRReportPDFSecure,
  useQueryByStatusSecure,
  useQueryByFarmerSecure,
  useCreateCertificationMutationSecure,
  useAssetHistorySecure,
} from "@/hooks/api/useAuditSecure"

// Traceability
import {
  useCreateTransferMutationSecure,
  useCreateTransformationMutationSecure,
  useCreateShipmentMutationSecure,
} from "@/hooks/api/useTraceabilitySecure"
```

---

## 🛡️ Protéger les Routes

### Middleware au Niveau des Routes

```typescript
// app/(protected)/lots/create/page.tsx
"use client"

import { usePermission } from "@/hooks/usePermission"
import { redirect } from "next/navigation"

export default function CreateLotPage() {
  const can = usePermission()
  
  // Rediriger si pas la permission
  if (!can.canCreateLot()) {
    redirect("/access-denied")
  }
  
  return <CreateLotForm />
}
```

### Layout Protection

```typescript
// app/(protected)/ministry/layout.tsx
"use client"

import { usePermission } from "@/hooks/usePermission"
import { redirect } from "next/navigation"

export default function MinistryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const can = usePermission()
  
  if (!can.isAdmin()) {
    redirect("/access-denied")
  }
  
  return <>{children}</>
}
```

---

## 📊 Permissions par Endpoint

### Exemple: POST /api/v1/lots/

```typescript
// Permission requise: "lots:create"
// Rôles autorisés: PRODUCTEUR uniquement

// ✅ Autorisé
const can = usePermission()
if (can.check("lots:create")) {
  await useCreateLotMutationSecure().mutateAsync(data)
}

// ❌ Refusé - Error: "Vous n'avez pas la permission de créer des lots..."
```

### Exemple: GET /api/v1/audit/eudr-report/{lot_hash}

```typescript
// Permissions: "audit:read_eudr_report" OU "audit:read_eudr_report_gps"
// Rôles: Tous (mais données filtrées)
// Données GPS: MINISTERE uniquement

const { data: report } = useEUDRReportSecure(lotHash)

if (can.canReadEUDRWithGPS()) {
  // Afficher les données GPS
  displayMap(report.data.gps)
} else {
  // Afficher sans GPS
  displayData(report.data)
}
```

---

## 🎯 Checklist d'Implémentation

### Pour chaque Page Protégée

- [ ] Ajouter la vérification de permission au chargement
- [ ] Afficher "Accès Refusé" si pas la permission
- [ ] Utiliser les hooks `*Secure` pour les appels API
- [ ] Disabler les boutons selon les permissions
- [ ] Masquer les UI selon le rôle
- [ ] Loguer les tentatives d'accès refusé

### Exemple Complet

```typescript
"use client"

import { usePermission } from "@/hooks/usePermission"
import { useCreateLotMutationSecure } from "@/hooks/api/useLotsSecure"
import { useForm } from "react-hook-form"
import { redirect } from "next/navigation"

export default function CreateLotPage() {
  const can = usePermission()
  const { register, handleSubmit } = useForm()
  
  // Guard: vérifier permission au chargement
  if (!can.canCreateLot()) {
    redirect("/access-denied")
  }
  
  // Hook sécurisé avec vérification
  const mutation = useCreateLotMutationSecure()
  
  const onSubmit = async (data) => {
    try {
      const result = await mutation.mutateAsync(data)
      console.log("Lot créé:", result.lot_id)
    } catch (error) {
      console.error("Erreur:", error.message)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("parcelle_id")} />
      <input {...register("poids_kg")} type="number" />
      <input {...register("espece")} />
      <input {...register("file")} type="file" />
      
      {/* Disabler le bouton si pas la permission (safety) */}
      <button disabled={!can.canCreateLot() || mutation.isPending}>
        {mutation.isPending ? "Création..." : "Créer"}
      </button>
    </form>
  )
}
```

---

## 🚨 Erreurs Courants

### ❌ Erreur 1: Utiliser les hooks non-sécurisés

```typescript
// ❌ MAUVAIS
import { useCreateLotMutation } from "@/hooks/api"

const mutation = useCreateLotMutation()
// Aucune vérification de permission
// Erreur seulement si l'API refuse la requête
```

```typescript
// ✅ CORRECT
import { useCreateLotMutationSecure } from "@/hooks/api/useLotsSecure"

const mutation = useCreateLotMutationSecure()
// Vérification immédiate
// Erreur au chargement du composant si pas la permission
```

### ❌ Erreur 2: Oublier la vérification sur la page

```typescript
// ❌ MAUVAIS
export default function AdminPage() {
  // Pas de vérification - n'importe qui peut accéder
  return <AdminContent />
}
```

```typescript
// ✅ CORRECT
export default function AdminPage() {
  const can = usePermission()
  
  if (!can.isAdmin()) {
    redirect("/access-denied")
  }
  
  return <AdminContent />
}
```

### ❌ Erreur 3: Afficher le GPS à non-MINISTERE

```typescript
// ❌ MAUVAIS
<Map center={lot.gps} />
// Affiche les données GPS à tous

// ✅ CORRECT
{can.canReadEUDRWithGPS() && (
  <Map center={lot.gps} />
)}
// Affiche seulement à MINISTERE
```

---

## 📈 Flux d'Autorisation

```
1. User se connecte
   ↓
2. Token JWT + rôle stocké dans UserContext
   ↓
3. usePermission() récupère le rôle
   ↓
4. Consulte la matrice rolePermissions
   ↓
5. Retourne true/false pour chaque permission
   ↓
6. Composants décident d'afficher/masquer/disabler
   ↓
7. Hooks API vérifient la permission avant d'appeler l'API
   ↓
8. Backend fait sa propre vérification (couche de sécurité double)
```

---

## 🔍 Vérification Côté Backend vs Frontend

### Frontend (via `usePermission()`)
- ✅ Vérification rapide (sans requête)
- ✅ UX: masquer rapidement l'UI non-autorisée
- ✅ Guard: rediriger avant d'appeler l'API
- ⚠️ **Peut être contournée** (dev tools)

### Backend (via JWT token)
- ✅ Sécurité: pas de contournement possible
- ✅ Audit: log de chaque action
- ⚠️ Plus lent (requête réseau)

**Stratégie**: Frontend + Backend (défense en profondeur)

---

## 📞 Support

Pour ajouter une nouvelle permission:

1. Ajouter le type dans `web/lib/auth/permissions.ts`
2. Ajouter la permission à `rolePermissions`
3. Créer un helper dans `usePermission()` si spécifique
4. Documenter dans `ENDPOINT_PERMISSIONS_AUDIT.md`
5. Créer/mettre à jour les hooks sécurisés

---

**Version**: 1.0  
**Status**: ✅ Ready to use
