import { useEffect, useState } from 'react';

const KEY = 'icare:v1:view';

/**
 * Switches the desktop presentation between an ordinary web layout and a phone
 * frame. Exists for demoing on a laptop; hidden on real phones by CSS, where
 * there is nothing to choose between.
 */
export function ViewToggle() {
  const [phone, setPhone] = useState(() => {
    try {
      return localStorage.getItem(KEY) === 'phone';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.dataset.view = phone ? 'phone' : 'web';
    try {
      localStorage.setItem(KEY, phone ? 'phone' : 'web');
    } catch {
      // Preference simply does not persist if storage is unavailable.
    }
  }, [phone]);

  return (
    <button className="view-toggle" onClick={() => setPhone(!phone)}>
      {phone ? 'Web view' : 'Phone view'}
    </button>
  );
}
