import { useState } from 'react';
import { USERS, GAIL } from 'shared/data';
import { useCare } from '../state/CareProvider';

function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const on = new Date(d); on.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - on.getTime()) / 86400000);
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (diff === 0) return `Today · ${time}`;
  if (diff === 1) return `Yesterday · ${time}`;
  return `${d.toLocaleDateString(undefined, { weekday: 'short' })} · ${time}`;
}

/**
 * The lighter feed — photos, jokes, small wins. Explicitly separate from the
 * care log so that clinical notes and "she beat me at cards" never sit in the
 * same list.
 */
export function Moments() {
  const { moments, currentUser, shareMoment } = useCare();
  const [caption, setCaption] = useState('');
  const [to, setTo] = useState('all');
  const [withPhoto, setWithPhoto] = useState(false);

  const others = Object.keys(USERS).filter(id => id !== currentUser);

  const share = () => {
    const trimmed = caption.trim();
    if (!trimmed) return;
    shareMoment(trimmed, to, withPhoto);
    setCaption('');
    setTo('all');
    setWithPhoto(false);
  };

  return (
    <>
      <div className="header">
        <div>
          <div className="greeting">Moments</div>
          <div className="name">Fun &amp; everyday</div>
          <div className="greeting-status">
            The lighter side — photos, jokes, small wins. Not the clinical log.
          </div>
        </div>
      </div>

      <div className="card compose">
        <div className="compose-top">
          <button
            className="photo-slot"
            data-on={withPhoto}
            onClick={() => setWithPhoto(!withPhoto)}
            title={withPhoto ? 'Remove photo' : 'Add a photo'}
          >
            {withPhoto ? '🖼' : '＋'}
            <span className="photo-slot-label">{withPhoto ? 'Photo' : 'Add photo'}</span>
          </button>
          <textarea
            className="compose-input"
            rows={3}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caught a fun moment, a joke, a small win…"
          />
        </div>

        <div className="compose-actions" style={{ flexWrap: 'wrap' }}>
          <span className="send-to-label">Send to</span>
          <button className="tag-chip" data-on={to === 'all'} onClick={() => setTo('all')}>Everyone</button>
          {others.map(id => (
            <button key={id} className="tag-chip" data-on={to === id} onClick={() => setTo(id)}>
              {USERS[id]?.name}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button className="compose-post" disabled={!caption.trim()} onClick={share}>Share</button>
        </div>
      </div>

      {moments.length === 0 ? (
        <div className="empty-panel">
          <div className="empty-panel-icon">📷</div>
          <div className="empty-panel-title">No moments yet</div>
          <div className="empty-panel-body">
            Catch {GAIL.name} laughing, a joke she tells, a small win — share it here
            for the whole circle to see.
          </div>
        </div>
      ) : moments.map(moment => {
        const by = USERS[moment.by];
        const audience = moment.to === 'all' ? 'Everyone' : `For ${USERS[moment.to]?.name ?? moment.to}`;
        return (
          <div key={moment.id} className="card moment-card">
            {moment.hasPhoto && (
              // A styled placeholder rather than a real upload: photos of a real
              // family have no business in a public demo, and a data URL per
              // photo would exhaust local storage in a handful of posts.
              <div className="moment-photo">
                <span>📷</span>
                <span className="moment-photo-label">Photo</span>
              </div>
            )}
            <div className="moment-body">
              <div className="log-head">
                <div className="recent-avatar">{by?.initials ?? '·'}</div>
                <div className="log-head-body">
                  <div className="recent-name">{by?.name ?? moment.by}</div>
                  <div className="log-head-sub">{when(moment.timestamp)}</div>
                </div>
                <span className="moment-audience">{audience}</span>
              </div>
              <div className="log-text">{moment.caption}</div>
            </div>
          </div>
        );
      })}
    </>
  );
}
