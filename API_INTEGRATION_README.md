# ChainCacao Frontend API Integration - Complete Documentation

**Updated**: 2026-05-15  
**Backend API Version**: 2.0.0  
**Frontend**: Next.js 16 + Tanstack Query 5 + shadcn/ui

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [API Endpoints](#api-endpoints)
3. [Hooks Reference](#hooks-reference)
4. [Usage Examples](#usage-examples)
5. [Type Definitions](#type-definitions)
6. [Error Handling](#error-handling)
7. [Caching Strategy](#caching-strategy)

---

## 🚀 Quick Start

### 1. Install Dependencies

All required packages are already installed:
- `@tanstack/react-query@^5.100.9` - Data fetching
- `zod@^4.4.1` - Schema validation
- `react-hook-form@^7.74.0` - Form handling
- `sonner@^2.0.7` - Toast notifications

### 2. Setup Query Client

The query client is configured in `web/lib/query-client.ts` and initialized in `web/app/providers.tsx`.

### 3. Use Hooks in Components

```typescript
import { useCreateLotMutation, useLotDetails } from "@/hooks/api"

export function MyComponent() {
  const createLot = useCreateLotMutation()
  const { data: lot } = useLotDetails("LOT-12345")
  
  // Use mutation and query...
}
```

---

## 📡 API Endpoints

### Authentication (8 endpoints) ✅

| Endpoint | Method | Hook | Status |
|----------|--------|------|--------|
| `/api/v1/auth/register` | POST | Form submission | ✅ Integrated |
| `/api/v1/auth/login` | POST | `useLoginMutation()` | ✅ Integrated |
| `/api/v1/auth/me` | GET | `useCurrentUser()` | ✅ Integrated |
| `/api/v1/auth/cooperatives/public` | GET | `usePublicCooperatives()` | ✅ Integrated |
| `/api/v1/auth/users` | GET | `useListUsers()` | ✅ Integrated |
| `/api/v1/auth/pending-registrations` | GET | `usePendingRegistrations()` | ✅ Integrated |
| `/api/v1/auth/register-producer` | POST | `useRegisterProducerMutation()` | ✅ Integrated |
| `/api/v1/auth/register-agent` | POST | `useRegisterAgentMutation()` | ✅ Integrated |

### Actors (2 endpoints) ✅

| Endpoint | Method | Hook | Status |
|----------|--------|------|--------|
| `/api/v1/actors/producers/pending` | GET | `usePendingProducers()` | ✅ Integrated |
| `/api/v1/actors/register` | POST | `useRegisterActorMutation()` | ✅ Integrated |

### Lots (5 endpoints) ✅

| Endpoint | Method | Hook | Status |
|----------|--------|------|--------|
| `/api/v1/lots/` | POST | `useCreateLotMutation()` | ✅ Integrated |
| `/api/v1/lots/{lot_hash}` | GET | `useLotDetails()` | ✅ Integrated |
| `/api/v1/lots/{lot_hash}/status` | PUT | `useUpdateLotStatusMutation()` | ✅ Integrated |
| `/api/v1/lots/regroup` | POST | `useRegroupLotsMutation()` | ✅ Integrated |
| `/api/v1/lots/media/{media_hash}` | GET | `useLotMedia()` | ✅ Integrated |

### Traceability (3 endpoints) ✅

| Endpoint | Method | Hook | Status |
|----------|--------|------|--------|
| `/api/v1/traceability/transfers` | POST | `useCreateTransferMutation()` | ✅ Integrated |
| `/api/v1/traceability/transformations` | POST | `useCreateTransformationMutation()` | ✅ Integrated |
| `/api/v1/traceability/shipments` | POST | `useCreateShipmentMutation()` | ✅ Integrated |

### Parcelles (3 endpoints) ✅

| Endpoint | Method | Hook | Status |
|----------|--------|------|--------|
| `/api/v1/parcelles/` | POST | `useCreateParcelMutation()` | ✅ Integrated |
| `/api/v1/parcelles/me` | GET | `useMyParcelles()` | ✅ Integrated |
| `/api/v1/parcelles/{parcelle_id}` | GET | `useParcelleDetails()` | ✅ Integrated |

### Audit & Queries (11 endpoints) ✅

| Endpoint | Method | Hook | Status |
|----------|--------|------|--------|
| `/api/v1/audit/certifications` | POST | `useCreateCertificationMutation()` | ✅ Integrated |
| `/api/v1/audit/history/{asset_hash}` | GET | `useAssetHistory()` | ✅ Integrated |
| `/api/v1/audit/query/status/{status}` | GET | `useQueryByStatus()` | ✅ Integrated |
| `/api/v1/audit/query/farmer/{farmer_id}` | GET | `useQueryByFarmer()` | ✅ Integrated |
| `/api/v1/audit/query/certifications/{ref_hash}` | GET | `useGetCertifications()` | ✅ Integrated |
| `/api/v1/audit/eudr-report/{lot_hash}` | GET | `useEUDRReport()` | ✅ Integrated |
| `/api/v1/audit/eudr-report/{lot_hash}/pdf` | GET | `useEUDRReportPDF()` | ✅ Integrated |
| `/api/v1/audit/verify/{lot_hash}` | GET | `useVerifyLot()` | ✅ Integrated |
| `/api/v1/audit/shipment-report/{shipment_hash}` | GET | `useShipmentReport()` | ✅ Integrated |
| `/api/v1/audit/shipment-report/{shipment_hash}/pdf` | GET | `useShipmentReportPDF()` | ✅ Integrated |

**Total**: 32 endpoints, all integrated! ✅

---

## 🪝 Hooks Reference

### Authentication Hooks

#### `useLoginMutation()`
```typescript
const mutation = useLoginMutation()

await mutation.mutateAsync({
  username: "user@example.com", // email or phone
  password: "password123"
})
// Returns: { access_token, token_type, user }
```

#### `useRegisterMutation()`
```typescript
const mutation = useRegisterMutation()

await mutation.mutateAsync({
  email: "new@example.com",
  password: "password123",
  full_name: "John Doe",
  role: "PRODUCTEUR",
  org_name: "producteurs",
  file: fileInput // proof document
})
// Returns: UserPublicResponse
```

#### `useCurrentUser()`
```typescript
const { data: user, isLoading } = useCurrentUser()
// Returns: UserPublicResponse
```

#### `usePublicCooperatives()`
```typescript
const { data: coops } = usePublicCooperatives()
// Returns: CooperativePublic[]
```

### Lot Hooks

#### `useCreateLotMutation()`
```typescript
const mutation = useCreateLotMutation()

await mutation.mutateAsync({
  parcelle_id: "PARC-01",
  poids_kg: 120.5,
  espece: "Forastero",
  date_collecte: "2026-05-02",
  file: imageFile,
  coop_id: "COOP-001" // optional
})
// Returns: CreateLotResponse
```

#### `useLotDetails(lotHash)`
```typescript
const { data: lot, isLoading } = useLotDetails("LOT-20260502-ABC123")
// Returns: LotDetail
```

#### `useUpdateLotStatusMutation(lotHash)`
```typescript
const mutation = useUpdateLotStatusMutation("LOT-20260502-ABC123")

await mutation.mutateAsync({
  statut: "EN_TRANSIT"
})
// Returns: LotDetail
```

### Audit Hooks

#### `useAssetHistory(assetHash)`
```typescript
const { data: history } = useAssetHistory("LOT-20260502-ABC123")
// Returns: AssetHistory[]
// Array of blockchain transactions
```

#### `useQueryByStatus(status)`
```typescript
const { data: result } = useQueryByStatus("COLLECTE")
// Status: "COLLECTE" | "EN_TRANSIT" | "TRANSFORME" | "EXPORTE"
// Returns: QueryByStatusResponse
```

#### `useEUDRReport(lotHash)`
```typescript
const { data: report } = useEUDRReport("LOT-20260502-ABC123")
// Returns: EUDRReportData with compliance_status and detailed data
```

#### `useEUDRReportPDF(lotHash)`
```typescript
const { data: pdfUrl } = useEUDRReportPDF("LOT-20260502-ABC123")
// Returns: Blob URL for download
// Usage: <a href={pdfUrl} download>Download PDF</a>
```

### Traceability Hooks

#### `useCreateTransferMutation()`
```typescript
const mutation = useCreateTransferMutation()

await mutation.mutateAsync({
  transfer_hash: "TRANSFER-001",
  lot_hashes: ["LOT-1", "LOT-2"],
  expediteur_id: "FARMER-001",
  destinataire_id: "EXPORTER-001",
  preuve_hash: "sha256hash"
})
// Returns: TransferEvent
```

#### `useCreateShipmentMutation()`
```typescript
const mutation = useCreateShipmentMutation()

await mutation.mutateAsync({
  shipmentHash: "SHIP-001",
  lotHashes: ["LOT-1"],
  exportateurId: "EXPORTER-001",
  destination: "Rotterdam, NL",
  documentsHash: "sha256hash",
  dateDepartPrevue: "2026-06-01",
  dateArriveePrevue: "2026-06-15"
})
// Returns: ShipmentDetail
```

### Certification Hooks

#### `useCreateCertificationMutation()`
```typescript
const mutation = useCreateCertificationMutation()

await mutation.mutateAsync({
  lot_hash: "LOT-001",
  certification_type: "UTZ",
  certified_by: "CERTIF-001",
  certification_date: "2026-05-01",
  valid_until: "2027-05-01",
  document_hash: "sha256hash"
})
// Returns: CertificationDetail
```

---

## 💡 Usage Examples

### Example 1: Create a Lot with Image Upload

```typescript
import { useCreateLotMutation } from "@/hooks/api"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export function CreateLotForm() {
  const { register, handleSubmit, watch } = useForm()
  const mutation = useCreateLotMutation()
  
  const onSubmit = async (data) => {
    try {
      const result = await mutation.mutateAsync({
        parcelle_id: data.parcelleId,
        poids_kg: parseFloat(data.poidsKg),
        espece: data.espece,
        date_collecte: data.dateCollecte,
        file: data.file[0],
        coop_id: data.coopId
      })
      toast.success(`Lot ${result.lot_id} créé avec succès`)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("parcelleId")} placeholder="Parcelle ID" />
      <input {...register("poidsKg")} type="number" placeholder="Poids (kg)" />
      <input {...register("espece")} placeholder="Espèce" />
      <input {...register("dateCollecte")} type="date" />
      <input {...register("file")} type="file" accept="image/*" />
      
      <button disabled={mutation.isPending}>
        {mutation.isPending ? "Création..." : "Créer le lot"}
      </button>
    </form>
  )
}
```

### Example 2: Display Lots by Status with Pagination

```typescript
import { useQueryByStatus } from "@/hooks/api"
import { useState } from "react"

export function LotsByStatusList() {
  const [status, setStatus] = useState("COLLECTE")
  const { data: result, isLoading } = useQueryByStatus(status)
  
  const lots = result?.data || []
  
  return (
    <div>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="COLLECTE">Collectés</option>
        <option value="EN_TRANSIT">En transit</option>
        <option value="TRANSFORME">Transformés</option>
        <option value="EXPORTE">Exportés</option>
      </select>
      
      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Espèce</th>
              <th>Poids (kg)</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {lots.map(lot => (
              <tr key={lot.lotHash}>
                <td>{lot.lotHash}</td>
                <td>{lot.espece}</td>
                <td>{lot.poidsKg}</td>
                <td>{lot.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

### Example 3: Generate and Download EUDR Report PDF

```typescript
import { useEUDRReport, useEUDRReportPDF } from "@/hooks/api"
import { Button } from "@/components/ui/button"

export function EUDRReportDownload({ lotHash }: { lotHash: string }) {
  const { data: report, isLoading } = useEUDRReport(lotHash)
  const { data: pdfUrl } = useEUDRReportPDF(lotHash)
  
  if (isLoading) return <div>Chargement du rapport...</div>
  
  if (!report) return <div>Rapport non disponible</div>
  
  return (
    <div>
      <h2>Rapport EUDR</h2>
      <p>Statut: {report.compliance_status}</p>
      <p>Accès: {report.access_level}</p>
      
      {pdfUrl && (
        <Button asChild>
          <a href={pdfUrl} download={`EUDR-${lotHash}.pdf`}>
            Télécharger le PDF
          </a>
        </Button>
      )}
    </div>
  )
}
```

### Example 4: Register a User and Validate on Blockchain

```typescript
import { useRegisterActorMutation } from "@/hooks/api"
import { toast } from "sonner"

export function ValidateProducerButton({ producerId, roleType }) {
  const mutation = useRegisterActorMutation()
  
  const handleValidate = async () => {
    try {
      const result = await mutation.mutateAsync({
        actorIdHash: producerId,
        typeActeur: roleType,
        clePublique: `PUB-KEY-${producerId}`,
        orgName: "producteurs"
      })
      
      if (result.success) {
        toast.success("Producteur enregistré sur la blockchain")
      }
    } catch (error) {
      toast.error((error as Error).message)
    }
  }
  
  return (
    <button onClick={handleValidate} disabled={mutation.isPending}>
      {mutation.isPending ? "Validation..." : "Valider sur Blockchain"}
    </button>
  )
}
```

---

## 📝 Type Definitions

All types are defined in `web/types/api.ts` and match the OpenAPI 3.1 specification.

### Core Types

```typescript
// User types
export type UserRole = "PRODUCTEUR" | "COOPERATIVE" | "EXPORTATEUR" | "CERTIF" | "MINISTERE" | "TRANSFORMATEUR"
export type OrgName = "producteurs" | "cooperatives" | "exportateurs" | "certif" | "ministere" | "transformateurs"

// Lot types
export type LotStatus = "COLLECTE" | "EN_TRANSIT" | "TRANSFORME" | "EXPORTE"

// Request/Response types
export interface CreateLotRequest { ... }
export interface CreateLotResponse { ... }
export interface LoginRequest { ... }
export interface LoginResponse { ... }
// ... and many more
```

---

## ⚠️ Error Handling

### Automatic Error Handling in Mutations

```typescript
const mutation = useCreateLotMutation()

// Mutation automatically handles errors
// - Network errors
// - HTTP error status codes
// - JSON parsing errors
// - Automatic retry (1 attempt)

// Access error in component:
if (mutation.error) {
  console.error("Error:", mutation.error.message)
}
```

### Manual Error Handling

```typescript
try {
  await mutation.mutateAsync(data)
  // Success - toast is shown automatically
} catch (error) {
  // Error is also handled automatically via toast
  console.error("Details:", error)
}
```

### Error Boundaries

Wrap components with error boundaries:

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</ErrorBoundary>
```

---

## 🗄️ Caching Strategy

### Stale Times by Query Type

| Query Type | Stale Time | GC Time | Use Case |
|-----------|-----------|---------|----------|
| User profile | 5 min | 5 min | `/api/v1/auth/me` |
| Lots list | 2 min | 5 min | Query by status/farmer |
| Lot details | 5 min | 5 min | Single lot view |
| History | 5 min | 5 min | Blockchain history |
| EUDR report | 10 min | 5 min | Compliance reports |
| Media | ∞ | ∞ | Images (immutable) |

### Invalidation Triggers

Queries are automatically invalidated when:

- ✅ Lot created → invalidates `lots` and `by-status` queries
- ✅ Status updated → invalidates lot detail and history
- ✅ Transfer created → invalidates audit queries
- ✅ Certification added → invalidates lot details and certifications
- ✅ User validated → invalidates pending users list

### Manual Query Invalidation

```typescript
import { useQueryClient } from "@tanstack/react-query"

const queryClient = useQueryClient()

// Invalidate all lot queries
queryClient.invalidateQueries({ queryKey: ["lots"] })

// Invalidate specific lot
queryClient.invalidateQueries({ queryKey: ["lots", "detail", "LOT-123"] })

// Invalidate all audit queries
queryClient.invalidateQueries({ queryKey: ["audit"] })
```

---

## 🔗 Related Documentation

- [Backend API Documentation](../backend/API_DOC.md)
- [Type Definitions](./types/api.ts)
- [Hook Reference](./hooks/api/)
- [API Integration Guide](./lib/api-integration-guide.md)

---

## 📞 Support

For questions or issues:
1. Check the type definitions in `web/types/api.ts`
2. Review hook implementations in `web/hooks/api/`
3. Check service implementations in `web/lib/services/`
4. Review component usage examples above

---

**Last Updated**: 2026-05-15  
**Status**: ✅ All 32 API endpoints integrated and ready to use
