import { USERS } from 'shared/data';
import { useCare } from '../state/CareProvider';

const ROLE_LABEL: Record<string, string> = {
  'master-admin': 'Primary caretaker',
  admin: 'Admin',
  pa: 'Personal Assistant',
  family: 'Family',
  recipient: 'Care recipient',
};

/**
 * Switches which person's view the app is showing.
 *
 * A demo control, not a product feature — in the real app your role comes from
 * who you signed in as. It exists because what each role can see is the point
 * of the product, and that is impossible to show from a single fixed account.
 */
export function RoleSwitcher() {
  const { currentUser, setCurrentUser, adminIds } = useCare();
  const ids = Object.keys(USERS);

  return (
    <label className="role-switcher">
      <span className="role-switcher-label">Viewing as</span>
      <select
        className="role-switcher-select"
        value={currentUser}
        onChange={(e) => setCurrentUser(e.target.value)}
      >
        {ids.map(id => (
          <option key={id} value={id}>
            {USERS[id].name} — {ROLE_LABEL[USERS[id].role] ?? USERS[id].role}
            {adminIds.includes(id) && USERS[id].role !== 'master-admin' ? ' · Admin' : ''}
          </option>
        ))}
      </select>
    </label>
  );
}
