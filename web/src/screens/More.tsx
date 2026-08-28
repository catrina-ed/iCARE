import { Link } from 'react-router-dom';
import { APPOINTMENTS, MEDICATIONS } from 'shared/data';
import { useCare } from '../state/CareProvider';

/**
 * Everything that does not earn a tab.
 *
 * The dashed "coming later" cards are deliberately inert rather than absent —
 * an empty space reads as something missing, a labelled placeholder reads as
 * something planned.
 */
export function More() {
  const { careLog, shopping, isAdmin, role } = useCare();
  const isRecipient = role === 'recipient';

  const refills = MEDICATIONS.filter(m => m.lowStock || (m.refillDue ?? 99) <= 10).length;
  const needed = shopping.filter(i => i.status === 'needed').length;

  const live = [
    {
      to: '/calendar', icon: '📅', label: 'Calendar',
      sub: `${APPOINTMENTS.length} appointments this week`,
    },
    ...(isRecipient ? [] : [{
      to: '/meds', icon: '💊', label: 'Medications & refills',
      sub: refills ? `${refills} refill${refills > 1 ? 's' : ''} to arrange` : 'All supplies stocked',
    }]),
    ...(isRecipient ? [] : [{
      to: '/notes', icon: '📝', label: 'Care log',
      sub: `${careLog.length} entries · newest today`,
    }]),
    ...(isRecipient ? [] : [{
      to: '/supplies', icon: '🛒', label: 'Supplies',
      sub: needed ? `${needed} needed` : 'Nothing needed',
    }]),
    ...(isAdmin ? [{
      to: '/team', icon: '👥', label: 'Care circle',
      sub: 'Roles and who can see what',
    }] : []),
  ];

  const later = [
    { icon: '🧾', label: 'Bills', hide: isRecipient },
    { icon: '❤️', label: 'Family journal', hide: isRecipient },
    { icon: '🔄', label: 'Handoff summary', hide: false },
    { icon: '🛡', label: 'Emergency medical card', hide: false },
    { icon: '⚙️', label: 'Settings & roles', hide: false },
  ].filter(i => !i.hide);

  return (
    <>
      <div className="header">
        <div>
          <div className="greeting">More</div>
          <div className="name">Everything else</div>
        </div>
      </div>

      <div className="card">
        {live.map(item => (
          <Link key={item.to} to={item.to} className="more-row">
            <div className="more-icon">{item.icon}</div>
            <div className="more-body">
              <div className="more-label">{item.label}</div>
              <div className="more-sub">{item.sub}</div>
            </div>
            <div className="more-chev">›</div>
          </Link>
        ))}
      </div>

      <div className="later-head">
        <span>Coming later</span>
        <div className="later-rule" />
        <span>Not built yet</span>
      </div>

      <div className="later-grid">
        {later.map(item => (
          <div key={item.label} className="later-card">
            <span className="later-icon">{item.icon}</span>
            <span className="later-label">{item.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
