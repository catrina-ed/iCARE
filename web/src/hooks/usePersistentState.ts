import { useEffect, useState } from 'react';

const PREFIX = 'icare:v1:';

/**
 * useState that mirrors its value into localStorage.
 *
 * Falls back to `seed` whenever storage is unavailable (private windows,
 * blocked site data) or holds something we can't parse, so the dashboard
 * always renders rather than throwing on a bad stored value.
 */
export function usePersistentState<T>(key: string, seed: T) {
  const storageKey = PREFIX + key;

  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored === null ? seed : (JSON.parse(stored) as T);
    } catch {
      return seed;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — keep working in memory for this session.
    }
  }, [storageKey, value]);

  return [value, setValue] as const;
}

/** Clear everything iCare has stored and reload back to the seed data. */
export function resetPersistedState() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
