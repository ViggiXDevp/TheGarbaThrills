import { createClient } from '@supabase/supabase-js';

// The service role key is used here because this only ever runs on the
// server. It must never be exposed to the frontend.
export const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

export const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'garbathrills-photos';
