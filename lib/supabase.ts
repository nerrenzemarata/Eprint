import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

// Lazy — only created on first use, not at module load time.
// This prevents build failures when env vars aren't available during static analysis.
export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
    _client = createClient(url, key);
  }
  return _client;
}
