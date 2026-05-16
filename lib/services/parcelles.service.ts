import { api } from "@/lib/api"
import type { ParcelleCreate, ParcelleDetail } from "@/types/api"

export const parcellesService = {
  getFarmerParcelles: async (): Promise<ParcelleDetail[]> => {
    return api.get<ParcelleDetail[]>("/api/v1/parcelles/me")
  },

  registerParcelle: async (payload: ParcelleCreate): Promise<any> => {
    return api.post("/api/v1/parcelles/", payload)
  },
}
