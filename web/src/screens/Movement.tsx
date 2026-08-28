import { useState } from 'react';
import { COLORS } from 'shared/theme';
import { USERS } from 'shared/data';
import type { ExerciseIntensity } from 'shared/types';
import { useCare } from '../state/CareProvider';

const TYPES = ['Walk', 'Chair yoga', 'Physical therapy', 'Stretching', 'Dancing', 'Other'];
const DURATIONS = [10, 15, 20, 30, 45];
const INTENSITIES: ExerciseIntensity[] = ['light', 'moderate', 'vigorous'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const INTENSITY_COLOUR: Record<ExerciseIntensity, string> = {
  light: COLORS.primary,
  moderate: COLORS.amber,
  vigorous: COLORS.coral,
};

/** Local, not UTC — a date string parsed as UTC lands a day early out west. */
function dayIndex(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

function relativeDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return DOW[date.getDay()];
}

export function Movement() {
  const { exercise, logExercise, currentUser } = useCare();
  const [sheetOpen, setSheetOpen] = useState(false);

  const totalMinutes = exercise.reduce((sum, e) => sum + e.minutes, 0);
  const byDay = DOW.map((_, i) =>
    exercise.filter(e => dayIndex(e.date) === i).reduce((sum, e) => sum + e.minutes, 0));
  const peak = Math.max(...byDay, 1);
  const todayIndex = new Date().getDay();

  return (
    <>
      <div className="header">
        <div>
          <div className="greeting">This week</div>
          <div className="name">Movement</div>
        </div>
        <button className="pill-button" onClick={() => setSheetOpen(true)}>+ Log</button>
      </div>

      {exercise.length > 0 && (
        <div className="card">
          <div className="move-total">
            <span className="move-total-number">{totalMinutes}</span>
            <span className="move-total-label">
              minutes this week · {exercise.length} session{exercise.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="move-chart">
            {byDay.map((minutes, i) => (
              <div key={i} className="move-bar-col">
                <div
                  className="move-bar"
                  data-today={i === todayIndex}
                  style={{ height: Math.max(4, (minutes / peak) * 56) }}
                />
                <span className="move-bar-label" data-today={i === todayIndex}>{DOW[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <h2 className="section-title">Sessions</h2>
      </div>

      {exercise.length === 0 ? (
        <div className="empty-panel">
          <div className="empty-panel-icon">🚶</div>
          <div className="empty-panel-title">No activity logged yet</div>
          <div className="empty-panel-body">
            Even a short walk counts. Log the first session to start the week's chart.
          </div>
          <button className="empty-panel-cta" onClick={() => setSheetOpen(true)}>Log activity</button>
        </div>
      ) : (
        <div className="card">
          {exercise.map(session => {
            const person = USERS[session.by];
            return (
              <div key={session.id} className="move-row">
                <div className="move-row-icon">🚶</div>
                <div className="move-row-body">
                  <div className="move-row-head">
                    <span className="move-row-type">{session.type}</span>
                    <span className="move-row-min">{session.minutes} min</span>
                    <span
                      className="intensity-pill"
                      style={{
                        color: INTENSITY_COLOUR[session.intensity],
                        backgroundColor: INTENSITY_COLOUR[session.intensity] + '29',
                      }}
                    >
                      {session.intensity}
                    </span>
                  </div>
                  {session.note && <div className="move-row-note">{session.note}</div>}
                  <div className="move-row-by">
                    {person?.name ?? session.by} · {relativeDay(session.date)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sheetOpen && (
        <LogMovementSheet
          onClose={() => setSheetOpen(false)}
          onSave={(session) => { logExercise(session); setSheetOpen(false); }}
          who={USERS[currentUser]?.name ?? currentUser}
        />
      )}
    </>
  );
}

function LogMovementSheet({
  onClose, onSave, who,
}: {
  onClose: () => void;
  onSave: (s: { type: string; minutes: number; intensity: ExerciseIntensity; note?: string }) => void;
  who: string;
}) {
  const [type, setType] = useState('Walk');
  const [minutes, setMinutes] = useState(15);
  const [intensity, setIntensity] = useState<ExerciseIntensity>('light');
  const [note, setNote] = useState('');

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grabber" />
        <div className="sheet-title" style={{ marginBottom: 4 }}>Log activity</div>
        <div className="sheet-sub">Recorded as {who}</div>

        <div className="field-label">Type</div>
        <div className="reason-row">
          {TYPES.map(t => (
            <button key={t} className="reason-chip" data-on={type === t} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>

        <div className="field-label">Duration</div>
        <div className="chip-row">
          {DURATIONS.map(m => (
            <button key={m} className="time-chip" data-on={minutes === m} onClick={() => setMinutes(m)}>
              <div className="time-chip-label">{m}m</div>
            </button>
          ))}
        </div>

        <div className="field-label">Intensity</div>
        <div className="seg">
          {INTENSITIES.map(lv => (
            <button key={lv} className="seg-btn" data-on={intensity === lv} onClick={() => setIntensity(lv)}
              style={{ textTransform: 'capitalize' }}>
              {lv}
            </button>
          ))}
        </div>

        <div className="field-label">Note · optional</div>
        <input
          className="sheet-input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. walked to the garden and back"
        />

        <div className="sheet-actions">
          <button className="sheet-cancel" onClick={onClose}>Cancel</button>
          <button
            className="sheet-submit"
            onClick={() => onSave({ type, minutes, intensity, note: note.trim() || undefined })}
          >
            Save session
          </button>
        </div>
      </div>
    </div>
  );
}
