import { useState } from 'react';
import { MEAL_SUGGESTIONS, GAIL } from 'shared/data';

/**
 * Meal ideas tied to the recipient's conditions and allergies.
 *
 * The suggestions are static reference content, not care data, so they are a
 * plain import. Only "eaten" is state, and it is intentionally session-only —
 * a tick here is a glance, not a record anyone should rely on.
 */
export function Nutrition() {
  const [eaten, setEaten] = useState<Record<string, boolean>>({});

  return (
    <>
      <div className="header">
        <div>
          <div className="greeting">Nutrition</div>
          <div className="name">Today's suggestions</div>
        </div>
      </div>

      <div className="info-strip">
        <span>💧</span>
        <span>
          Suggestions are tailored to {GAIL.name}'s conditions and allergies.
          Adjust with her doctor as needed.
        </span>
      </div>

      {MEAL_SUGGESTIONS.map(meal => (
        <div key={meal.id} className="card meal-card">
          <div className="meal-icon">🍽</div>
          <div className="meal-body">
            <div className="meal-kicker">{meal.meal}</div>
            <div className="meal-dish">{meal.dish}</div>
            <div className="meal-why">{meal.why}</div>
          </div>
          <button
            className="meal-check"
            data-on={!!eaten[meal.id]}
            onClick={() => setEaten(s => ({ ...s, [meal.id]: !s[meal.id] }))}
            aria-label={eaten[meal.id] ? 'Mark not eaten' : 'Mark eaten'}
          >
            {eaten[meal.id] ? '✓' : ''}
          </button>
        </div>
      ))}

      <div className="hydration">
        <span>💧</span>
        <span>Reminder: aim for six glasses of water today.</span>
      </div>
    </>
  );
}
