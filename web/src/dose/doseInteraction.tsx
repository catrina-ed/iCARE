import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { Dose } from 'shared/types';
import { useCare } from '../state/CareProvider';

/**
 * The interaction layer for dose logging.
 *
 * Deliberately separate from CareProvider: the sheet, the toast, and the
 * undo snapshot are interface state, not care data. Keeping them here means
 * the eventual Supabase provider implements the data operations and inherits
 * all of this behaviour untouched.
 */

export interface SheetState {
  ids: string[];
  mode: 'log' | 'skip';
}

interface ToastState {
  text: string;
  sub: string;
  /** What the doses looked like before, so Undo can put them back. */
  previous: Dose[];
}

interface DoseInteraction {
  sheet: SheetState | null;
  toast: ToastState | null;
  /** Id of the dose that just committed, so its circle can animate. */
  flash: string | null;
  readOnly: boolean;
  /** One tap: commit straight to given, no confirmation step. */
  logNow: (ids: string | string[]) => void;
  commit: (ids: string[], opts: { at?: string; note?: string }) => void;
  markNotTaken: (ids: string[], reason: string) => void;
  undo: () => void;
  openSheet: (ids: string | string[], mode?: 'log' | 'skip') => void;
  closeSheet: () => void;
  dismissToast: () => void;
}

const Ctx = createContext<DoseInteraction | null>(null);

/** How long the undo stays available, matching the prototype. */
const TOAST_MS = 6000;

export function DoseInteractionProvider({ children }: { children: React.ReactNode }) {
  const { doses, logDoses, skipDoses, restoreDoses, role } = useCare();

  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  // Gail sees her day; she does not log her own care from these controls.
  const readOnly = role === 'recipient';

  const showToast = useCallback((next: ToastState) => {
    setToast(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const describe = useCallback((ids: string[], previous: Dose[], verb: string, sub: string) => {
    const count = previous.length || ids.length;
    return {
      text: count > 1 ? `${count} doses ${verb}` : `Dose ${verb}`,
      sub,
      previous,
    };
  }, []);

  const commit = useCallback((ids: string[], opts: { at?: string; note?: string } = {}) => {
    if (readOnly || ids.length === 0) return;
    const previous = logDoses(ids, opts);
    setFlash(ids[0]);
    window.setTimeout(() => setFlash(null), 500);
    const when = opts.at ?? new Date().toTimeString().slice(0, 5);
    showToast(describe(ids, previous, 'logged', `${when}${opts.note ? ' · note added' : ''}`));
  }, [readOnly, logDoses, showToast, describe]);

  const markNotTaken = useCallback((ids: string[], reason: string) => {
    if (readOnly || ids.length === 0) return;
    const previous = skipDoses(ids, reason);
    showToast(describe(ids, previous, 'marked not taken', reason || 'Reason recorded'));
  }, [readOnly, skipDoses, showToast, describe]);

  const logNow = useCallback((ids: string | string[]) => {
    commit(([] as string[]).concat(ids), {});
  }, [commit]);

  const undo = useCallback(() => {
    if (!toast) return;
    restoreDoses(toast.previous);
    setToast(null);
    if (timer.current) window.clearTimeout(timer.current);
  }, [toast, restoreDoses]);

  const value: DoseInteraction = {
    sheet,
    toast,
    flash,
    readOnly,
    logNow,
    commit,
    markNotTaken,
    undo,
    openSheet: (ids, mode = 'log') => {
      if (readOnly) return;
      setSheet({ ids: ([] as string[]).concat(ids), mode });
    },
    closeSheet: () => setSheet(null),
    dismissToast: () => setToast(null),
  };

  // Referenced so a future implementation can key off the live dose list
  // without every consumer reaching back into CareProvider.
  void doses;

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDoseInteraction() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDoseInteraction must be used inside DoseInteractionProvider');
  return ctx;
}
