import { useState } from 'react';
import { COLORS } from 'shared/theme';
import { MEDICATIONS, USERS } from 'shared/data';
import { useCare } from '../state/CareProvider';
import { LogDoseModal } from '../components/LogDoseModal';

const STATUS_COLORS: Record<string, string> = {
  given: COLORS.success,
  upcoming: COLORS.textMuted,
  due: COLORS.warn,
  missed: COLORS.danger,
};

export function Meds() {
  const { doses, logDose } = useCare();
  const [isLogDoseOpen, setIsLogDoseOpen] = useState(false);

  const lowStock = MEDICATIONS.filter(m => m.lowStock || (m.refillDue ?? 99) <= 7);

  return (
    <>
      <div className="header">
        <div>
          <div className="greeting">Medications</div>
          <div className="name">{MEDICATIONS.length} active</div>
        </div>
        <button className="alert-toggle" onClick={() => setIsLogDoseOpen(true)} title="Log a dose">
          ➕
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="section">
          <h2 className="section-title">Refills Needed Soon</h2>
          {lowStock.map(med => (
            <div key={med.id} className="alert" style={{ borderLeftColor: COLORS.warn }}>
              <div className="alert-title">{med.name}</div>
              <div className="alert-subtitle">
                {med.stock} left · refill due in {med.refillDue} days · {med.pharmacy}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h3 className="card-title">Today's Schedule</h3>
        {doses.map(dose => {
          const med = MEDICATIONS.find(m => m.id === dose.medicationId);
          const color = STATUS_COLORS[dose.status] ?? COLORS.textMuted;
          return (
            <div key={dose.id} className="dose-item">
              <div className="dose-info">
                <div className="dose-time">{dose.time}</div>
                <div>
                  <div className="dose-name">{med?.name}</div>
                  <div className="dose-details">
                    {med?.dose}
                    {dose.confirmedBy && ` · ${USERS[dose.confirmedBy]?.name ?? dose.confirmedBy}`}
                  </div>
                </div>
              </div>
              <div className="dose-status" style={{ borderColor: color, backgroundColor: color + '20', color }}>
                {dose.status.charAt(0).toUpperCase() + dose.status.slice(1)}
              </div>
            </div>
          );
        })}
      </div>

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

      <LogDoseModal isOpen={isLogDoseOpen} onClose={() => setIsLogDoseOpen(false)} onSubmit={logDose} />
    </>
  );
}
