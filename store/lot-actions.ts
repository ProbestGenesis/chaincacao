import { create } from "zustand"
import { persist } from "zustand/middleware"

import { UserRole } from "@/types/types"

export interface LotAction {
  actionId: string
  lotId: string
  actor: UserRole
  actorName: string
  actorId: string
  action:
    | "created"
    | "validated"
    | "received"
    | "transferred"
    | "grouped"
    | "transformed"
    | "verified"
    | "audited"
    | "exported"
    | "comment"
  phase:
    | "recolte"
    | "transfert"
    | "regroupement"
    | "transport"
    | "transformation"
    | "controle"
    | "import"
    | "commentaire"
  status: "draft" | "pending" | "verified" | "transferred" | "transformed" | "exported"
  description: string
  timestamp: number
  metadata?: Record<string, unknown>
  chainStatus?: "off_chain" | "pending" | "recorded" | "error"
  chainHash?: string
  chainRecordedAt?: number
}

interface LotActionsStore {
  actions: LotAction[]
  addAction: (action: Omit<LotAction, "actionId" | "timestamp">) => void
  getActionsForLot: (lotId: string) => LotAction[]
  getLotTimeline: (lotId: string, relatedLotIds?: string[]) => LotAction[]
  hasLotAction: (lotId: string, action: LotAction["action"], phase: LotAction["phase"]) => boolean
  registerActionOnChain: (actionId: string) => string | null
}

const generateActionId = () =>
  `ACTION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

const generateChainHash = (action: LotAction) =>
  `CHAIN-${action.lotId}-${action.action}-${action.phase}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`

export const useLotActionsStore = create(
  persist<LotActionsStore>(
    (set, get) => ({
      actions: [],

      addAction: (actionData) => {
        const newAction: LotAction = {
          ...actionData,
          actionId: generateActionId(),
          timestamp: Date.now(),
          chainStatus: actionData.chainStatus ?? "off_chain",
        }

        set((state) => ({
          actions: [...state.actions, newAction],
        }))
      },

      getActionsForLot: (lotId: string, relatedLotIds: string[] = []) => {
        const { actions } = get()
        const lotIds = new Set([lotId, ...relatedLotIds])
        return actions.filter((action) => lotIds.has(action.lotId))
      },

      getLotTimeline: (lotId: string, relatedLotIds: string[] = []) => {
        const { actions } = get()
        const lotIds = new Set([lotId, ...relatedLotIds])
        return actions
          .filter((action) => lotIds.has(action.lotId))
          .sort((a, b) => a.timestamp - b.timestamp)
      },

      hasLotAction: (lotId, action, phase) => {
        const { actions } = get()
        return actions.some(
          (entry) => entry.lotId === lotId && entry.action === action && entry.phase === phase
        )
      },

      registerActionOnChain: (actionId) => {
        const { actions } = get()
        const target = actions.find((action) => action.actionId === actionId)
        if (!target || target.chainStatus === "recorded") return target?.chainHash ?? null

        const chainHash = generateChainHash(target)

        set((state) => ({
          actions: state.actions.map((action) =>
            action.actionId === actionId
              ? {
                  ...action,
                  chainStatus: "recorded",
                  chainHash,
                  chainRecordedAt: Date.now(),
                }
              : action
          ),
        }))

        return chainHash
      },
    }),
    {
      name: "lotActionsStore",
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<LotActionsStore> | undefined
        return {
          ...current,
          ...persistedState,
          actions:
            persistedState?.actions && persistedState.actions.length > 0
              ? persistedState.actions
              : current.actions,
        }
      },
    }
  )
)
