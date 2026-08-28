import { COLORS } from 'shared/theme';
import { APPOINTMENTS, USERS } from 'shared/data';

const TYPE_COLORS: Record<string, string> = {
  medical: COLORS.danger,
  therapy: COLORS.info,
  casework: COLORS.warn,
  social: COLORS.primary,
};

function formatDay(iso: string) {
  // Parsed as local rather than UTC: `new Date('2026-08-27')` is midnight UTC,
  // which lands on the previous day for anyone west of Greenwich.
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const label = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  return { label, isToday };
}

export function Calendar() {
  const byDay = APPOINTMENTS.reduce<Record<string, typeof APPOINTMENTS>>((acc, appt) => {
    (acc[appt.date] ??= []).push(appt);
    return acc;
  }, {});
  const days = Object.keys(byDay).sort();

  return (
    <>
      <div className="header">
        <div>
          <div className="greeting">This week</div>
          <div className="name">{APPOINTMENTS.length} appointments</div>
        </div>
      </div>

      {days.map(day => {
        const { label, isToday } = formatDay(day);
        return (
          <div key={day} className="section">
            <h2 className="section-title" style={{ color: isToday ? COLORS.primary : undefined }}>
              {isToday ? `Today · ${label}` : label}
            </h2>
            {byDay[day].map(appt => (
              <div key={appt.id} className="card appt-card" style={{ borderLeftColor: TYPE_COLORS[appt.type] ?? COLORS.primary }}>
                <div className="appt-time">{appt.startTime} – {appt.endTime}</div>
                <div className="appt-title">{appt.title}</div>
                <div className="appt-meta">{appt.provider} · {appt.location}</div>
                <div className="appt-footer">
                  <span className="badge" style={{ borderColor: COLORS.primary, color: COLORS.primary }}>
                    {USERS[appt.assignedTo]?.name ?? appt.assignedTo}
                  </span>
                  {appt.prepNotes && <span className="appt-prep">Prep: {appt.prepNotes}</span>}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}
