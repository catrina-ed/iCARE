import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/**
 * True once the project is configured. The app falls back to local mock data
 * when it is not, so a missing .env.local leaves the dashboard working instead
 * of rendering an error page.
 */
export const isSupabaseConfigured = Boolean(url && publishableKey);

/**
 * Null until configured — every call site has to decide what to do without a
 * backend, which is what keeps the mock-data path honest.
 *
 * The publishable key is meant to ship in the bundle; access is enforced by
 * row-level security in the database, not by hiding this value.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, publishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Magic links come back with the session in the URL fragment.
        detectSessionInUrl: true,
      },
    })
  : null;
