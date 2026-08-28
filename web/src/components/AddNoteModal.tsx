import { useState } from 'react';
import { COLORS } from 'shared/theme';
import type { CareLogTag } from 'shared/types';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, tag: CareLogTag, confidential: boolean) => void;
}

const TAG_OPTIONS: { value: CareLogTag; label: string; emoji: string }[] = [
  { value: 'general', label: 'General', emoji: '📝' },
  { value: 'meds', label: 'Meds', emoji: '💊' },
  { value: 'health', label: 'Health', emoji: '🏥' },
  { value: 'mood', label: 'Mood', emoji: '😊' },
  { value: 'nutrition', label: 'Nutrition', emoji: '🍽️' },
  { value: 'mobility', label: 'Mobility', emoji: '🚶' },
  { value: 'sleep', label: 'Sleep', emoji: '😴' },
];

export function AddNoteModal({ isOpen, onClose, onSubmit }: AddNoteModalProps) {
  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState<CareLogTag>('general');
  const [confidential, setConfidential] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Please write a note');
      return;
    }

    setSubmitting(true);
    try {
      onSubmit(text, selectedTag, confidential);
      // Reset form
      setText('');
      setSelectedTag('general');
      setConfidential(false);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add Note</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Note Text */}
          <div style={styles.field}>
            <label style={styles.label}>What's happening?</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a note about Gail's care..."
              style={styles.textarea}
              disabled={submitting}
              autoFocus
            />
          </div>

          {/* Tag Selector */}
          <div style={styles.field}>
            <label style={styles.label}>Category</label>
            <div style={styles.tagGrid}>
              {TAG_OPTIONS.map(tag => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => setSelectedTag(tag.value)}
                  style={{
                    ...styles.tagButton,
                    ...(selectedTag === tag.value ? styles.tagButtonActive : {}),
                  }}
                  disabled={submitting}
                >
                  <span style={styles.tagEmoji}>{tag.emoji}</span>
                  <span style={styles.tagLabel}>{tag.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Confidential Toggle */}
          <div style={styles.field}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={confidential}
                onChange={(e) => setConfidential(e.target.checked)}
                disabled={submitting}
                style={styles.checkbox}
              />
              <span style={styles.checkboxText}>Mark as private (visible to admin only)</span>
            </label>
          </div>

          {/* Buttons */}
          <div style={styles.buttons}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelBtn}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitBtn}
              disabled={submitting || !text.trim()}
            >
              {submitting ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: '16px 16px 0 0',
    padding: '24px',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: COLORS.text,
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: COLORS.textMuted,
    cursor: 'pointer',
    padding: 0,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: COLORS.text,
  },
  textarea: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    fontFamily: 'inherit',
    minHeight: '100px',
    resize: 'vertical',
  },
  tagGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  tagButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: COLORS.bgAlt,
    border: `2px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    color: COLORS.text,
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  tagButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    color: COLORS.bg,
  },
  tagEmoji: {
    fontSize: '20px',
  },
  tagLabel: {
    fontSize: '12px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxText: {
    fontSize: '14px',
    color: COLORS.text,
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.bgAlt,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    color: COLORS.bg,
    border: 'none',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
