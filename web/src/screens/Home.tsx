import { useState } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from 'shared/theme';
import {
  USERS, GAIL, ON_SHIFT, ALERTS_MORNING_CALM, ALERTS_MORNING_ALERT, MEDICATIONS,
} from 'shared/data';
import { useCare } from '../state/CareProvider';
import { AddNoteModal } from '../components/AddNoteModal';
import { TaskDoneModal } from '../components/TaskDoneModal';
import { DoseCheck } from '../dose/DoseCheck';
import { useDoseInteraction } from '../dose/doseInteraction';
import { useSession } from '../hooks/useSession';
import { supabase } from '../lib/supabase';

function to12h(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const h12 = ((h + 11) % 12) + 1;
  return { time: `${h12}:${String(m).padStart(2, '0')}`, ampm: h < 12 ? 'AM' : 'PM' };
}

const ALERT_ICON: Record<string, string> = {
  meds: '💊', supplies: '🛒', bills: '🧾', handoff: '🔄', appointment: '📅',
};

export function Home() {
  const { session } = useSession();
  const {
    doses, careLog, tasks, shopping, currentUser, role, isAdmin,
    addNote, completeTask, resetAll,
  } = useCare();
  const { openSheet, readOnly } = useDoseInteraction();

  const [showAlerts, setShowAlerts] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isTaskDoneOpen, setIsTaskDoneOpen] = useState(false);

  const user = USERS[currentUser];
  const onShift = USERS[ON_SHIFT.morning.who];

  const given = doses.filter(d => d.status === 'given').length;
  const openDoses = doses.filter(d => d.status !== 'given' && d.status !== 'skipped');
  const nextOpen = doses.find(d => d.status === 'due' || d.status === 'missed') ?? openDoses[0];
  const upNext = openDoses.slice(0, 3);

  // A meds alert with nothing open is stale — hide it rather than nag.
  const alerts = (showAlerts ? ALERTS_MORNING_ALERT : ALERTS_MORNING_CALM)
    .filter(a => a.type !== 'meds' || openDoses.length > 0);
  const allGood = alerts.length === 0;

  const isRecipient = role === 'recipient';

  return (
    <>
      <div className="header">
        <div style={{ minWidth: 0 }}>
          <div className="greeting">Today · {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
          <div className="name">
            {isRecipient ? 'Hi, ' : 'Good morning, '}
            <span style={{ color: COLORS.primary }}>{user?.name}</span>.
          </div>
          <div className="greeting-status">
            {isRecipient
              ? 'Here is your day.'
              : allGood
                ? `${GAIL.name}'s day is on track. Nothing needs you right now.`
                : `${GAIL.name}'s day needs attention — ${alerts.length} item${alerts.length > 1 ? 's' : ''} below.`}
          </div>
        </div>
        <div className="header-actions">
          {session && (
            <button className="reset-button" title={`Signed in as ${session.user.email}`}
              onClick={() => supabase?.auth.signOut()}>Sign out</button>
          )}
          <button className="reset-button" title="Start over from the sample day"
            onClick={() => { if (confirm('Clear everything logged in this browser and start over?')) resetAll(); }}>
            Reset demo data
          </button>
          <button className="alert-toggle" onClick={() => setShowAlerts(!showAlerts)}>🚨</button>
        </div>
      </div>

      {isRecipient && (
        <button className="voice-cta" onClick={() => window.dispatchEvent(new CustomEvent('icare:voice'))}>
          <span className="voice-cta-mic">🎙</span>
          <span className="voice-cta-body">
            <span className="voice-cta-title">Talk to iCare</span>
            <span className="voice-cta-sub">Log a note, take your medicine, or ask what's next</span>
          </span>
          <span className="more-chev">›</span>
        </button>
      )}

      {/* Who is here right now — the first thing a caretaker checks. */}
      <div className="card onshift">
        <div className="onshift-avatar">{onShift?.initials}</div>
        <div className="onshift-body">
          <div className="onshift-kicker">On shift · until {ON_SHIFT.morning.to}</div>
          <div className="onshift-name">
            {onShift?.name}
            <span className="onshift-role">{onShift?.relationship}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="today-status">
          <span className="status-dot" data-ok={allGood} />
          <span className="today-status-text">
            {allGood
              ? 'Everything on track'
              : `${alerts.length} thing${alerts.length > 1 ? 's' : ''} need${alerts.length > 1 ? '' : 's'} attention`}
          </span>
        </div>
        <div className="summary-cells">
          <SummaryCell icon="💊" label="Meds" big={`${given}/${doses.length}`} sub="given"
            warn={doses.some(d => d.status === 'missed' || d.status === 'due')} />
          <SummaryCell icon="📅" label="Visits" big="1" sub="today" />
          <SummaryCell icon="🛒" label="Supplies" big={String(shopping.filter(i => i.status === 'needed').length)} sub="needed" />
          <SummaryCell icon="📝" label="Notes" big={String(careLog.length)} sub="logged" />
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="section">
          <h2 className="section-title">Needs attention</h2>
          {alerts.map(alert => {
            const severity = alert.severity === 'danger' ? COLORS.coral
              : alert.severity === 'warn' ? COLORS.amber : COLORS.plum;
            const canLog = alert.type === 'meds' && nextOpen && !readOnly;
            return (
              <div key={alert.id} className="alert-row" style={{ borderLeftColor: severity }}>
                <div className="alert-row-icon" style={{ backgroundColor: severity + '24' }}>
                  {ALERT_ICON[alert.type] ?? '⚠️'}
                </div>
                <div className="alert-row-body">
                  <div className="alert-title">{alert.title}</div>
                  {alert.subtitle && <div className="alert-subtitle">{alert.subtitle}</div>}
                </div>
                {canLog && (
                  <button className="alert-log" style={{ backgroundColor: severity }}
                    onClick={() => openSheet(nextOpen.id, 'log')}>
                    Log it
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="card">
        <h3 className="card-title">
          Up next
          <Link className="card-link" to="/meds">See all</Link>
        </h3>
        {upNext.length === 0 ? (
          <div className="all-done">
            <div className="all-done-mark">✓</div>
            <div>
              <div className="all-done-title">All doses logged for today</div>
              <div className="all-done-sub">Next scheduled dose is tomorrow morning</div>
            </div>
          </div>
        ) : upNext.map(dose => {
          const med = MEDICATIONS.find(m => m.id === dose.medicationId);
          const { time, ampm } = to12h(dose.time);
          return (
            <div key={dose.id} className="upnext-row">
              <div className="upnext-time">
                <div className="upnext-hour">{time}</div>
                <div className="upnext-ampm">{ampm}</div>
              </div>
              <div className="upnext-rule" />
              <div className="upnext-body">
                <div className="dose-name">{med?.name} <span className="dose-row-dose">· {med?.dose}</span></div>
                <div className="dose-row-meta">
                  {dose.status === 'missed' ? (dose.notes ?? 'Past window') : (med?.instructions ?? 'No special instructions')}
                </div>
              </div>
              <DoseCheck dose={dose} size={28} />
            </div>
          );
        })}
      </div>

      {!isRecipient && (
        <div className="section">
          <h2 className="section-title">Quick actions</h2>
          <div className="actions-grid">
            <button className="action-button" disabled={readOnly || !nextOpen}
              onClick={() => nextOpen && openSheet(nextOpen.id, 'log')}>
              <div className="action-icon">✓</div>
              <div className="action-label">Log a dose</div>
            </button>
            <button className="action-button" onClick={() => setIsAddNoteOpen(true)}>
              <div className="action-icon">📝</div>
              <div className="action-label">Add a note</div>
            </button>
            <button className="action-button" onClick={() => setIsTaskDoneOpen(true)}>
              <div className="action-icon">☑</div>
              <div className="action-label">Task done</div>
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="card-title">
          Today's tasks <span className="card-count">{tasks.filter(t => t.done).length}/{tasks.length}</span>
        </h3>
        {tasks.slice(0, 4).map(task => (
          <div key={task.id} className="task-item">
            <div className="task-check" data-done={task.done}>{task.done ? '✓' : ''}</div>
            <div className="task-body">
              <div className={task.done ? 'task-title task-title-done' : 'task-title'}>{task.title}</div>
              <div className="task-meta">
                {task.dueTime}
                {task.done && task.completedBy
                  ? ` · done by ${USERS[task.completedBy]?.name ?? task.completedBy}`
                  : task.assignedTo ? ` · ${USERS[task.assignedTo]?.name ?? task.assignedTo}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card-title">
          Recent activity
          <Link className="card-link" to="/notes">Full log</Link>
        </h3>
        {careLog.slice(0, 3).map(entry => (
          <div key={entry.id} className="recent-row">
            <div className="recent-avatar">{USERS[entry.author]?.initials ?? '·'}</div>
            <div className="recent-body">
              <div className="recent-head">
                <span className="recent-name">{USERS[entry.author]?.name ?? entry.author}</span>
                <span className="recent-time">· {entry.timestamp.split('T')[1]?.slice(0, 5)}</span>
                {entry.confidential && <span className="recent-conf">🔒 Conf.</span>}
              </div>
              <div className="recent-text">{entry.text}</div>
            </div>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="primary-view-note">
          <span className="primary-view-icon">🛡</span>
          <span><strong>Primary view.</strong> You can see confidential entries from any caretaker.</span>
        </div>
      )}

      <AddNoteModal isOpen={isAddNoteOpen} onClose={() => setIsAddNoteOpen(false)} onSubmit={addNote} />
      <TaskDoneModal isOpen={isTaskDoneOpen} onClose={() => setIsTaskDoneOpen(false)} onSubmit={completeTask} tasks={tasks} />
    </>
  );
}

function SummaryCell({ icon, label, big, sub, warn }: {
  icon: string; label: string; big: string; sub: string; warn?: boolean;
}) {
  return (
    <div className="summary-cell">
      <div className="summary-cell-head">
        <span>{icon}</span>
        <span className="summary-cell-label">{label}</span>
      </div>
      <div className="summary-cell-value">
        <span className="summary-cell-big" style={{ color: warn ? COLORS.amber : COLORS.text }}>{big}</span>
        <span className="summary-cell-sub">{sub}</span>
      </div>
    </div>
  );
}
