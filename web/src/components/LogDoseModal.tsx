import { useState } from 'react';
import { MEDICATIONS } from 'shared/data';
import { COLORS } from 'shared/theme';

interface LogDoseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (medicationId: string, time: string, notes: string) => void;
}

export function LogDoseModal({ isOpen, onClose, onSubmit }: LogDoseModalProps) {
  const [selectedMedId, setSelectedMedId] = useState<string>('');
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedId) {
      alert('Please select a medication');
      return;
    }

    setSubmitting(true);
    try {
      onSubmit(selectedMedId, time, notes);
      // Reset form
      setSelectedMedId('');
      setTime(new Date().toTimeString().slice(0, 5));
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
          <h2 style={styles.title}>Log Dose</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Medication Select */}
          <div style={styles.field}>
            <label style={styles.label}>Medication</label>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              style={styles.select}
              disabled={submitting}
            >
              <option value="">Select a medication...</option>
              {MEDICATIONS.map(med => (
                <option key={med.id} value={med.id}>
                  {med.name} - {med.dose}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div style={styles.field}>
            <label style={styles.label}>Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={styles.input}
              disabled={submitting}
              required
            />
          </div>

          {/* Notes */}
          <div style={styles.field}>
            <label style={styles.label}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this dose..."
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
              disabled={submitting || !selectedMedId}
            >
              {submitting ? 'Logging...' : 'Log Dose'}
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
  select: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    fontFamily: 'inherit',
  },
  input: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    fontFamily: 'inherit',
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
};
