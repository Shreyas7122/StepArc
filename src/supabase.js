import { createClient } from '@supabase/supabase-js';

console.log('[StepArc] VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('[StepArc] VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key',
);
