import { useState } from 'react';
import { COLORS } from 'shared/theme';
import { APPOINTMENTS, USERS } from 'shared/data';

const TYPE_COLOUR: Record<string, string> = {
  medical: COLORS.coral,
  therapy: COLORS.primary,
  casework: COLORS.plum,
  social: COLORS.amber,
};

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function to12h(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, '0')}`;
}

function minutesBetween(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export function Calendar() {
  // The week containing today, Sunday first.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  // Dates are built from local components rather than parsed from ISO, which
  // would be read as UTC and land a day early west of Greenwich.
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const pad = (n: number) => String(n).padStart(2, '0');
    return { date: d, iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` };
  });

  const todayIndex = days.findIndex(d => d.date.getTime() === today.getTime());
  const [selected, setSelected] = useState(todayIndex >= 0 ? todayIndex : 0);
  const [attendee, setAttendee] = useState<string>('all');

  const forDay = (iso: string) => APPOINTMENTS
    .filter(a => a.date === iso)
    .filter(a => attendee === 'all' || a.assignedTo === attendee);

  const chosen = days[selected];
  const appointments = forDay(chosen.iso);

  return (
    <>
      <div className="header">
        <div>
          <div className="greeting">
            Week of {days[0].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
          <div className="name">
            {chosen.date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="week-strip">
        {days.map((day, i) => {
          const count = forDay(day.iso).length;
          return (
            <button key={day.iso} className="week-day" data-on={i === selected}
              data-today={i === todayIndex} onClick={() => setSelected(i)}>
              <span className="week-dow">{DOW[day.date.getDay()]}</span>
              <span className="week-num">{day.date.getDate()}</span>
              <span className="week-dots">
                {Array.from({ length: Math.min(count, 3) }).map((_, k) => (
                  <span key={k} className="week-dot" />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="filter-row">
        <button className="filter-chip" data-active={attendee === 'all'} onClick={() => setAttendee('all')}>
          Everyone
        </button>
        {['trina', 'markyaah', 'destiny', 'catina'].map(id => (
          <button key={id} className="filter-chip" data-active={attendee === id} onClick={() => setAttendee(id)}>
            {USERS[id]?.name}
          </button>
        ))}
      </div>

      <div className="section">
        <h2 className="section-title">
          {chosen.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          {selected === todayIndex ? ' · Today' : ''}
        </h2>

        {appointments.length === 0 ? (
          <div className="empty-panel">
            <div className="empty-panel-body">A quiet day. Nothing on the calendar.</div>
          </div>
        ) : appointments.map(appt => {
          const accent = TYPE_COLOUR[appt.type] ?? COLORS.primary;
          const person = USERS[appt.assignedTo];
          return (
            <div key={appt.id} className="card appt-card" style={{ borderLeftColor: accent }}>
              <div className="appt-top">
                <div className="appt-when">
                  <div className="appt-start">{to12h(appt.startTime)}</div>
                  <div className="appt-len">
                    {Number(appt.startTime.split(':')[0]) < 12 ? 'AM' : 'PM'} · {minutesBetween(appt.startTime, appt.endTime)} min
                  </div>
                </div>
                <div className="appt-body">
                  <div className="appt-title">{appt.title}</div>
                  <div className="appt-meta">{appt.provider} · {appt.location}</div>
                  {appt.prepNotes && (
                    <div className="appt-prep-pill" style={{ color: accent, backgroundColor: accent + '1F' }}>
                      ⚠ {appt.prepNotes}
                    </div>
                  )}
                </div>
              </div>
              <div className="appt-foot">
                <div className="recent-avatar">{person?.initials ?? '·'}</div>
                <span className="appt-attending">
                  <strong>{person?.name ?? appt.assignedTo}</strong> attending
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
