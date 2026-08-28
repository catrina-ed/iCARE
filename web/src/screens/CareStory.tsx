import { USERS, GAIL } from 'shared/data';
import { useCare } from '../state/CareProvider';

/**
 * The week as a story rather than a report — the thing a family would actually
 * want to read, and the one screen built to be shared outward.
 *
 * Every number is derived from live state, so it moves when someone logs
 * something. A recap assembled from fixed copy would be the one screen that
 * quietly lies during a demo.
 */
export function CareStory() {
  const { doses, careLog, exercise, moments } = useCare();

  const given = doses.filter(d => d.status === 'given').length;
  const total = doses.length || 1;
  const adherence = Math.round((given / total) * 100);
  const minutes = exercise.reduce((sum, e) => sum + e.minutes, 0);

  const highlight = careLog.find(e => !e.confidential) ?? careLog[0];
  const moodNote = careLog.find(e => e.tag === 'mood');
  const recentMoments = moments.slice(0, 2);

  const nothingYet = doses.length === 0 && careLog.length === 0 && exercise.length === 0;

  if (nothingYet) {
    return (
      <>
        <div className="header">
          <div>
            <div className="greeting">Care story</div>
            <div className="name">{GAIL.name}'s week, in review</div>
          </div>
        </div>
        <div className="empty-panel">
          <div className="empty-panel-icon">✨</div>
          <div className="empty-panel-title">No story yet</div>
          <div className="empty-panel-body">
            Come back after a few days of logging doses, notes, and moments —
            iCare will turn them into {GAIL.name}'s week, in review.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="header">
        <div>
          <div className="greeting">Care story</div>
          <div className="name">{GAIL.name}'s week, in review</div>
        </div>
      </div>

      <div className="card story-hero">
        <div className="story-kicker">The week in one line</div>
        <div className="story-line">
          A steady week — {adherence}% of doses on time, {minutes} minutes of
          movement, and a few good laughs along the way.
        </div>
      </div>

      <div className="story-tiles">
        <div className="card story-tile">
          <div className="story-tile-icon">💊</div>
          <div className="story-tile-big">{adherence}%</div>
          <div className="story-tile-label">Meds on time</div>
        </div>
        <div className="card story-tile">
          <div className="story-tile-icon">🚶</div>
          <div className="story-tile-big">{minutes}m</div>
          <div className="story-tile-label">Moved this week</div>
        </div>
        <div className="card story-tile">
          <div className="story-tile-icon">📷</div>
          <div className="story-tile-big">{moments.length}</div>
          <div className="story-tile-label">Moments shared</div>
        </div>
      </div>

      {highlight && (
        <>
          <div className="section"><h2 className="section-title">Highlight</h2></div>
          <div className="card">
            <div className="log-head">
              <div className="recent-avatar">{USERS[highlight.author]?.initials ?? '·'}</div>
              <div className="log-head-body">
                <div className="recent-name">{USERS[highlight.author]?.name ?? highlight.author}</div>
              </div>
            </div>
            <div className="log-text">{highlight.text}</div>
          </div>
        </>
      )}

      {recentMoments.length > 0 && (
        <>
          <div className="section"><h2 className="section-title">Moments</h2></div>
          {recentMoments.map(m => (
            <div key={m.id} className="card story-moment">
              {m.hasPhoto && <div className="story-moment-photo">📷</div>}
              <div className="log-text">{m.caption}</div>
            </div>
          ))}
        </>
      )}

      {moodNote && (
        <div className="story-mood">
          <span>❤️</span>
          <span>Mood held steady this week, with one gentler day noted quietly for the primary caretaker.</span>
        </div>
      )}

      <button className="story-share">Share with family</button>
    </>
  );
}
