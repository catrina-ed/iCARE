import { useState } from 'react';
import { COLORS } from 'shared/theme';
import { GAIL } from 'shared/data';

const CONNECTORS = [
  { id: 'watch',   icon: '⌚️', name: 'Apple Watch',        blurb: 'Steps, heart rate, and activity through the day.' },
  { id: 'glucose', icon: '🩸', name: 'Glucose monitor',     blurb: 'Continuous readings, synced automatically.' },
  { id: 'chart',   icon: '📄', name: 'Patient portal',      blurb: `Share care log notes with ${GAIL.name}'s doctors, both ways.` },
  { id: 'health',  icon: '❤️', name: 'Health app',          blurb: 'A combined view of sleep, activity, and vitals.' },
  { id: 'reading', icon: '📖', name: 'Daily reading',       blurb: 'A verse or devotional, read aloud on request.' },
  { id: 'games',   icon: '🎮', name: 'Games',               blurb: 'Word search, solitaire, and sudoku for downtime.' },
];

function Sparkline({ points, colour }: { points: number[]; colour: string }) {
  const max = Math.max(...points), min = Math.min(...points);
  const width = 260, height = 48;
  const path = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / (max - min || 1)) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none"
      style={{ display: 'block' }} aria-hidden="true">
      <polyline points={path} fill="none" stroke={colour} strokeWidth="2.4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Device and service integrations.
 *
 * Nothing here connects to anything — every reading below is invented. The
 * banner says so plainly, because a step count and a heart rate look live
 * enough that someone would otherwise leave believing this already reads from
 * a real watch.
 */
export function Connectors() {
  const [on, setOn] = useState<Record<string, boolean>>({ watch: true, glucose: true });

  return (
    <>
      <div className="header">
        <div>
          <div className="greeting">Connectors</div>
          <div className="name">Connected apps &amp; devices</div>
        </div>
      </div>

      <div className="sample-banner">
        <span>⚠️</span>
        <span>
          <strong>Sample data.</strong> Nothing here is connected yet — the readings
          below are illustrative, to show what a connected device would look like.
        </span>
      </div>

      {CONNECTORS.map(c => (
        <div key={c.id} className="card connector-card">
          <div className="connector-head">
            <div className="connector-icon">{c.icon}</div>
            <div className="connector-body">
              <div className="connector-name">{c.name}</div>
              <div className="connector-blurb">{on[c.id] ? 'Connected · sample feed' : c.blurb}</div>
            </div>
            <button
              className="switch"
              data-on={!!on[c.id]}
              onClick={() => setOn(s => ({ ...s, [c.id]: !s[c.id] }))}
              aria-label={`${on[c.id] ? 'Disconnect' : 'Connect'} ${c.name}`}
            >
              <span className="switch-knob" />
            </button>
          </div>

          {on[c.id] && c.id === 'watch' && (
            <div className="connector-panel">
              <div className="connector-stats">
                <div><div className="connector-big">2,600</div><div className="connector-small">steps today</div></div>
                <div><div className="connector-big">74</div><div className="connector-small">resting bpm</div></div>
              </div>
              <Sparkline points={[1200, 2400, 1800, 3100, 2000, 2600, 1400, 900]} colour={COLORS.primary} />
            </div>
          )}

          {on[c.id] && c.id === 'glucose' && (
            <div className="connector-panel">
              <div className="connector-stats">
                <div>
                  <div className="connector-big">92 <span className="connector-unit">mg/dL</span></div>
                  <div className="connector-small" style={{ color: COLORS.primary }}>in range</div>
                </div>
              </div>
              <Sparkline points={[96, 104, 118, 132, 121, 108, 99, 92]} colour={COLORS.amber} />
            </div>
          )}

          {on[c.id] && c.id === 'chart' && (
            <div className="connector-panel">
              <div className="connector-small" style={{ marginBottom: 10 }}>
                3 care log notes shared with the care team this month.
              </div>
              {['Mood note', 'Nutrition note', 'Mobility note'].map(n => (
                <div key={n} className="connector-line">📄 {n}</div>
              ))}
            </div>
          )}

          {on[c.id] && c.id === 'health' && (
            <div className="connector-panel connector-grid">
              <div><div className="connector-small">Sleep last night</div><div className="connector-mid">7h 40m</div></div>
              <div><div className="connector-small">Average heart rate</div><div className="connector-mid">78 bpm</div></div>
            </div>
          )}

          {on[c.id] && c.id === 'reading' && (
            <div className="connector-panel">
              <div className="connector-small" style={{ color: COLORS.plum, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                Today's reading
              </div>
              <div className="connector-verse">
                “This is the day which the Lord hath made; we will rejoice and be glad in it.”
              </div>
              <div className="connector-small" style={{ marginTop: 8 }}>Read aloud through voice mode</div>
            </div>
          )}

          {on[c.id] && c.id === 'games' && (
            <div className="connector-panel connector-games">
              {['Word search', 'Solitaire', 'Sudoku'].map(g => (
                <div key={g} className="connector-game">{g}</div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}
