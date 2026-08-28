import { useState } from 'react';
import { COLORS } from 'shared/theme';
import { USERS, GAIL } from 'shared/data';
import type { CareLogTag } from 'shared/types';
import { useCare } from '../state/CareProvider';

const TAGS: CareLogTag[] = ['general', 'meds', 'health', 'mood', 'nutrition', 'mobility', 'sleep'];

const TAG_COLOUR: Record<string, string> = {
  general: COLORS.textMute,
  meds: COLORS.primary,
  health: COLORS.coral,
  mood: COLORS.plum,
  nutrition: COLORS.amber,
  mobility: COLORS.primary,
  sleep: COLORS.plum,
};

function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function CareLog() {
  const { careLog, currentUser, isAdmin, addNote } = useCare();

  const [text, setText] = useState('');
  const [tag, setTag] = useState<CareLogTag>('general');
  const [confidential, setConfidential] = useState(false);
  const [filter, setFilter] = useState<CareLogTag | 'all' | 'confidential' | 'mine'>('all');
  const [justPosted, setJustPosted] = useState<string | null>(null);

  const me = USERS[currentUser];

  const post = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addNote(trimmed, tag, confidential);
    setText('');
    setTag('general');
    setConfidential(false);
    // The newest entry is prepended, so flagging by timestamp is enough to
    // highlight it briefly without threading an id back out of the provider.
    setJustPosted(trimmed);
    setTimeout(() => setJustPosted(null), 1800);
  };

  const visible = careLog.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'confidential') return e.confidential;
    if (filter === 'mine') return e.author === currentUser;
    return e.tag === filter;
  });

  return (
    <>
      <div className="header">
        <div>
          <div className="greeting">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} · {careLog.length} note{careLog.length === 1 ? '' : 's'}
          </div>
          <div className="name">Care log</div>
        </div>
      </div>

      {/* Compose. Posting prepends a real entry — this is the write path. */}
      <div className="card compose">
        <div className="compose-top">
          <div className="recent-avatar">{me?.initials ?? '·'}</div>
          <textarea
            className="compose-input"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); post(); }
            }}
            placeholder={confidential
              ? 'Confidential note — only the primary caretaker will see this.'
              : `Share an observation, mood, or update about ${GAIL.name}…`}
          />
        </div>

        <div className="compose-tags">
          {TAGS.map(t => (
            <button key={t} className="tag-chip" data-on={tag === t} onClick={() => setTag(t)}>
              {t}
            </button>
          ))}
        </div>

        <div className="compose-actions">
          <button
            className="conf-toggle"
            data-on={confidential}
            onClick={() => setConfidential(!confidential)}
            title={confidential ? 'Only admins will see this' : 'Visible to the whole circle'}
          >
            {confidential ? '🔒 Confidential' : '🔓'}
          </button>
          <div style={{ flex: 1 }} />
          <button className="compose-post" disabled={!text.trim()} onClick={post}>Post</button>
        </div>
      </div>

      <div className="filter-row">
        {(['all', 'confidential', 'mine', ...TAGS] as const).map(f => (
          <button key={f} className="filter-chip" data-active={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'mine' ? 'Mine' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty-panel">
          <div className="empty-panel-icon">📝</div>
          <div className="empty-panel-title">No notes here yet</div>
          <div className="empty-panel-body">
            The log is how the next person knows what happened. One line is enough —
            what she ate, how she slept, what felt off.
          </div>
        </div>
      ) : visible.map(entry => (
        <div key={entry.id} className="card log-card" data-conf={entry.confidential}
          data-fresh={justPosted === entry.text}>
          <div className="log-head">
            <div className="recent-avatar">{USERS[entry.author]?.initials ?? '·'}</div>
            <div className="log-head-body">
              <div className="recent-name">{USERS[entry.author]?.name ?? entry.author}</div>
              <div className="log-head-sub">
                {USERS[entry.author]?.relationship} · {when(entry.timestamp)}
              </div>
            </div>
            <span className="log-tag" style={{
              color: TAG_COLOUR[entry.tag],
              backgroundColor: TAG_COLOUR[entry.tag] + '24',
            }}>{entry.tag}</span>
            {entry.confidential && <span className="log-conf">🔒 Conf.</span>}
          </div>
          <div className="log-text">{entry.text}</div>
        </div>
      ))}

      {isAdmin && (
        <div className="primary-view-note">
          <span className="primary-view-icon">🛡</span>
          <span><strong>Primary view.</strong> You can see confidential entries from any caretaker.</span>
        </div>
      )}
    </>
  );
}
