import { MockCareProvider } from './MockCareProvider';
import { isSupabaseConfigured } from '../lib/supabase';

export { useCare } from './careContext';
export type { CareState } from './careContext';

/**
 * Chooses the data source.
 *
 * With no Supabase project configured the app runs entirely on demo data, which
 * is what the public demo deploy does. SupabaseCareProvider slots in here once
 * it exists; nothing in screens/ changes when it does.
 */
export function CareProvider({ children }: { children: React.ReactNode }) {
  if (isSupabaseConfigured) {
    // Falls through to the demo data until SupabaseCareProvider lands, so the
    // app stays usable rather than half-wired while that is built.
    return <MockCareProvider>{children}</MockCareProvider>;
  }
  return <MockCareProvider>{children}</MockCareProvider>;
}
