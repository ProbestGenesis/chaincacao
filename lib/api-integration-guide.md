# ChainCacao API Integration Guide

## Overview

This document maps the backend API endpoints to frontend hooks and services.

## API Endpoints by Category

### Authentication (8 endpoints)
✅ Already integrated via `web/lib/services/actors.service.ts`

- `POST /api/v1/auth/register` → MultiStepSignupForm
- `POST /api/v1/auth/login` → LoginForm + `useLoginMutation()`
- `GET /api/v1/auth/me` → `useCurrentUser()`
- `GET /api/v1/auth/cooperatives/public` → `usePublicCooperatives()`
- `GET /api/v1/auth/users` → `useListUsers()`
- `GET /api/v1/auth/pending-registrations` → `usePendingRegistrations()`
- `POST /api/v1/auth/register-producer` → `useRegisterProducerMutation()`
- `POST /api/v1/auth/register-agent` → `useRegisterAgentMutation()`

### Actors (2 endpoints)
✅ Already integrated via `web/lib/services/actors.service.ts`

- `GET /api/v1/actors/producers/pending` → `usePendingProducers()`
- `POST /api/v1/actors/register` → `useRegisterActorMutation()`

### Lots (5 endpoints)
🔄 Partially integrated via `web/lib/services/lot.service.ts` + new hooks

- `POST /api/v1/lots/` → `useCreateLotMutation()`
- `GET /api/v1/lots/{lot_hash}` → `useLotDetails()`
- `PUT /api/v1/lots/{lot_hash}/status` → `useUpdateLotStatusMutation()`
- `POST /api/v1/lots/regroup` → `useRegroupLotsMutation()`
- `GET /api/v1/lots/media/{media_hash}` → `useLotMedia()`

### Parcelles (3 endpoints)
✅ New hooks created

- `POST /api/v1/parcelles/` → `useCreateParcelMutation()`
- `GET /api/v1/parcelles/me` → `useMyParcelles()`
- `GET /api/v1/parcelles/{parcelle_id}` → `useParcelleDetails()`

### Traceability (3 endpoints)
✅ Already integrated via `web/lib/services/traceability.service.ts`

- `POST /api/v1/traceability/transfers` → `useCreateTransferMutation()`
- `POST /api/v1/traceability/transformations` → `useCreateTransformationMutation()`
- `POST /api/v1/traceability/shipments` → `useCreateShipmentMutation()`

### Audit & Queries (11 endpoints)
✅ Already integrated via `web/lib/services/traceability.service.ts` + new hooks

- `POST /api/v1/audit/certifications` → `useCreateCertificationMutation()`
- `GET /api/v1/audit/history/{asset_hash}` → `useAssetHistory()`
- `GET /api/v1/audit/query/status/{status}` → `useQueryByStatus()`
- `GET /api/v1/audit/query/farmer/{farmer_id}` → `useQueryByFarmer()`
- `GET /api/v1/audit/query/certifications/{ref_hash}` → `useGetCertifications()`
- `GET /api/v1/audit/eudr-report/{lot_hash}` → `useEUDRReport()`
- `GET /api/v1/audit/eudr-report/{lot_hash}/pdf` → `useEUDRReportPDF()`
- `GET /api/v1/audit/verify/{lot_hash}` → `useVerifyLot()`
- `GET /api/v1/audit/shipment-report/{shipment_hash}` → `useShipmentReport()`
- `GET /api/v1/audit/shipment-report/{shipment_hash}/pdf` → `useShipmentReportPDF()`

## File Structure

```
web/
├── hooks/
│   └── api/                      # New Tanstack Query hooks
│       ├── index.ts
│       ├── useAuth.ts
│       ├── useLots.ts
│       ├── useAudit.ts
│       ├── useTraceability.ts
│       ├── useParcelles.ts
│       ├── useActors.ts
│       └── useCertifications.ts
├── lib/
│   ├── api.ts                    # Base API client
│   ├── query-client.ts           # Tanstack Query config
│   └── services/                 # Service layer (adapters)
│       ├── lot.service.ts
│       ├── traceability.service.ts
│       └── actors.service.ts
├── types/
│   ├── api.ts                    # New OpenAPI types
│   ├── api-traceability.ts       # Existing traceability types
│   ├── api-actors.ts             # Existing actors types
│   └── types.ts                  # Local types
└── app/
    ├── providers.tsx             # Updated with query client
    └── (protected)/              # Protected routes
```

## Usage Examples

### Creating a Lot

```typescript
import { useCreateLotMutation } from "@/hooks/api"
import { toast } from "sonner"

export function CreateLotForm() {
  const mutation = useCreateLotMutation()
  
  const onSubmit = async (data: CreateLotRequest) => {
    try {
      const result = await mutation.mutateAsync(data)
      toast.success(`Lot ${result.lot_id} créé avec succès`)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
      <button disabled={mutation.isPending}>
        {mutation.isPending ? "Création..." : "Créer"}
      </button>
    </form>
  )
}
```

### Querying Lots by Status

```typescript
import { useQueryByStatus } from "@/hooks/api"

export function LotsList() {
  const { data: queryResult, isLoading } = useQueryByStatus("COLLECTE")
  
  if (isLoading) return <div>Chargement...</div>
  
  return (
    <div>
      {queryResult?.data?.map(lot => (
        <LotCard key={lot.lotHash} lot={lot} />
      ))}
    </div>
  )
}
```

### Getting EUDR Report

```typescript
import { useEUDRReport } from "@/hooks/api"

export function EUDRReportView({ lotHash }: { lotHash: string }) {
  const { data: report, isLoading } = useEUDRReport(lotHash)
  
  if (!report) return null
  
  return (
    <div>
      <h2>EUDR Compliance Report</h2>
      <p>Status: {report.compliance_status}</p>
      <p>Access Level: {report.access_level}</p>
    </div>
  )
}
```

## Type Mapping

The new `web/types/api.ts` file contains comprehensive types matching the OpenAPI 3.1 spec. Existing services continue to use their own type definitions for backward compatibility.

### Key Types

```typescript
// Authentication
LoginRequest, LoginResponse, RegisterRequest, UserPublicResponse

// Lots
CreateLotRequest, CreateLotResponse, LotDetail, LotStatus

// Traceability
CreateTransferRequest, CreateTransformationRequest, CreateShipmentRequest

// Audit
AssetHistory, EUDRReportData, ShipmentReportData

// Parcelles
ParcelleCreate, ParcelleDetail

// Actors
ActorRegister, PendingProducer, ActorRegistrationResponse

// Certifications
CertificationCreate, CertificationDetail
```

## Tanstack Query Configuration

Default options in `web/lib/query-client.ts`:

```typescript
{
  queries: {
    staleTime: 1000 * 60,           // 1 minute
    gcTime: 1000 * 60 * 5,          // 5 minutes
    retry: 1,
    retryDelay: exponential backoff
  },
  mutations: {
    retry: 1,
    retryDelay: exponential backoff
  }
}
```

## Next Steps

1. Update existing components to use new Tanstack Query hooks where applicable
2. Create public verification page at `/verify/[lot_hash]`
3. Create ministry administration pages for user validation
4. Implement PDF export functionality for reports
5. Add error boundary components with proper error handling
6. Add loading skeletons for better UX

## Error Handling

All hooks include automatic error handling through Tanstack Query. Use:

```typescript
const { data, error, isLoading } = useQuery(...)

if (error) {
  return <ErrorComponent error={error.message} />
}
```

Or in mutations:

```typescript
const mutation = useMutation({
  mutationFn: async (data) => { ... },
  onError: (error) => {
    toast.error(error.message)
  }
})
```
