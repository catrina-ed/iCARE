import { COLORS } from 'shared/theme';
import { USERS } from 'shared/data';
import type { ShoppingItem } from 'shared/types';
import { useCare } from '../state/CareProvider';

const CATEGORY_EMOJI: Record<ShoppingItem['category'], string> = {
  groceries: '🥬',
  toiletries: '🧼',
  medical: '🩹',
  household: '🏠',
};

export function Supplies() {
  const { shopping, currentUser, claimItem, purchaseItem } = useCare();

  const needed = shopping.filter(i => i.status === 'needed');
  const assigned = shopping.filter(i => i.status === 'assigned');
  const purchased = shopping.filter(i => i.status === 'purchased');

  const row = (item: ShoppingItem) => (
    <div key={item.id} className="supply-item">
      <span className="supply-emoji">{CATEGORY_EMOJI[item.category]}</span>
      <div className="supply-body">
        <div className={item.status === 'purchased' ? 'supply-name supply-name-done' : 'supply-name'}>
          {item.name}
        </div>
        <div className="supply-meta">
          {item.category}
          {item.recurring && ` · every ${item.recurringInterval} days`}
          {item.assignedTo && ` · ${USERS[item.assignedTo]?.name ?? item.assignedTo}`}
        </div>
      </div>
      {item.status === 'needed' && (
        <button className="supply-btn" onClick={() => claimItem(item.id)}>I'll get it</button>
      )}
      {item.status === 'assigned' && (
        <button
          className="supply-btn"
          style={{ borderColor: COLORS.primary, color: COLORS.primary }}
          onClick={() => purchaseItem(item.id)}
        >
          Got it
        </button>
      )}
      {item.status === 'purchased' && <span className="supply-done">✓</span>}
    </div>
  );

  return (
    <>
      <div className="header">
        <div>
          <div className="greeting">Supplies</div>
          <div className="name">{needed.length} needed</div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Needed ({needed.length})</h3>
        {needed.length === 0
          ? <div className="empty-state">Nothing needed right now.</div>
          : needed.map(row)}
      </div>

      {assigned.length > 0 && (
        <div className="card">
          <h3 className="card-title">Someone's Getting These ({assigned.length})</h3>
          {assigned.map(row)}
        </div>
      )}

      {purchased.length > 0 && (
        <div className="card">
          <h3 className="card-title">Purchased ({purchased.length})</h3>
          {purchased.map(row)}
        </div>
      )}

      <div className="supplies-hint">
        Claiming an item tells the rest of the care team you have it, so nobody
        buys it twice. Signed in as {USERS[currentUser]?.name ?? currentUser}.
      </div>
    </>
  );
}
