import { createClient } from '@supabase/supabase-js';

// Server-side only — uses service role key so it can bypass RLS
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
