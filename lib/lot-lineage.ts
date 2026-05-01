import type { Lot } from "@/types/types"

export const getLotLineageIds = (lot: Lot) =>
  Array.from(new Set([lot.lotId, ...(lot.isGroup ? lot.sourceLotIds ?? [] : [])]))

export const getSourceLotIds = (lot: Lot) =>
  lot.isGroup ? Array.from(new Set(lot.sourceLotIds ?? [])) : []
