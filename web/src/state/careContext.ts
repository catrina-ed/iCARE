import { createContext, useContext } from 'react';
import type {
  Dose, CareLogEntry, CareLogTag, CareTask, ShoppingItem, UserRole,
} from 'shared/types';

/**
 * All care state in one place, so every screen reads and writes the same data.
 *
 * This file is the contract. Implementations live alongside it —
 * MockCareProvider for the demo, SupabaseCareProvider for real data — and
 * nothing in screens/ should ever know which one it got.
 */
export interface CareState {
  doses: Dose[];
  careLog: CareLogEntry[];
  tasks: CareTask[];
  shopping: ShoppingItem[];
  /** Every note, regardless of who may see it. Admin-only in practice. */
  allCareLog: CareLogEntry[];
  currentUser: string;
  setCurrentUser: (id: string) => void;
  role: UserRole;
  /** True for the master admin and for anyone they have granted admin to. */
  isAdmin: boolean;
  isMasterAdmin: boolean;
  /** Everyone holding admin right now, master admin first. */
  adminIds: string[];
  adminSlotsLeft: number;
  grantAdmin: (userId: string) => void;
  revokeAdmin: (userId: string) => void;
  logDose: (medicationId: string, time: string, notes: string) => void;
  addNote: (text: string, tag: CareLogTag, confidential: boolean) => void;
  completeTask: (taskId: string, notes: string) => void;
  claimItem: (itemId: string) => void;
  purchaseItem: (itemId: string) => void;
  resetAll: () => void;
}

export const CareContext = createContext<CareState | null>(null);

export function useCare() {
  const ctx = useContext(CareContext);
  if (!ctx) throw new Error('useCare must be used inside a care provider');
  return ctx;
}
