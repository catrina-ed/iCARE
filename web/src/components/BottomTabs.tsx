import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/',          label: 'Home',     icon: '🏠' },
  { to: '/meds',      label: 'Meds',     icon: '💊' },
  { to: '/calendar',  label: 'Calendar', icon: '📅' },
  { to: '/notes',     label: 'Notes',    icon: '📝' },
  { to: '/supplies',  label: 'Supplies', icon: '🛒' },
];

export function BottomTabs() {
  return (
    <nav className="tab-bar">
      {TABS.map(tab => (
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
    </nav>
  );
}
