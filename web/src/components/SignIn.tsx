import { useState } from 'react';
import { COLORS } from 'shared/theme';
import { supabase } from '../lib/supabase';

/**
 * Magic-link sign-in. No password, because the people using this are on
 * phones and a forgotten password means a support call to Trina.
 */
export function SignIn() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email.trim()) return;

    setStatus('sending');
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        // Comes back to wherever the app is actually running, so the same
        // build works on localhost and on GitHub Pages.
        emailRedirectTo: window.location.origin + window.location.pathname,
      },
    });

    if (error) {
      setError(error.message);
      setStatus('idle');
    } else {
      setStatus('sent');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.mark}>♥</div>
        <h1 style={styles.title}>iCare</h1>
        <p style={styles.subtitle}>Caring for Mom, together.</p>

        {status === 'sent' ? (
          <div style={styles.sent}>
            <div style={styles.sentIcon}>✉️</div>
            <p style={styles.sentText}>
              Check your email. We sent a link to <strong>{email}</strong> — tap it on
              this phone and you'll be signed in.
            </p>
            <button style={styles.linkBtn} onClick={() => setStatus('idle')}>
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label} htmlFor="email">Your email</label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
              disabled={status === 'sending'}
              required
            />

            {error && <div style={styles.error}>{error}</div>}

            <button
              type="submit"
              style={styles.submit}
              disabled={status === 'sending' || !email.trim()}
            >
              {status === 'sending' ? 'Sending...' : 'Email me a link'}
            </button>

            <p style={styles.hint}>
              No password to remember. We'll email you a link that signs you in.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: COLORS.bg,
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    textAlign: 'center',
  },
  mark: {
    fontSize: '44px',
    color: COLORS.primary,
    lineHeight: 1,
    marginBottom: '16px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    color: COLORS.text,
    margin: 0,
  },
  subtitle: {
    fontSize: '16px',
    color: COLORS.textMuted,
    margin: '8px 0 40px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    textAlign: 'left',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.bgElevated,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    // 16px keeps iOS Safari from zooming the page when the field is focused.
    padding: '16px',
    fontSize: '16px',
    fontFamily: 'inherit',
    width: '100%',
  },
  submit: {
    backgroundColor: COLORS.primary,
    color: COLORS.bg,
    border: 'none',
    borderRadius: '10px',
    padding: '16px',
    fontSize: '17px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '4px',
  },
  hint: {
    fontSize: '13px',
    color: COLORS.textMuted,
    textAlign: 'center',
    margin: '4px 0 0',
    lineHeight: 1.5,
  },
  error: {
    fontSize: '14px',
    color: COLORS.danger,
    backgroundColor: 'rgba(232, 97, 79, 0.12)',
    border: `1px solid ${COLORS.danger}`,
    borderRadius: '8px',
    padding: '12px',
  },
  sent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  sentIcon: { fontSize: '40px' },
  sentText: {
    fontSize: '16px',
    color: COLORS.text,
    lineHeight: 1.6,
    margin: 0,
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: COLORS.primary,
    fontSize: '15px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '8px',
  },
};
