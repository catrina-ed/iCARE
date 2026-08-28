import { useState } from 'react';
import { COLORS } from 'shared/theme';
import { USERS } from 'shared/data';
import type { CareTask } from 'shared/types';

interface TaskDoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskId: string, notes: string) => void;
  tasks: CareTask[];
}

const CATEGORY_EMOJI: Record<CareTask['category'], string> = {
  'personal-care': '🛁',
  household: '🏠',
  medical: '🩺',
  errand: '🚗',
  social: '💬',
};

export function TaskDoneModal({ isOpen, onClose, onSubmit, tasks }: TaskDoneModalProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const openTasks = tasks.filter(t => !t.done);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) {
      alert('Please select a task');
      return;
    }

    setSubmitting(true);
    try {
      onSubmit(selectedTaskId, notes);
      // Reset form
      setSelectedTaskId('');
      setNotes('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Task Done</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {openTasks.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>✓</div>
            <div style={styles.emptyText}>Everything on today's list is done.</div>
            <button type="button" onClick={onClose} style={styles.submitBtn}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Task Select */}
            <div style={styles.field}>
              <label style={styles.label}>Which task?</label>
              <div style={styles.taskList}>
                {openTasks.map(task => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setSelectedTaskId(task.id)}
                    style={{
                      ...styles.taskButton,
                      ...(selectedTaskId === task.id ? styles.taskButtonActive : {}),
                    }}
                    disabled={submitting}
                  >
                    <span style={styles.taskEmoji}>{CATEGORY_EMOJI[task.category]}</span>
                    <span style={styles.taskInfo}>
                      <span style={styles.taskTitle}>{task.title}</span>
                      <span style={styles.taskMeta}>
                        {task.dueTime}
                        {task.assignedTo && ` · ${USERS[task.assignedTo]?.name ?? task.assignedTo}`}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={styles.field}>
              <label style={styles.label}>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything the next caretaker should know..."
                style={styles.textarea}
                disabled={submitting}
              />
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
                disabled={submitting || !selectedTaskId}
              >
                {submitting ? 'Saving...' : 'Mark Done'}
              </button>
            </div>
          </form>
        )}
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
    maxHeight: '80vh',
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
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  taskButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'left',
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  taskButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(107, 159, 141, 0.12)',
  },
  taskEmoji: {
    fontSize: '20px',
  },
  taskInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  taskTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: COLORS.text,
  },
  taskMeta: {
    fontSize: '13px',
    color: COLORS.textMuted,
  },
  textarea: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    fontFamily: 'inherit',
    minHeight: '80px',
    resize: 'vertical',
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
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 0 8px',
  },
  emptyIcon: {
    fontSize: '32px',
    color: COLORS.primary,
  },
  emptyText: {
    fontSize: '15px',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: '8px',
  },
};
