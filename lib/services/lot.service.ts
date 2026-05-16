import { api } from "@/lib/api"

export interface CreateLotPayload {
  espece: string
  poidsKg: number
  dateCollecte: string
  parcelleId: string
  coopId?: string
  photos: File[]
}

export const lotService = {
  /**
   * Crée un nouveau lot de cacao (multipart/form-data)
   */
  createLot: async (payload: CreateLotPayload) => {
    const formData = new FormData()
    
    // Champs simples
    formData.append("parcelle_id", payload.parcelleId)
    formData.append("espece", payload.espece)
    formData.append("poids_kg", payload.poidsKg.toString())
    formData.append("date_collecte", payload.dateCollecte)
    if (payload.coopId) formData.append("coop_id", payload.coopId)
    
    // Fichier (photo) - Le backend attend un seul 'file'
    if (payload.photos.length > 0) {
      formData.append("file", payload.photos[0])
    }

    // Note: On utilise fetch directement ou une instance axios configurée pour multipart
    // Ici on suppose que notre instance 'api' gère correctement les FormData
    return api.post<any>("/api/v1/lots/", formData, {
      isFormData: true // S'assure que l'api utilitaire ne stringify pas le FormData
    })
  },

  getLots: async () => {
    try {
      const statuses = ["COLLECTE", "EN_TRANSIT", "TRANSFORME", "EXPORTE"]
      const promises = statuses.map((status) =>
        api.get<{ success: boolean; data: any[] }>(`/api/v1/audit/query/status/${status}`)
          .catch((e) => {
            console.warn(`[LotService] Failed to fetch status ${status}:`, e)
            return { data: [] } as any
          })
      )
      
      const results = await Promise.all(promises)
      const allLots = results.flatMap((res) => {
        // L'API peut retourner { success, data: [...] } ou directement un tableau
        const items = Array.isArray(res) ? res : (res.data || [])
        // Normaliser chaque lot pour garantir la présence de lotId
        return items.map((lot: any) => ({
          ...lot,
          lotId: lot.lotId || lot.lotHash || lot.id,
          id: lot.lotId || lot.lotHash || lot.id,
        }))
      })
      
      // Deduplicate by lotId
      const uniqueLotsMap = new Map()
      for (const lot of allLots) {
        const id = lot.lotId || lot.lotHash || lot.id
        if (id && !uniqueLotsMap.has(id)) {
          uniqueLotsMap.set(id, lot)
        }
      }
      return Array.from(uniqueLotsMap.values())
    } catch (error) {
      console.error("[LotService] Error fetching lots:", error)
      return []
    }
  },
  
  getLot: (lotId: string) => api.get<any>(`/api/v1/lots/${lotId}`),
}
