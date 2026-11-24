import { createClient } from '@supabase/supabase-js';
export const sb = createClient(
  process.env.REACT_APP_SUPABASE_URL || 'http://localhost',
  process.env.REACT_APP_SUPABASE_ANON_KEY || 'missing'
);
