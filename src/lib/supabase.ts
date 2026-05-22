import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Supabase env vars missing. Define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local (local) or in the Cloudflare Pages env vars (production).',
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'avance-helpdesk-auth',
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});
