import { createContext, useContext, useMemo } from 'react';
import {
  TODAYS_DOSES_MORNING, CARE_LOG, CARE_TASKS, SHOPPING_ITEMS,
} from 'shared/data';
import type {
  Dose, CareLogEntry, CareLogTag, CareTask, ShoppingItem,
} from 'shared/types';
import { usePersistentState, resetPersistedState } from '../hooks/usePersistentState';

/**
 * All care state in one place, so every screen reads and writes the same data.
 *
 * Deliberately the only module that knows where data lives. Swapping
 * localStorage for Supabase later means rewriting this file and nothing else.
 */
interface CareState {
  doses: Dose[];
  careLog: CareLogEntry[];
  tasks: CareTask[];
  shopping: ShoppingItem[];
  currentUser: string;
  logDose: (medicationId: string, time: string, notes: string) => void;
  addNote: (text: string, tag: CareLogTag, confidential: boolean) => void;
  completeTask: (taskId: string, notes: string) => void;
  claimItem: (itemId: string) => void;
  purchaseItem: (itemId: string) => void;
  resetAll: () => void;
}

const Ctx = createContext<CareState | null>(null);

export function CareProvider({ children }: { children: React.ReactNode }) {
  const currentUser = 'trina';

  const [doses, setDoses] = usePersistentState<Dose[]>('doses', TODAYS_DOSES_MORNING);
  const [careLog, setCareLog] = usePersistentState<CareLogEntry[]>('careLog', CARE_LOG);
  const [tasks, setTasks] = usePersistentState<CareTask[]>('tasks', CARE_TASKS);
  const [shopping, setShopping] = usePersistentState<ShoppingItem[]>('shopping', SHOPPING_ITEMS);

  const value = useMemo<CareState>(() => ({
    doses, careLog, tasks, shopping, currentUser,

    logDose: (medicationId, time, notes) => {
      const dose: Dose = {
        id: `dose-${Date.now()}`,
        medicationId,
        time,
        status: 'given',
        confirmedBy: currentUser,
        confirmedAt: new Date().toISOString(),
        notes: notes || undefined,
      };
      setDoses([...doses, dose].sort((a, b) => a.time.localeCompare(b.time)));
    },

    addNote: (text, tag, confidential) => {
      setCareLog([{
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        author: currentUser,
        tag,
        text,
        confidential,
      }, ...careLog]);
    },

    completeTask: (taskId, notes) => {
      setTasks(tasks.map(t => t.id === taskId ? {
        ...t,
        done: true,
        completedBy: currentUser,
        completedAt: new Date().toISOString(),
        notes: notes || t.notes,
      } : t));
    },

    claimItem: (itemId) => {
      setShopping(shopping.map(i => i.id === itemId
        ? { ...i, status: 'assigned' as const, assignedTo: currentUser }
        : i));
    },

    purchaseItem: (itemId) => {
      setShopping(shopping.map(i => i.id === itemId
        ? { ...i, status: 'purchased' as const }
        : i));
    },

    resetAll: () => {
      resetPersistedState();
      setDoses(TODAYS_DOSES_MORNING);
      setCareLog(CARE_LOG);
      setTasks(CARE_TASKS);
      setShopping(SHOPPING_ITEMS);
    },
  }), [doses, careLog, tasks, shopping, setDoses, setCareLog, setTasks, setShopping]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCare() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCare must be used inside CareProvider');
  return ctx;
}
