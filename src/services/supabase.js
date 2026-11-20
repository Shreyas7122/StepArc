import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key',
);
