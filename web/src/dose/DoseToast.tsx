import { COLORS } from 'shared/theme';
import { useDoseInteraction } from './doseInteraction';

/**
 * Undo affordance after a one-tap commit.
 *
 * The reason one tap is safe: nothing is confirmed up front, so the recovery
 * has to be obvious and last long enough to notice a mistake.
 */
export function DoseToast() {
  const { toast, undo } = useDoseInteraction();
  if (!toast) return null;

  return (
    <div className="dose-toast" role="status">
      <div className="dose-toast-mark">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke={COLORS.primaryInk} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5 10 17 19.5 7" />
        </svg>
      </div>
      <div className="dose-toast-body">
        <div className="dose-toast-text">{toast.text}</div>
        <div className="dose-toast-sub">{toast.sub}</div>
      </div>
      {toast.previous.length > 0 && (
        <button className="dose-toast-undo" onClick={undo}>Undo</button>
      )}
    </div>
  );
}
