import { USERS } from 'shared/data';
import { useCare } from '../state/CareProvider';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Primary caretaker · Admin',
  'co-caretaker': 'Personal Assistant',
  professional: 'Caregiver, CNA',
  recipient: 'Care recipient',
  network: 'Family',
};

/**
 * Switches which person's view the app is showing.
 *
 * A demo control, not a product feature — in the real app your role comes from
 * who you signed in as. It exists because what each role can see is the point
 * of the product, and that is impossible to show from a single fixed account.
 */
export function RoleSwitcher() {
  const { currentUser, setCurrentUser } = useCare();
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
          </option>
        ))}
      </select>
    </label>
  );
}
