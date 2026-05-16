# ChainCacao Frontend - Quick Reference Guide

**TL;DR**: All 32 API endpoints are integrated with Tanstack Query hooks.

---

## 🚀 Get Started in 30 Seconds

### 1. Import the hook you need:
```typescript
import { useCreateLotMutation, useLotDetails } from "@/hooks/api"
```

### 2. Use it in your component:
```typescript
const { data: lot } = useLotDetails("LOT-123")
const createLot = useCreateLotMutation()

await createLot.mutateAsync({ /* data */ })
```

**That's it!** Queries auto-invalidate, errors are handled, and data is cached.

---

## 📚 Hook Categories

### Auth (Login, Register)
```typescript
import { 
  useLoginMutation, 
  useRegisterMutation, 
  useCurrentUser,
  usePublicCooperatives 
} from "@/hooks/api"
```

### Lots (CRUD)
```typescript
import { 
  useCreateLotMutation,
  useLotDetails,
  useUpdateLotStatusMutation,
  useLotMedia
} from "@/hooks/api"
```

### Queries (Search)
```typescript
import { 
  useQueryByStatus,
  useQueryByFarmer,
  useAssetHistory
} from "@/hooks/api"
```

### Reports (EUDR, Compliance)
```typescript
import { 
  useEUDRReport,
  useEUDRReportPDF,
  useShipmentReport
} from "@/hooks/api"
```

### Traceability (Transfers, Shipments)
```typescript
import { 
  useCreateTransferMutation,
  useCreateShipmentMutation
} from "@/hooks/api"
```

### Admin (Validation)
```typescript
import { 
  useRegisterActorMutation,
  usePendingProducers
} from "@/hooks/api"
```

---

## 🎯 Common Patterns

### Query (Read Data)
```typescript
const { data, isLoading, error } = useQueryByStatus("COLLECTE")
```

### Mutation (Write Data)
```typescript
const mutation = useCreateLotMutation()

const result = await mutation.mutateAsync({
  parcelle_id: "...",
  poids_kg: 100,
  // ... more fields
})
```

### With Error Handling
```typescript
try {
  await mutation.mutateAsync(data)
} catch (error) {
  // Toast already shown, but you can handle manually
  console.error(error)
}
```

### Refetch on Demand
```typescript
const { refetch } = useQueryByFarmer(farmerId)

// Later...
refetch()
```

---

## 📊 All 32 Endpoints at a Glance

```
✅ Auth:        8 endpoints (login, register, me, cooperatives, users, pending, producers, agents)
✅ Actors:      2 endpoints (pending, register)
✅ Lots:        5 endpoints (create, get, status, regroup, media)
✅ Parcelles:   3 endpoints (create, my, get)
✅ Traceability:3 endpoints (transfers, transformations, shipments)
✅ Audit:      11 endpoints (certifications, history, status, farmer, certs, eudr, pdf, verify, report)

TOTAL:         32 endpoints ✅
```

---

## 🔍 Type Safety

All requests and responses are fully typed:

```typescript
// TypeScript knows the exact shape of the response
const { data: lot } = useLotDetails(lotHash)
// data.lotHash: string ✅
// data.unknown: error ❌

// Mutations also type-check inputs
await mutation.mutateAsync({
  parcelle_id: "...",
  poidsKg: 100,  // number required
  // missing required fields = error ❌
})
```

---

## ⚡ Performance

- **Queries auto-deduplicate** (same request = 1 API call)
- **Stale times**: 2-10 min depending on query type
- **Cache time**: 5 minutes
- **Auto-invalidation** on mutations
- **Exponential backoff** retry

---

## 🎨 Complete Example

```typescript
import { useCreateLotMutation, useQueryByStatus } from "@/hooks/api"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export function LotsPage() {
  const { data: lots, isLoading } = useQueryByStatus("COLLECTE")
  const createLot = useCreateLotMutation()
  const { register, handleSubmit } = useForm()
  
  const onSubmit = async (data) => {
    try {
      const result = await createLot.mutateAsync({
        parcelle_id: data.parcelleId,
        poids_kg: parseFloat(data.poids),
        espece: data.espece,
        date_collecte: data.date,
        file: data.file[0]
      })
      // Success toast auto-shown
      // Lots query auto-refreshed
    } catch (error) {
      // Error toast auto-shown
    }
  }
  
  return (
    <div>
      <h1>Lots de Cacao</h1>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("parcelleId")} />
        <input {...register("poids")} type="number" />
        <input {...register("espece")} />
        <input {...register("date")} type="date" />
        <input {...register("file")} type="file" />
        
        <button disabled={createLot.isPending}>
          {createLot.isPending ? "Création..." : "Créer"}
        </button>
      </form>
      
      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <table>
          <tbody>
            {lots?.data?.map(lot => (
              <tr key={lot.lotHash}>
                <td>{lot.lotHash}</td>
                <td>{lot.espece}</td>
                <td>{lot.poidsKg} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

---

## 📖 Learn More

- **Full docs**: `web/API_INTEGRATION_README.md`
- **Technical guide**: `web/lib/api-integration-guide.md`
- **Implementation**: `web/IMPLEMENTATION_SUMMARY.md`
- **Types**: `web/types/api.ts`
- **Hooks**: `web/hooks/api/`

---

## ❓ FAQ

### Q: How do I make a query?
A: Import hook and use it: `const { data } = useQueryByStatus("COLLECTE")`

### Q: How do I make a mutation?
A: Same pattern: `const mutation = useCreateLotMutation(); await mutation.mutateAsync(data)`

### Q: How do I handle errors?
A: Auto-handled with toast. Catch them manually with try/catch if needed.

### Q: How do I refetch?
A: Call `refetch()` from the query hook.

### Q: How do I invalidate cache?
A: Auto-handled on mutations. Manual: `queryClient.invalidateQueries()`

### Q: Why is my data stale?
A: Check stale time for that query (see docs). Force refetch with `refetch()`.

### Q: Can I use the service layer?
A: Yes! Existing services still work. New hooks are optional.

---

**Ready to code?** Start with importing a hook! 🚀
