import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ImportRecordStatus = "pending" | "approved" | "rejected";

export interface ImportRecordIssue {
  field: string;
  message: string;
  severity: "warning" | "error";
}

export interface ImportRecord {
  id: string;
  rowIndex: number;
  name: string;
  email?: string;
  department?: string;
  address: string;
  salary: number;
  startDate: string;
  status: ImportRecordStatus;
  importedAt: string;
  issues: ImportRecordIssue[];
}

interface ImportReviewState {
  records: ImportRecord[];
  setRecords: (records: ImportRecord[]) => void;
  approveRecord: (id: string) => void;
  rejectRecord: (id: string) => void;
  editRecord: (id: string, updates: Partial<ImportRecord>) => void;
  approveAll: () => void;
  rejectAll: () => void;
  clearRecords: () => void;
}

export const useImportReviewStore = create<ImportReviewState>()(
  persist(
    (set) => ({
      records: [],

      setRecords: (records) => set({ records }),

      approveRecord: (id) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, status: "approved" as const } : r
          ),
        })),

      rejectRecord: (id) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, status: "rejected" as const } : r
          ),
        })),

      editRecord: (id, updates) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      approveAll: () =>
        set((state) => ({
          records: state.records.map((r) => ({
            ...r,
            status: "approved" as const,
          })),
        })),

      rejectAll: () =>
        set((state) => ({
          records: state.records.map((r) => ({
            ...r,
            status: "rejected" as const,
          })),
        })),

      clearRecords: () => set({ records: [] }),
    }),
    { name: "zk-payroll-import-review" }
  )
);
