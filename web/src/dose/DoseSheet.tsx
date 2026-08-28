import { useEffect, useState } from 'react';
import { MEDICATIONS, USERS } from 'shared/data';
import { useCare } from '../state/CareProvider';
import { useDoseInteraction } from './doseInteraction';

/** Why a dose was not taken. A blank must never read as a forgotten dose. */
const REASONS = [
  'Refused', 'Asleep', 'Threw it up',
  'Held per doctor', 'Out of stock', 'Away from home',
];

function to12h(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export function DoseSheet() {
  const { doses } = useCare();
  const { sheet, closeSheet, commit, markNotTaken } = useDoseInteraction();

  const [mode, setMode] = useState<'log' | 'skip'>('log');
  const [when, setWhen] = useState<'now' | 'scheduled'>('now');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');

  // Reset every time the sheet opens, so a previous correction never leaks
  // into the next one.
  useEffect(() => {
    if (!sheet) return;
    setMode(sheet.mode);
    setWhen('now');
    setNote('');
    setReason('');
    setDetail('');
  }, [sheet]);

  if (!sheet) return null;

  const selected = doses.filter(d => sheet.ids.includes(d.id));
  const first = selected[0];
  if (!first) return null;

  const meds = selected.map(d => MEDICATIONS.find(m => m.id === d.medicationId)).filter(Boolean);
  const multi = selected.length > 1;
  const already = first.status === 'given' || first.status === 'skipped';
  const now = new Date().toTimeString().slice(0, 5);
  const at = when === 'scheduled' ? first.time : now;

  const submit = () => {
    if (mode === 'log') {
      commit(sheet.ids, { at, note: note.trim() || undefined });
    } else {
      markNotTaken(sheet.ids, [reason || 'Not taken', detail.trim()].filter(Boolean).join(' — '));
    }
    closeSheet();
  };

  return (
    <div className="sheet-backdrop" onClick={closeSheet}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grabber" />

        <div className="sheet-head">
          <div className="sheet-icon">💊</div>
          <div>
            <div className="sheet-title">
              {multi ? `${selected.length} doses · ${to12h(first.time)}` : meds[0]?.name}
            </div>
            <div className="sheet-sub">
              {multi
                ? meds.map(m => m?.name).join(', ')
                : `${meds[0]?.dose} · scheduled ${to12h(first.time)}`}
            </div>
          </div>
        </div>

        {already && (
          <div className="sheet-notice">
            Already logged{first.confirmedAt ? ` at ${first.confirmedAt}` : ''} by{' '}
            {first.confirmedBy ? USERS[first.confirmedBy]?.name ?? first.confirmedBy : '—'}.
            Changing it updates the shared record.
          </div>
        )}

        <div className="seg">
          {(['log', 'skip'] as const).map(m => (
            <button key={m} className="seg-btn" data-on={mode === m} onClick={() => setMode(m)}>
              {m === 'log' ? 'Log as given' : "Didn't take it"}
            </button>
          ))}
        </div>

        {mode === 'log' ? (
          <>
            <div className="field-label">Time given</div>
            <div className="chip-row">
              {([
                { id: 'now', label: 'Now', sub: to12h(now) },
                { id: 'scheduled', label: 'On schedule', sub: to12h(first.time) },
              ] as const).map(o => (
                <button key={o.id} className="time-chip" data-on={when === o.id} onClick={() => setWhen(o.id)}>
                  <div className="time-chip-label">{o.label}</div>
                  <div className="time-chip-sub">{o.sub}</div>
                </button>
              ))}
            </div>

            <div className="field-label">Note for the care circle · optional</div>
            <input
              className="sheet-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. crushed in applesauce"
            />
          </>
        ) : (
          <>
            <div className="field-label">Reason</div>
            <div className="reason-row">
              {REASONS.map(r => (
                <button key={r} className="reason-chip" data-on={reason === r} onClick={() => setReason(r)}>
                  {r}
                </button>
              ))}
            </div>

            <div className="field-label">What happened · optional</div>
            <input
              className="sheet-input"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="e.g. brought it back up 10 min later"
            />

            <p className="sheet-explainer">
              This records as <strong>not taken</strong> — the care circle sees the
              reason, so it never reads as a forgotten dose.
            </p>
          </>
        )}

        <div className="sheet-actions">
          <button className="sheet-cancel" onClick={closeSheet}>Cancel</button>
          <button className="sheet-submit" data-mode={mode} onClick={submit}>
            {mode === 'log'
              ? (multi ? `Log all ${selected.length}` : 'Confirm dose')
              : 'Mark not taken'}
          </button>
        </div>
      </div>
    </div>
  );
}
