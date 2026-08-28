import { useState } from 'react';
import { COLORS } from 'shared/theme';
import type { Dose } from 'shared/types';
import { useDoseInteraction } from './doseInteraction';

const RING: Record<string, string> = {
  given: COLORS.primary,
  skipped: COLORS.textMute,
  missed: COLORS.coral,
  due: COLORS.amber,
  upcoming: COLORS.textDim,
};

/**
 * The tappable circle — the whole product in one control.
 *
 * An open dose commits on a single tap with no confirmation, which is what
 * makes logging a sub-ten-second action. A dose that is already settled opens
 * the sheet to be corrected instead, so a mis-tap never silently re-logs.
 */
export function DoseCheck({ dose, size = 30 }: { dose: Dose; size?: number }) {
  const { logNow, openSheet, readOnly, flash } = useDoseInteraction();
  const [pressed, setPressed] = useState(false);

  const settled = dose.status === 'given' || dose.status === 'skipped';
  const colour = RING[dose.status] ?? COLORS.textDim;
  const popping = flash === dose.id;

  return (
    <button
      aria-label={settled ? 'Logged — tap to edit' : 'Tap to log this dose'}
      disabled={readOnly}
      onClick={(e) => {
        e.stopPropagation();
        if (readOnly) return;
        if (settled) openSheet(dose.id, 'log');
        else logNow(dose.id);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        padding: 0,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: readOnly ? 'default' : 'pointer',
        border: `1.5px solid ${dose.status === 'given' ? colour : pressed ? COLORS.primary : colour}`,
        background: dose.status === 'given'
          ? colour
          : pressed ? 'rgba(148, 174, 130, 0.28)' : 'transparent',
        transition: 'background .12s, border-color .12s, transform .12s',
        transform: pressed ? 'scale(0.9)' : 'scale(1)',
        animation: popping ? 'dosePop .45s cubic-bezier(.34,1.56,.64,1)' : 'none',
      }}
    >
      {dose.status === 'given' && (
        <svg width={size * 0.53} height={size * 0.53} viewBox="0 0 24 24" fill="none"
          stroke={COLORS.primaryInk} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5 10 17 19.5 7" />
        </svg>
      )}
      {dose.status === 'skipped' && (
        <div style={{ width: size * 0.4, height: 1.5, background: COLORS.textMute, borderRadius: 2 }} />
      )}
      {dose.status === 'missed' && (
        <svg width={size * 0.47} height={size * 0.47} viewBox="0 0 24 24" fill="none"
          stroke={COLORS.coral} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4 21 19.5H3L12 4Z" /><path d="M12 10v4.5M12 17v.5" />
        </svg>
      )}
      {dose.status === 'due' && (
        <div style={{ width: 8, height: 8, borderRadius: 999, background: COLORS.amber }} />
      )}
    </button>
  );
}
