export const queryKeys = {
  lots: "lots",
  lot: (id: string) => ["lots", id] as const,
  actors: "actors",
  pendingActors: "pending-actors",
  history: (assetHash: string) => ["history", assetHash] as const,
  eudr: (lotHash: string) => ["eudr", lotHash] as const,
  verification: (lotHash: string) => ["verification", lotHash] as const,
  parcelles: "parcelles",
} as const
