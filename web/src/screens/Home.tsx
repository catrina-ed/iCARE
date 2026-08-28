import { useState } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from 'shared/theme';
import { USERS, ALERTS_MORNING_CALM, ALERTS_MORNING_ALERT, MEDICATIONS } from 'shared/data';
import { useCare } from '../state/CareProvider';
import { LogDoseModal } from '../components/LogDoseModal';
import { AddNoteModal } from '../components/AddNoteModal';
import { TaskDoneModal } from '../components/TaskDoneModal';
import { useSession } from '../hooks/useSession';
import { supabase } from '../lib/supabase';

const STATUS_COLORS: Record<string, string> = {
  given: COLORS.success,
  upcoming: COLORS.textMuted,
  due: COLORS.warn,
  missed: COLORS.danger,
};

export function Home() {
  const { session } = useSession();
  const { doses, careLog, tasks, currentUser, isAdmin, logDose, addNote, completeTask, resetAll } = useCare();

  const [showAlerts, setShowAlerts] = useState(false);
  const [isLogDoseOpen, setIsLogDoseOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isTaskDoneOpen, setIsTaskDoneOpen] = useState(false);

  const user = USERS[currentUser];
  const alerts = showAlerts ? ALERTS_MORNING_ALERT : ALERTS_MORNING_CALM;

  const givenCount = doses.filter(d => d.status === 'given').length;
  const upcomingCount = doses.filter(d => d.status === 'upcoming' || d.status === 'due').length;
  const missedCount = doses.filter(d => d.status === 'missed').length;

  const handleReset = () => {
    if (!confirm('Clear everything logged in this browser and start over from the sample day?')) return;
    resetAll();
  };

  return (
    <>
      <div className="header">
        <div>
          <div className="greeting">Good morning,</div>
          <div className="name">{user.name}</div>
        </div>
        <div className="header-actions">
          {session && (
            <button
              className="reset-button"
              title={`Signed in as ${session.user.email}`}
              onClick={() => supabase?.auth.signOut()}
            >
              Sign out
            </button>
          )}
          <button className="reset-button" title="Start over from the sample day" onClick={handleReset}>
            Reset demo data
          </button>
          <button className="alert-toggle" onClick={() => setShowAlerts(!showAlerts)}>🚨</button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="section">
          <h2 className="section-title">Active Alerts</h2>
          {alerts.map(alert => (
            <div key={alert.id} className="alert" style={{
              borderLeftColor: alert.severity === 'danger' ? COLORS.danger
                : alert.severity === 'warn' ? COLORS.warn : COLORS.info,
            }}>
              <div className="alert-title">{alert.title}</div>
              {alert.subtitle && <div className="alert-subtitle">{alert.subtitle}</div>}
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="primary-view-note">
          <span className="primary-view-icon">🛡</span>
          <span>
            <strong>Primary view.</strong> You can see confidential entries from
            any caretaker.
          </span>
        </div>
      )}

      <div className="card summary-card">
        <h3 className="card-title">Today's Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-number">{givenCount}</div>
            <div className="summary-label">Doses Given</div>
          </div>
          <div className="summary-item">
            <div className="summary-number">{upcomingCount}</div>
            <div className="summary-label">Coming Up</div>
          </div>
          {missedCount > 0 && (
            <div className="summary-item">
              <div className="summary-number" style={{ color: COLORS.danger }}>{missedCount}</div>
              <div className="summary-label">Missed</div>
            </div>
          )}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-button" onClick={() => setIsLogDoseOpen(true)}>
            <div className="action-icon">💊</div>
            <div className="action-label">Log Dose</div>
          </button>
          <button className="action-button" onClick={() => setIsAddNoteOpen(true)}>
            <div className="action-icon">📝</div>
            <div className="action-label">Add Note</div>
          </button>
          <button className="action-button" onClick={() => setIsTaskDoneOpen(true)}>
            <div className="action-icon">✓</div>
            <div className="action-label">Task Done</div>
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">
          Today's Doses
          <Link className="card-link" to="/meds">View all</Link>
        </h3>
        {doses.slice(0, 5).map(dose => {
          const med = MEDICATIONS.find(m => m.id === dose.medicationId);
          const color = STATUS_COLORS[dose.status] ?? COLORS.textMuted;
          return (
            <div key={dose.id} className="dose-item">
              <div className="dose-info">
                <div className="dose-time">{dose.time}</div>
                <div>
                  <div className="dose-name">{med?.name}</div>
                  <div className="dose-details">{med?.dose}</div>
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
        <h3 className="card-title">
          <span>Today's Tasks <span className="card-count">{tasks.filter(t => t.done).length}/{tasks.length}</span></span>
        </h3>
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <div className="task-check" data-done={task.done}>{task.done ? '✓' : ''}</div>
            <div className="task-body">
              <div className={task.done ? 'task-title task-title-done' : 'task-title'}>{task.title}</div>
              <div className="task-meta">
                {task.dueTime}
                {task.done && task.completedBy
                  ? ` · done by ${USERS[task.completedBy]?.name ?? task.completedBy}`
                  : task.assignedTo
                    ? ` · ${USERS[task.assignedTo]?.name ?? task.assignedTo}`
                    : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card-title">
          Recent Notes
          <Link className="card-link" to="/notes">View all</Link>
        </h3>
        {careLog.slice(0, 3).map(entry => (
          <div key={entry.id} className="log-entry">
            <div className="log-header">
              <div className="log-time">{entry.timestamp.split('T')[1]?.slice(0, 5)}</div>
              <div className="log-author">{USERS[entry.author]?.name ?? entry.author}</div>
              {entry.confidential && (
                <span className="badge" style={{ borderColor: COLORS.info, color: COLORS.info }}>
                  Private
                </span>
              )}
            </div>
            <div className="log-text">{entry.text}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card-title">Who's On Duty</h3>
        <div className="on-duty-info">
          <div className="on-duty-avatar">{USERS.catina.initials}</div>
          <div>
            <div className="on-duty-name">{USERS.catina.name}</div>
            <div className="on-duty-time">8:00 AM – 6:00 PM</div>
          </div>
        </div>
      </div>

      <LogDoseModal isOpen={isLogDoseOpen} onClose={() => setIsLogDoseOpen(false)} onSubmit={logDose} />
      <AddNoteModal isOpen={isAddNoteOpen} onClose={() => setIsAddNoteOpen(false)} onSubmit={addNote} />
      <TaskDoneModal isOpen={isTaskDoneOpen} onClose={() => setIsTaskDoneOpen(false)} onSubmit={completeTask} tasks={tasks} />
    </>
  );
}
