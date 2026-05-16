import type { CooperativeGroup } from "@/store/cooperative"
import type { Lot } from "@/types/types"

const uniqueStrings = (values: Array<string | null | undefined>) =>
  Array.from(
    new Set(
      values.filter((value): value is string => typeof value === "string" && value.length > 0)
    )
  )

export const getLotLineageIds = (
  lot: Lot,
  getLotById?: (lotId: string) => Lot | undefined,
  visited = new Set<string>()
): string[] => {
  if (visited.has(lot.lotId)) return []

  visited.add(lot.lotId)

  const sourceIds = lot.isGroup || lot.sourceLotIds?.length ? lot.sourceLotIds ?? [] : []
  const parentIds = sourceIds.flatMap((sourceLotId) => {
    const sourceLot = getLotById?.(sourceLotId)
    return sourceLot ? getLotLineageIds(sourceLot, getLotById, visited) : [sourceLotId]
  })

  return uniqueStrings([lot.lotId, ...parentIds])
}

export const getAssociatedGroupLotIds = (lotId: string, groups: CooperativeGroup[]) =>
  uniqueStrings(
    groups.flatMap((group) => (group.lotIds.includes(lotId) ? [group.groupLotId] : []))
  )

export const getLotHistoryIds = (lot: Lot, groups: CooperativeGroup[]) =>
  lot.isGroup
    ? getLotLineageIds(lot)
    : uniqueStrings([lot.lotId, ...getAssociatedGroupLotIds(lot.lotId, groups)])

export const getSourceLotIds = (lot: Lot) =>
  lot.isGroup ? Array.from(new Set(lot.sourceLotIds ?? [])) : []

export const getLotTraceabilityIds = (
  lot: Lot,
  getLotById?: (lotId: string) => Lot | undefined
) => {
  const primaryHash = (lot as any).lotHash || lot.lotId
  const lineageIds = getLotLineageIds(lot, getLotById)
  const lineageHashes = lineageIds
    .filter((lotId) => lotId !== lot.lotId)
    .map((lotId) => {
      const sourceLot = getLotById?.(lotId)
      return (sourceLot as any)?.lotHash || lotId
    })

  return uniqueStrings([
    primaryHash,
    ...lineageHashes,
  ])
}
