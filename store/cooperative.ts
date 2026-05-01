import { LotStatus } from '@/types/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CooperativeGroup {
  groupId: string;
  groupLotId?: string;
  coopName: string;
  lotIds: string[];
  managerId: string;
  totalWeight: number;
  status: LotStatus;
  syncStatus: 'synced' | 'pending' | 'error';
  createdAt: number;
  updatedAt: number;
}

interface CooperativeStore {
  groups: CooperativeGroup[];
  createGroup: (
    coopName: string,
    managerId: string,
    lotIds: string[],
    totalWeight: number
  ) => CooperativeGroup;
  setGroupLotId: (groupId: string, groupLotId: string) => void;
  updateGroupStatus: (groupId: string, status: LotStatus) => void;
  addLotsToGroup: (groupId: string, lotIds: string[], additionalWeight: number) => void;
  removeLotsFromGroup: (groupId: string, lotIds: string[], removedWeight: number) => void;
  getGroupsByManager: (managerId: string) => CooperativeGroup[];
  getGroupById: (groupId: string) => CooperativeGroup | undefined;
  getGroupByCoop: (coopName: string) => CooperativeGroup | undefined;
}

const generateGroupId = () => `GROUP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useCooperativeStore = create(
  persist<CooperativeStore>(
    (set, get) => ({
      groups: [],

      createGroup: (coopName, managerId, lotIds, totalWeight) => {
        const newGroup: CooperativeGroup = {
          groupId: generateGroupId(),
          coopName,
          lotIds,
          managerId,
          totalWeight,
          status: 'transferred',
          syncStatus: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          groups: [...state.groups, newGroup],
        }));

        return newGroup;
      },

      setGroupLotId: (groupId, groupLotId) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.groupId === groupId
              ? {
                  ...group,
                  groupLotId,
                  updatedAt: Date.now(),
                }
              : group
          ),
        })),

      updateGroupStatus: (groupId, status) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.groupId === groupId
              ? {
                  ...group,
                  status,
                  updatedAt: Date.now(),
                }
              : group
          ),
        })),

      addLotsToGroup: (groupId, lotIds, additionalWeight) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.groupId === groupId
              ? {
                  ...group,
                  lotIds: [...new Set([...group.lotIds, ...lotIds])],
                  totalWeight: group.totalWeight + additionalWeight,
                  updatedAt: Date.now(),
                }
              : group
          ),
        })),

      removeLotsFromGroup: (groupId, lotIds, removedWeight) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.groupId === groupId
              ? {
                  ...group,
                  lotIds: group.lotIds.filter((id) => !lotIds.includes(id)),
                  totalWeight: Math.max(0, group.totalWeight - removedWeight),
                  updatedAt: Date.now(),
                }
              : group
          ),
        })),

      getGroupsByManager: (managerId: string) => {
        const { groups } = get();
        return groups.filter((g) => g.managerId === managerId);
      },

      getGroupById: (groupId: string) => {
        const { groups } = get();
        return groups.find((g) => g.groupId === groupId);
      },

      getGroupByCoop: (coopName: string) => {
        const { groups } = get();
        return groups.find((g) => g.coopName === coopName);
      },
    }),
    {
      name: 'cooperativeStore',
    }
  )
);
