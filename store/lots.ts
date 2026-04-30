import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Lot, LotStatus } from '@/types/types';
import { mockLots } from '@/mock/mockData';

interface LotsStore {
  lots: Lot[];
  addLot: (lot: Omit<Lot, 'lotId' | 'createdAt' | 'updatedAt'>) => Lot;
  updateLotStatus: (lotId: string, status: LotStatus) => void;
  deleteLot: (lotId: string) => void;
  getLotsForFarmer: (farmerId: string) => Lot[];
  getLotById: (lotId: string) => Lot | undefined;
  getLotsInStatus: (status: LotStatus) => Lot[];
  updateLotSyncStatus: (
    lotId: string,
    syncStatus: 'synced' | 'pending' | 'error'
  ) => void;
}

const generateLotId = () => `LOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useLotsStore = create(
  persist<LotsStore>(
    (set, get) => ({
      lots: mockLots,

      addLot: (lotData) => {
        const newLot: Lot = {
          ...lotData,
          lotId: generateLotId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          lots: [...state.lots, newLot],
        }));

        return newLot;
      },

      updateLotStatus: (lotId: string, status: LotStatus) =>
        set((state) => ({
          lots: state.lots.map((lot) =>
            lot.lotId === lotId
              ? { ...lot, statut: status, updatedAt: Date.now() }
              : lot
          ),
        })),

      deleteLot: (lotId: string) =>
        set((state) => ({
          lots: state.lots.filter((lot) => lot.lotId !== lotId),
        })),

      getLotsForFarmer: (farmerId: string) => {
        const { lots } = get();
        return lots.filter((lot) => lot.farmerId === farmerId);
      },

      getLotById: (lotId: string) => {
        const { lots } = get();
        return lots.find((lot) => lot.lotId === lotId);
      },

      getLotsInStatus: (status: LotStatus) => {
        const { lots } = get();
        return lots.filter((lot) => lot.statut === status);
      },

      updateLotSyncStatus: (
        lotId: string,
        syncStatus: 'synced' | 'pending' | 'error'
      ) =>
        set((state) => ({
          lots: state.lots.map((lot) =>
            lot.lotId === lotId
              ? { ...lot, syncStatus, updatedAt: Date.now() }
              : lot
          ),
        })),
    }),
    {
      name: 'lotsStore',
    }
  )
);
