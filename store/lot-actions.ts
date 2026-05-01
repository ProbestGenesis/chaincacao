import { create } from "zustand"
import { persist } from "zustand/middleware"

import { mockLots } from "@/mock/mockData"
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
}

interface LotActionsStore {
  actions: LotAction[]
  addAction: (action: Omit<LotAction, "actionId" | "timestamp">) => void
  getActionsForLot: (lotId: string) => LotAction[]
  getLotTimeline: (lotId: string) => LotAction[]
}

const generateActionId = () =>
  `ACTION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

const mockLotActions: LotAction[] = [
  {
    actionId: "ACTION-LOT-2024-001-01",
    lotId: "LOT-2024-001",
    actor: "Agriculteur",
    actorName: "Koffi Assouma",
    actorId: "user-001",
    action: "created",
    phase: "recolte",
    status: "draft",
    description:
      "Enregistrement de récolte avec GPS, photos et poids validés depuis la parcelle.",
    timestamp: mockLots[0]?.createdAt ?? Date.now(),
    metadata: {
      proof: ["photo-001", "photo-002"],
      location: "Haut-Sassandra",
      documents: ["recolte-lot-2024-001.pdf"],
    },
  },
  {
    actionId: "ACTION-LOT-2024-001-02",
    lotId: "LOT-2024-001",
    actor: "CoopManager",
    actorName: "Marie Kouassi",
    actorId: "user-002",
    action: "transferred",
    phase: "transfert",
    status: "transferred",
    description:
      "Transfert numérique signé entre l'agriculteur et la coopérative, avec horodatage.",
    timestamp: (mockLots[0]?.createdAt ?? Date.now()) + 24 * 60 * 60 * 1000,
    metadata: {
      signedBy: ["user-001", "user-002"],
      document: "transfert-lot-2024-001.pdf",
      documents: ["transfert-lot-2024-001.pdf", "preuve-paiement-001.pdf"],
    },
  },
  {
    actionId: "ACTION-LOT-2024-001-03",
    lotId: "LOT-2024-001",
    actor: "Transformer",
    actorName: "Jean Diallo",
    actorId: "user-003",
    action: "grouped",
    phase: "regroupement",
    status: "transferred",
    description:
      "Lot regroupé avec conservation de la traçabilité des lots sources.",
    timestamp: (mockLots[0]?.createdAt ?? Date.now()) + 2 * 24 * 60 * 60 * 1000,
    metadata: {
      sourceLots: ["LOT-2024-001", "LOT-2024-002"],
      documents: ["regroupement-2024-001.pdf"],
    },
  },
  {
    actionId: "ACTION-LOT-2024-002-01",
    lotId: "LOT-2024-002",
    actor: "Agriculteur",
    actorName: "Koffi Assouma",
    actorId: "user-001",
    action: "created",
    phase: "recolte",
    status: "draft",
    description: "Récolte enregistrée depuis la parcelle avec preuves de collecte.",
    timestamp: mockLots[1]?.createdAt ?? Date.now(),
  },
  {
    actionId: "ACTION-LOT-2024-002-02",
    lotId: "LOT-2024-002",
    actor: "CoopManager",
    actorName: "Marie Kouassi",
    actorId: "user-002",
    action: "validated",
    phase: "transfert",
    status: "pending",
    description: "Réception coopérative en attente de signature complète du transfert.",
    timestamp: (mockLots[1]?.createdAt ?? Date.now()) + 12 * 60 * 60 * 1000,
  },
  {
    actionId: "ACTION-LOT-2024-003-01",
    lotId: "LOT-2024-003",
    actor: "Agriculteur",
    actorName: "Koffi Assouma",
    actorId: "user-001",
    action: "created",
    phase: "recolte",
    status: "draft",
    description:
      "Enregistrement de récolte complet avec géolocalisation et photos horodatées.",
    timestamp: mockLots[2]?.createdAt ?? Date.now(),
  },
  {
    actionId: "ACTION-LOT-2024-003-02",
    lotId: "LOT-2024-003",
    actor: "CoopManager",
    actorName: "Marie Kouassi",
    actorId: "user-002",
    action: "transferred",
    phase: "transfert",
    status: "transferred",
    description: "Transfert vers la coopérative signé et documenté.",
    timestamp: (mockLots[2]?.createdAt ?? Date.now()) + 2 * 24 * 60 * 60 * 1000,
  },
  {
    actionId: "ACTION-LOT-2024-003-03",
    lotId: "LOT-2024-003",
    actor: "Transformer",
    actorName: "Jean Diallo",
    actorId: "user-003",
    action: "transformed",
    phase: "transformation",
    status: "transformed",
    description: "Transformation validée avec mesures qualité et contrôle lot source.",
    timestamp: (mockLots[2]?.createdAt ?? Date.now()) + 4 * 24 * 60 * 60 * 1000,
  },
  {
    actionId: "ACTION-LOT-2024-003-04",
    lotId: "LOT-2024-003",
    actor: "Exporter",
    actorName: "Sophie Blanc",
    actorId: "user-004",
    action: "exported",
    phase: "controle",
    status: "exported",
    description: "Conformité export validée avant expédition.",
    timestamp: (mockLots[2]?.createdAt ?? Date.now()) + 6 * 24 * 60 * 60 * 1000,
  },
  {
    actionId: "ACTION-LOT-2024-003-05",
    lotId: "LOT-2024-003",
    actor: "Importer",
    actorName: "Sophie Blanc",
    actorId: "user-004",
    action: "audited",
    phase: "import",
    status: "exported",
    description:
      "Contrôle importateur effectué via QR et identifiant unique avant dédouanement.",
    timestamp: (mockLots[2]?.createdAt ?? Date.now()) + 7 * 24 * 60 * 60 * 1000,
    metadata: {
      documents: ["rapport-import-2024-003.pdf"],
    },
  },
]

export const useLotActionsStore = create(
  persist<LotActionsStore>(
    (set, get) => ({
      actions: mockLotActions,

      addAction: (actionData) => {
        const newAction: LotAction = {
          ...actionData,
          actionId: generateActionId(),
          timestamp: Date.now(),
        }

        set((state) => ({
          actions: [...state.actions, newAction],
        }))
      },

      getActionsForLot: (lotId: string) => {
        const { actions } = get()
        return actions.filter((a) => a.lotId === lotId)
      },

      getLotTimeline: (lotId: string) => {
        const { actions } = get()
        return actions
          .filter((a) => a.lotId === lotId)
          .sort((a, b) => a.timestamp - b.timestamp)
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
