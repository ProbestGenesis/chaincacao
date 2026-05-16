import type { CooperativeGroup } from "@/store/cooperative"
import type { Lot } from "@/types/types"

const uniqueStrings = (values: Array<string | null | undefined>) =>
  Array.from(
    new Set(
      values.filter((value): value is string => typeof value === "string" && value.length > 0)
    )
  )

export const getLotLineageIds = (lot: Lot) =>
  Array.from(new Set([lot.lotId, ...(lot.isGroup ? lot.sourceLotIds ?? [] : [])]))

export const getAssociatedGroupLotIds = (lotId: string, groups: CooperativeGroup[]) =>
  uniqueStrings(
    groups.flatMap((group) => (group.lotIds.includes(lotId) ? [group.groupLotId] : []))
  )

export const getLotHistoryIds = (lot: Lot, groups: CooperativeGroup[]) =>
  lot.isGroup ? [lot.lotId] : uniqueStrings([lot.lotId, ...getAssociatedGroupLotIds(lot.lotId, groups)])

export const getSourceLotIds = (lot: Lot) =>
  lot.isGroup ? Array.from(new Set(lot.sourceLotIds ?? [])) : []
