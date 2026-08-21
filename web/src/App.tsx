import { useState } from 'react'
import './App.css'
import { THEME, COLORS } from 'shared/theme'
import {
  GAIL, USERS, TODAYS_DOSES_MORNING, CARE_LOG,
  ALERTS_MORNING_CALM, ALERTS_MORNING_ALERT, MEDICATIONS,
} from 'shared/data'

function App() {
  const [showAlerts, setShowAlerts] = useState(false)
  const [currentUser] = useState('trina')

  const user = USERS[currentUser]
  const alerts = showAlerts ? ALERTS_MORNING_ALERT : ALERTS_MORNING_CALM
  const doses = TODAYS_DOSES_MORNING

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
          <button className="alert-toggle" onClick={() => setShowAlerts(!showAlerts)}>
            🚨
          </button>
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
            <button className="action-button">
              <div className="action-icon">💊</div>
              <div className="action-label">Log Dose</div>
            </button>
            <button className="action-button">
              <div className="action-icon">📝</div>
              <div className="action-label">Add Note</div>
            </button>
            <button className="action-button">
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

        {/* Recent Care Log */}
        <div className="card">
          <h3 className="card-title">Recent Notes</h3>
          {CARE_LOG.slice(0, 3).map(entry => (
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
      </div>
    </div>
  )
}

export default App
