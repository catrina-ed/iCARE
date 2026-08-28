import { NavLink } from 'react-router-dom';
import { GAIL, USERS } from 'shared/data';

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
    ],
  },
];

export function BottomTabs() {
  const user = USERS.trina;

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
          <div className="nav-profile-role">{GAIL.name}'s circle</div>
        </div>
      </div>

      {GROUPS.map(group => (
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
