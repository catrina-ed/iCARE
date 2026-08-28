import { useState } from 'react'
import './App.css'
import { COLORS } from 'shared/theme'
import {
  USERS, TODAYS_DOSES_MORNING, CARE_LOG,
  ALERTS_MORNING_CALM, ALERTS_MORNING_ALERT, MEDICATIONS, CARE_TASKS,
} from 'shared/data'
import { LogDoseModal } from './components/LogDoseModal'
import { AddNoteModal } from './components/AddNoteModal'
import { TaskDoneModal } from './components/TaskDoneModal'
import type { Dose, CareLogEntry, CareLogTag, CareTask } from 'shared/types'
import { usePersistentState, resetPersistedState } from './hooks/usePersistentState'

function App() {
  const [showAlerts, setShowAlerts] = useState(false)
  const [currentUser] = useState('trina')
  const [isLogDoseOpen, setIsLogDoseOpen] = useState(false)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isTaskDoneOpen, setIsTaskDoneOpen] = useState(false)
  const [doses, setDoses] = usePersistentState<Dose[]>('doses', TODAYS_DOSES_MORNING)
  const [careLog, setCareLog] = usePersistentState<CareLogEntry[]>('careLog', CARE_LOG)
  const [tasks, setTasks] = usePersistentState<CareTask[]>('tasks', CARE_TASKS)

  const user = USERS[currentUser]
  const alerts = showAlerts ? ALERTS_MORNING_ALERT : ALERTS_MORNING_CALM

  const handleLogDose = (medicationId: string, time: string, notes: string) => {
    const newDose: Dose = {
      id: `dose-${Date.now()}`,
      medicationId,
      time,
      status: 'given',
      confirmedBy: currentUser,
      confirmedAt: new Date().toISOString(),
      notes: notes || undefined,
    }
    setDoses([...doses, newDose].sort((a, b) => a.time.localeCompare(b.time)))
  }

  const handleAddNote = (text: string, tag: CareLogTag, confidential: boolean) => {
    const newEntry: CareLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: currentUser,
      tag,
      text,
      confidential,
    }
    setCareLog([newEntry, ...careLog])
  }

  const handleResetDemoData = () => {
    if (!confirm('Clear everything logged in this browser and start over from the sample day?')) return
    resetPersistedState()
    setDoses(TODAYS_DOSES_MORNING)
    setCareLog(CARE_LOG)
    setTasks(CARE_TASKS)
  }

  const handleTaskDone = (taskId: string, notes: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            done: true,
            completedBy: currentUser,
            completedAt: new Date().toISOString(),
            notes: notes || task.notes,
          }
        : task
    ))
  }

  const givenCount = doses.filter(d => d.status === 'given').length
  const upcomingCount = doses.filter(d => d.status === 'upcoming' || d.status === 'due').length
  const missedCount = doses.filter(d => d.status === 'missed').length

  return (
    <div className="app" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <div className="container">
        {/* Header */}
        <div className="header">
          <div>
            <div className="greeting">Good morning,</div>
            <div className="name">{user.name}</div>
          </div>
          <div className="header-actions">
            <button
              className="reset-button"
              title="Clear saved data and start over from the sample day"
              onClick={handleResetDemoData}
            >
              Reset demo data
            </button>
            <button className="alert-toggle" onClick={() => setShowAlerts(!showAlerts)}>
              🚨
            </button>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="section">
            <h2 className="section-title">Active Alerts</h2>
            {alerts.map(alert => (
              <div key={alert.id} className="alert" style={{
                borderLeftColor: alert.severity === 'danger' ? COLORS.danger : alert.severity === 'warn' ? COLORS.warn : COLORS.info
              }}>
                <div className="alert-title">{alert.title}</div>
                {alert.subtitle && <div className="alert-subtitle">{alert.subtitle}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Today's Summary */}
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
                <div className="summary-number" style={{ color: COLORS.danger }}>
                  {missedCount}
                </div>
                <div className="summary-label">Missed</div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
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

        {/* Today's Doses */}
        <div className="card">
          <h3 className="card-title">Today's Doses</h3>
          {doses.slice(0, 5).map(dose => {
            const med = MEDICATIONS.find(m => m.id === dose.medicationId)
            const statusColors = {
              given: COLORS.success,
              upcoming: COLORS.textMuted,
              due: COLORS.warn,
              missed: COLORS.danger,
            }
            return (
              <div key={dose.id} className="dose-item">
                <div className="dose-info">
                  <div className="dose-time">{dose.time}</div>
                  <div>
                    <div className="dose-name">{med?.name}</div>
                    <div className="dose-details">{med?.dose}</div>
                  </div>
                </div>
                <div className="dose-status" style={{
                  borderColor: statusColors[dose.status as keyof typeof statusColors],
                  backgroundColor: statusColors[dose.status as keyof typeof statusColors] + '20'
                }}>
                  {dose.status.charAt(0).toUpperCase() + dose.status.slice(1)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Today's Tasks */}
        <div className="card">
          <h3 className="card-title">
            Today's Tasks ({tasks.filter(t => t.done).length}/{tasks.length})
          </h3>
          {tasks.map(task => (
            <div key={task.id} className="task-item">
              <div className="task-check" data-done={task.done}>
                {task.done ? '✓' : ''}
              </div>
              <div className="task-body">
                <div className={task.done ? 'task-title task-title-done' : 'task-title'}>
                  {task.title}
                </div>
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

        {/* Recent Care Log */}
        <div className="card">
          <h3 className="card-title">Recent Notes</h3>
          {careLog.slice(0, 3).map(entry => (
            <div key={entry.id} className="log-entry">
              <div className="log-header">
                <div className="log-time">{entry.timestamp.split('T')[1]?.slice(0, 5)}</div>
                <div className="log-author">{USERS[entry.author]?.name || 'Unknown'}</div>
                {entry.confidential && (
                  <div className="badge">Private</div>
                )}
              </div>
              <div className="log-text">{entry.text}</div>
            </div>
          ))}
        </div>

        {/* Who's On */}
        <div className="card">
          <h3 className="card-title">On Duty</h3>
          <div className="on-duty-info">
            <div className="on-duty-avatar">CA</div>
            <div>
              <div className="on-duty-name">Catina</div>
              <div className="on-duty-time">8:00 AM – 6:00 PM</div>
            </div>
          </div>
        </div>

        {/* Log Dose Modal */}
        <LogDoseModal
          isOpen={isLogDoseOpen}
          onClose={() => setIsLogDoseOpen(false)}
          onSubmit={handleLogDose}
        />

        {/* Add Note Modal */}
        <AddNoteModal
          isOpen={isAddNoteOpen}
          onClose={() => setIsAddNoteOpen(false)}
          onSubmit={handleAddNote}
        />

        {/* Task Done Modal */}
        <TaskDoneModal
          isOpen={isTaskDoneOpen}
          onClose={() => setIsTaskDoneOpen(false)}
          onSubmit={handleTaskDone}
          tasks={tasks}
        />
      </div>
    </div>
  )
}

export default App
