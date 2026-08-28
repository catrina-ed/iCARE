import { createContext, useContext, useMemo } from 'react';
import {
  TODAYS_DOSES_MORNING, CARE_LOG, CARE_TASKS, SHOPPING_ITEMS,
} from 'shared/data';
import { USERS } from 'shared/data';
import type {
  Dose, CareLogEntry, CareLogTag, CareTask, ShoppingItem, UserRole,
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
  /** Every note, regardless of who may see it. Admin-only in practice. */
  allCareLog: CareLogEntry[];
  currentUser: string;
  setCurrentUser: (id: string) => void;
  role: UserRole;
  isAdmin: boolean;
  logDose: (medicationId: string, time: string, notes: string) => void;
  addNote: (text: string, tag: CareLogTag, confidential: boolean) => void;
  completeTask: (taskId: string, notes: string) => void;
  claimItem: (itemId: string) => void;
  purchaseItem: (itemId: string) => void;
  resetAll: () => void;
}

const Ctx = createContext<CareState | null>(null);

export function CareProvider({ children }: { children: React.ReactNode }) {
  // Persisted so a role chosen while demoing survives a refresh.
  const [currentUser, setCurrentUser] = usePersistentState<string>('currentUser', 'trina');
  const role = USERS[currentUser]?.role ?? 'admin';
  const isAdmin = role === 'admin';

  const [doses, setDoses] = usePersistentState<Dose[]>('doses', TODAYS_DOSES_MORNING);
  const [careLog, setCareLog] = usePersistentState<CareLogEntry[]>('careLog', CARE_LOG);
  const [tasks, setTasks] = usePersistentState<CareTask[]>('tasks', CARE_TASKS);
  const [shopping, setShopping] = usePersistentState<ShoppingItem[]>('shopping', SHOPPING_ITEMS);

  // Mirrors the database policy: a confidential note is visible only to its
  // author and to admins. Enforced again here so the UI cannot show what the
  // backend would refuse to return.
  const visibleCareLog = useMemo(
    () => careLog.filter(e => !e.confidential || e.author === currentUser || isAdmin),
    [careLog, currentUser, isAdmin],
  );

  const value = useMemo<CareState>(() => ({
    doses,
    careLog: visibleCareLog,
    allCareLog: careLog,
    tasks,
    shopping,
    currentUser,
    setCurrentUser,
    role,
    isAdmin,

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
  }), [doses, careLog, visibleCareLog, tasks, shopping, currentUser, setCurrentUser,
       role, isAdmin, setDoses, setCareLog, setTasks, setShopping]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCare() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCare must be used inside CareProvider');
  return ctx;
}
