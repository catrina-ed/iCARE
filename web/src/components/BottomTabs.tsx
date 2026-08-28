import { NavLink } from 'react-router-dom';
import { GAIL, USERS } from 'shared/data';
import { useCare } from '../state/CareProvider';

/**
 * One component, two shapes: a bottom tab bar on phones and a grouped sidebar
 * on desktop. The group labels and profile block are desktop-only and hidden
 * by CSS rather than by a second component, so the two never drift apart.
 */
const GROUPS = [
  {
    label: 'Care',
    tabs: [
      { to: '/',         label: 'Home',     icon: '🏠' },
      { to: '/meds',     label: 'Meds',     icon: '💊' },
      { to: '/calendar', label: 'Calendar', icon: '📅' },
    ],
  },
  {
    label: `For ${GAIL.nickname || GAIL.name}`,
    tabs: [
      { to: '/notes',    label: 'Notes',    icon: '📝' },
      { to: '/supplies', label: 'Supplies', icon: '🛒' },
      { to: '/team',     label: 'Circle',   icon: '👥' },
    ],
  },
];

/** Gail sees her own day, not the coordination machinery around it. */
const RECIPIENT_TABS = ['/', '/calendar'];

export function BottomTabs() {
  const { currentUser, role } = useCare();
  const user = USERS[currentUser] ?? USERS.trina;
  const groups = role === 'recipient'
    ? GROUPS.map(g => ({ ...g, tabs: g.tabs.filter(t => RECIPIENT_TABS.includes(t.to)) }))
        .filter(g => g.tabs.length > 0)
    : GROUPS;

  return (
    <nav className="tab-bar">
      <div className="nav-brand">
        <span className="nav-mark">♥</span>
        <span className="nav-wordmark">iCare</span>
      </div>

      <div className="nav-profile">
        <div className="nav-avatar">{user.initials}</div>
        <div className="nav-profile-text">
          <div className="nav-profile-name">{user.name}</div>
          <div className="nav-profile-role">
            {role === 'recipient' ? 'Your care' : `${GAIL.name}'s circle`}
          </div>
        </div>
      </div>

      {groups.map(group => (
        <div className="nav-group" key={group.label}>
          <div className="nav-group-label">{group.label}</div>
          {group.tabs.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) => isActive ? 'tab tab-active' : 'tab'}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
