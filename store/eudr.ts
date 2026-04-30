import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EUDRRecord {
  shipmentId: string;
  lotIds: string[];
  confirmedBy: string;
  status: 'pending' | 'confirmed' | 'rejected';
  eudrStatus: string;
  diligenceDate: string;
  countryRisk: string;
  esgScore: string;
  timestamp: number;
}

interface EUDRStore {
  eudrRecords: EUDRRecord[];
  confirmEUDR: (record: Omit<EUDRRecord, 'timestamp'>) => void;
  getEUDRRecord: (shipmentId: string) => EUDRRecord | undefined;
  updateEUDRStatus: (shipmentId: string, status: string) => void;
  getEUDRByExporter: (exporterId: string) => EUDRRecord[];
}

export const useEUDRStore = create(
  persist<EUDRStore>(
    (set, get) => ({
      eudrRecords: [],

      confirmEUDR: (recordData) => {
        const newRecord: EUDRRecord = {
          ...recordData,
          timestamp: Date.now(),
        };

        set((state) => ({
          eudrRecords: [...state.eudrRecords, newRecord],
        }));
      },

      getEUDRRecord: (shipmentId: string) => {
        const { eudrRecords } = get();
        return eudrRecords.find((r) => r.shipmentId === shipmentId);
      },

      updateEUDRStatus: (shipmentId: string, status: string) =>
        set((state) => ({
          eudrRecords: state.eudrRecords.map((record) =>
            record.shipmentId === shipmentId
              ? { ...record, eudrStatus: status }
              : record
          ),
        })),

      getEUDRByExporter: (exporterId: string) => {
        const { eudrRecords } = get();
        return eudrRecords.filter((r) => r.confirmedBy === exporterId);
      },
    }),
    {
      name: 'eudrStore',
    }
  )
);
