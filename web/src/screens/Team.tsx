import { USERS, GAIL } from 'shared/data';
import { ADMIN_LIMIT } from 'shared/types';
import type { UserRole } from 'shared/types';
import { useCare } from '../state/CareProvider';

const ROLE_LABEL: Record<UserRole, string> = {
  'master-admin': 'Primary caretaker',
  admin: 'Admin',
  pa: 'Personal Assistant',
  family: 'Family',
  recipient: 'Care recipient',
};

const ROLE_BLURB: Record<UserRole, string> = {
  'master-admin': 'Sees everything, and is the only person who can grant admin.',
  admin: 'Sees confidential notes from any caretaker.',
  pa: 'Day-to-day care. Sees their own private notes, not other people’s.',
  family: 'Day-to-day care. Sees their own private notes, not other people’s.',
  recipient: 'Sees her own day: home and calendar only.',
};

export function Team() {
  const { currentUser, adminIds, adminSlotsLeft, isMasterAdmin, grantAdmin, revokeAdmin } = useCare();

  const ids = Object.keys(USERS);
  const eligible = (id: string) =>
    USERS[id].role !== 'recipient' && USERS[id].role !== 'master-admin';

  return (
    <>
      <div className="header">
        <div>
          <div className="greeting">Care circle</div>
          <div className="name">{GAIL.name}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">
          Admins
          <span className="card-count">{adminIds.length} of {ADMIN_LIMIT}</span>
        </h3>
        <p className="team-note">
          {isMasterAdmin
            ? adminSlotsLeft > 0
              ? `You can give admin to ${adminSlotsLeft} more ${adminSlotsLeft === 1 ? 'person' : 'people'}. Admins see confidential notes from everyone, so keep it small.`
              : `All ${ADMIN_LIMIT} admin places are taken. Remove someone before adding another.`
            : 'Only the primary caretaker can change who has admin.'}
        </p>
      </div>

      <div className="card">
        <h3 className="card-title">Everyone</h3>
        {ids.map(id => {
          const person = USERS[id];
          const holdsAdmin = adminIds.includes(id);
          const isMaster = person.role === 'master-admin';
          const canToggle = isMasterAdmin && eligible(id) && (holdsAdmin || adminSlotsLeft > 0);

          return (
            <div key={id} className="team-row">
              <div className="team-avatar">{person.initials}</div>
              <div className="team-body">
                <div className="team-name">
                  {person.name}
                  {id === currentUser && <span className="team-you">you</span>}
                </div>
                <div className="team-role">
                  {ROLE_LABEL[person.role]}
                  {holdsAdmin && !isMaster && ' · Admin'}
                </div>
                <div className="team-blurb">
                  {ROLE_BLURB[holdsAdmin && !isMaster ? 'admin' : person.role]}
                </div>
              </div>

              {isMaster ? (
                <span className="team-badge">Owner</span>
              ) : eligible(id) ? (
                <button
                  className="team-btn"
                  data-on={holdsAdmin}
                  disabled={!canToggle}
                  title={
                    !isMasterAdmin ? 'Only the primary caretaker can change admin'
                      : !holdsAdmin && adminSlotsLeft === 0 ? `Only ${ADMIN_LIMIT} admins allowed`
                      : undefined
                  }
                  onClick={() => holdsAdmin ? revokeAdmin(id) : grantAdmin(id)}
                >
                  {holdsAdmin ? 'Remove admin' : 'Make admin'}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
