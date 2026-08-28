import { COLORS } from 'shared/theme';
import { MEDICATIONS, USERS } from 'shared/data';
import type { Dose } from 'shared/types';
import { useCare } from '../state/CareProvider';
import { DoseCheck } from '../dose/DoseCheck';
import { useDoseInteraction } from '../dose/doseInteraction';


function to12h(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const h12 = ((h + 11) % 12) + 1;
  return { time: `${h12}:${String(m).padStart(2, '0')}`, ampm: h < 12 ? 'AM' : 'PM' };
}

/** Morning / Afternoon / Evening, so a bucket reads as part of the day. */
function partOfDay(hour: number) {
  return hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
}

export function Meds() {
  const { doses } = useCare();
  const { openSheet, logNow, readOnly } = useDoseInteraction();

  const given = doses.filter(d => d.status === 'given').length;
  const skipped = doses.filter(d => d.status === 'skipped').length;
  const total = doses.length || 1;

  // Grouped by hour, which is how doses are actually given — everything at
  // 8am together, not one long undifferentiated list.
  const buckets = doses.reduce<Record<string, Dose[]>>((acc, d) => {
    const hour = d.time.split(':')[0];
    (acc[hour] ??= []).push(d);
    return acc;
  }, {});
  const hours = Object.keys(buckets).sort();

  const lowStock = MEDICATIONS.filter(m => m.lowStock || (m.refillDue ?? 99) <= 7);

  return (
    <>
      <div className="header">
        <div>
          <div className="greeting">Medications</div>
          <div className="name">
            <span style={{ color: COLORS.primary }}>{given}</span>
            <span style={{ color: COLORS.textMute, fontWeight: 400 }}> of {doses.length} doses given</span>
          </div>
          {skipped > 0 && (
            <div className="meds-skipped">
              {skipped} not taken · reason recorded — not the same as missed
            </div>
          )}
        </div>
      </div>

      {/* Solid for given, hatched for not-taken, so the two never blur together. */}
      <div className="progress">
        <div className="progress-given" style={{ width: `${(given / total) * 100}%` }} />
        {skipped > 0 && <div className="progress-skipped" style={{ width: `${(skipped / total) * 100}%` }} />}
      </div>

      {lowStock.length > 0 && (
        <div className="section">
          <h2 className="section-title">Refills needed soon</h2>
          {lowStock.map(med => (
            <div key={med.id} className="alert" style={{ borderLeftColor: COLORS.amber }}>
              <div className="alert-title">{med.name}</div>
              <div className="alert-subtitle">
                {med.stock} left · refill due in {med.refillDue} days
              </div>
            </div>
          ))}
        </div>
      )}

      {hours.map(hour => {
        const bucket = buckets[hour];
        const open = bucket.filter(d => d.status !== 'given' && d.status !== 'skipped');
        const { time, ampm } = to12h(bucket[0].time);
        return (
          <div className="section" key={hour}>
            <div className="bucket-head">
              <div className="bucket-time">
                {time}<span className="bucket-ampm">{ampm}</span>
              </div>
              <div className="bucket-part">· {partOfDay(Number(hour))}</div>
              <div style={{ flex: 1 }} />
              {open.length > 1 && !readOnly && (
                <button className="bucket-logall" onClick={() => logNow(open.map(d => d.id))}>
                  ✓ Log all {open.length}
                </button>
              )}
            </div>

            <div className="card">
              {bucket.map(dose => {
                const med = MEDICATIONS.find(m => m.id === dose.medicationId);
                const by = dose.confirmedBy ? USERS[dose.confirmedBy] : null;
                const settled = dose.status === 'given' || dose.status === 'skipped';
                return (
                  <div key={dose.id} className="dose-row" data-settled={settled}>
                    <DoseCheck dose={dose} />
                    <div className="dose-row-body">
                      <div className="dose-name">
                        {med?.name} <span className="dose-row-dose">· {med?.dose}</span>
                      </div>
                      <div className="dose-row-meta">
                        {settled && by && <span>{by.name}{dose.confirmedAt ? ` · ${dose.confirmedAt}` : ''}</span>}
                        {dose.status === 'skipped' && (
                          <span className="dose-flag-skipped">
                            NOT TAKEN{dose.notes ? ` · ${dose.notes}` : ''}
                          </span>
                        )}
                        {dose.status === 'given' && dose.notes && (
                          <span className="dose-note">“{dose.notes}”</span>
                        )}
                        {dose.status === 'missed' && <span className="dose-flag-missed">{dose.notes ?? 'Past window'}</span>}
                        {dose.status === 'due' && <span className="dose-flag-due">DUE NOW</span>}
                        {!settled && dose.status === 'upcoming' && med?.instructions && <span>{med.instructions}</span>}
                      </div>
                    </div>
                    {!readOnly && (
                      <button
                        className="dose-row-action"
                        data-status={dose.status}
                        onClick={() => openSheet(dose.id, 'log')}
                      >
                        {settled ? 'Edit' : dose.status === 'missed' ? 'Log late' : dose.status === 'due' ? 'Log now' : 'Log'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="card">
        <h3 className="card-title">All Medications</h3>
        {MEDICATIONS.map(med => (
          <div key={med.id} className="med-row">
            <div className="med-main">
              <div className="med-name">{med.name} <span className="med-dose">{med.dose}</span></div>
              <div className="med-instructions">{med.instructions}</div>
              <div className="med-meta">
                {med.prescribedBy} · {med.pharmacy}
              </div>
            </div>
            <div className="med-stock" style={{
              color: (med.refillDue ?? 99) <= 7 ? COLORS.warn : COLORS.textMuted,
            }}>
              <div className="med-stock-number">{med.stock}</div>
              <div className="med-stock-label">left</div>
            </div>
          </div>
        ))}
      </div>

    </>
  );
}
