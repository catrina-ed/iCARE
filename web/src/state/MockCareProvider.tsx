import { useMemo } from 'react';
import {
  TODAYS_DOSES_MORNING, CARE_LOG, CARE_TASKS, SHOPPING_ITEMS, USERS,
} from 'shared/data';
import { ADMIN_LIMIT } from 'shared/types';
import type {
  Dose, CareLogEntry, CareTask, ShoppingItem, UserRole,
} from 'shared/types';
import { usePersistentState, resetPersistedState } from '../hooks/usePersistentState';
import { CareContext, type CareState } from './careContext';

/**
 * Demo implementation: seed data in localStorage, identity from the role
 * switcher. Holds nothing real and needs no network.
 */
export function MockCareProvider({ children }: { children: React.ReactNode }) {
  // Persisted so a role chosen while demoing survives a refresh.
  const [currentUser, setCurrentUser] = usePersistentState<string>('currentUser', 'trina');
  const role: UserRole = USERS[currentUser]?.role ?? 'master-admin';

  // The master admin is fixed by the data; additional admins are a grant the
  // master admin makes, so they are stored rather than derived.
  const masterAdminId = Object.keys(USERS).find(id => USERS[id].role === 'master-admin') ?? 'trina';
  const [grantedAdminIds, setGrantedAdminIds] = usePersistentState<string[]>('grantedAdmins', []);

  const adminIds = useMemo(
    () => [masterAdminId, ...grantedAdminIds.filter(id => id !== masterAdminId)],
    [masterAdminId, grantedAdminIds],
  );

  const isMasterAdmin = currentUser === masterAdminId;
  const isAdmin = adminIds.includes(currentUser);
  const adminSlotsLeft = Math.max(0, ADMIN_LIMIT - adminIds.length);

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
    isMasterAdmin,
    adminIds,
    adminSlotsLeft,

    grantAdmin: (userId) => {
      // Silently ignoring the overflow would look like a bug; the caller
      // disables the control, so reaching here means the cap was bypassed.
      if (adminIds.length >= ADMIN_LIMIT) return;
      if (adminIds.includes(userId)) return;
      setGrantedAdminIds([...grantedAdminIds, userId]);
    },

    // The master admin's own role comes from the data, so it cannot be
    // revoked here — there is always at least one admin.
    revokeAdmin: (userId) => {
      if (userId === masterAdminId) return;
      setGrantedAdminIds(grantedAdminIds.filter(id => id !== userId));
    },

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

    logDoses: (ids, opts = {}) => {
      const previous = doses.filter(d => ids.includes(d.id)).map(d => ({ ...d }));
      const stamp = opts.at ?? new Date().toTimeString().slice(0, 5);
      setDoses(doses.map(d => ids.includes(d.id)
        ? {
            ...d,
            status: 'given' as const,
            confirmedBy: currentUser,
            confirmedAt: stamp,
            notes: opts.note || undefined,
          }
        : d));
      return previous;
    },

    skipDoses: (ids, reason) => {
      const previous = doses.filter(d => ids.includes(d.id)).map(d => ({ ...d }));
      setDoses(doses.map(d => ids.includes(d.id)
        ? {
            ...d,
            status: 'skipped' as const,
            confirmedBy: currentUser,
            confirmedAt: new Date().toTimeString().slice(0, 5),
            notes: reason,
          }
        : d));
      return previous;
    },

    restoreDoses: (previous) => {
      setDoses(doses.map(d => previous.find(p => p.id === d.id) ?? d));
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
       role, isAdmin, isMasterAdmin, adminIds, adminSlotsLeft, masterAdminId,
       grantedAdminIds, setGrantedAdminIds,
       setDoses, setCareLog, setTasks, setShopping]);

  return <CareContext.Provider value={value}>{children}</CareContext.Provider>;
}
