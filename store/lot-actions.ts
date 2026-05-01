import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '@/types/types';

export interface LotAction {
  actionId: string;
  lotId: string;
  actor: UserRole;
  actorName: string;
  actorId: string;
  action: 'created' | 'validated' | 'transferred' | 'transformed' | 'verified' | 'exported' | 'comment';
  status: 'draft' | 'pending' | 'transferred' | 'transformed' | 'exported';
  description: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface LotActionsStore {
  actions: LotAction[];
  addAction: (action: Omit<LotAction, 'actionId' | 'timestamp'>) => void;
  getActionsForLot: (lotId: string) => LotAction[];
  getLotTimeline: (lotId: string) => LotAction[];
}

const generateActionId = () => `ACTION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useLotActionsStore = create(
  persist<LotActionsStore>(
    (set, get) => ({
      actions: [],

      addAction: (actionData) => {
        const newAction: LotAction = {
          ...actionData,
          actionId: generateActionId(),
          timestamp: Date.now(),
        };

        set((state) => ({
          actions: [...state.actions, newAction],
        }));
      },

      getActionsForLot: (lotId: string) => {
        const { actions } = get();
        return actions.filter((a) => a.lotId === lotId);
      },

      getLotTimeline: (lotId: string) => {
        const { actions } = get();
        return actions
          .filter((a) => a.lotId === lotId)
          .sort((a, b) => a.timestamp - b.timestamp);
      },
    }),
    {
      name: 'lotActionsStore',
    }
  )
);
