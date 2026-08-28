import { useState } from 'react';
import { COLORS } from 'shared/theme';
import { USERS } from 'shared/data';
import type { CareLogTag } from 'shared/types';
import { useCare } from '../state/CareProvider';
import { AddNoteModal } from '../components/AddNoteModal';

const TAGS: (CareLogTag | 'all')[] = ['all', 'general', 'meds', 'health', 'mood', 'nutrition', 'mobility', 'sleep'];

const TAG_COLORS: Record<string, string> = {
  general: COLORS.textMuted,
  meds: COLORS.primary,
  health: COLORS.danger,
  mood: COLORS.warn,
  nutrition: COLORS.primary,
  mobility: COLORS.info,
  sleep: COLORS.info,
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function CareLog() {
  const { careLog, addNote } = useCare();
  const [filter, setFilter] = useState<CareLogTag | 'all'>('all');
  const [isOpen, setIsOpen] = useState(false);

  const entries = filter === 'all' ? careLog : careLog.filter(e => e.tag === filter);

  return (
    <>
      <div className="header">
        <div>
          <div className="greeting">Care Log</div>
          <div className="name">{careLog.length} notes</div>
        </div>
        <button className="alert-toggle" onClick={() => setIsOpen(true)} title="Add a note">➕</button>
      </div>

      <div className="filter-row">
        {TAGS.map(tag => (
          <button
            key={tag}
            className="filter-chip"
            data-active={filter === tag}
            onClick={() => setFilter(tag)}
          >
            {tag === 'all' ? 'All' : tag.charAt(0).toUpperCase() + tag.slice(1)}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="card">
          <div className="empty-state">No notes tagged “{filter}” yet.</div>
        </div>
      ) : (
        entries.map(entry => (
          <div key={entry.id} className="card log-card">
            <div className="log-header">
              <div className="log-time">{formatWhen(entry.timestamp)}</div>
              <div className="log-author">{USERS[entry.author]?.name ?? entry.author}</div>
              <span className="badge" style={{
                borderColor: TAG_COLORS[entry.tag] ?? COLORS.textMuted,
                color: TAG_COLORS[entry.tag] ?? COLORS.textMuted,
              }}>
                {entry.tag}
              </span>
              {entry.confidential && (
                <span className="badge" style={{ borderColor: COLORS.info, color: COLORS.info }}>
                  Private
                </span>
              )}
            </div>
            <div className="log-text">{entry.text}</div>
          </div>
        ))
      )}

      <AddNoteModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSubmit={addNote} />
    </>
  );
}
