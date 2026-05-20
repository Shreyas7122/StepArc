import { supabase } from './supabase';

const today = () => new Date().toISOString().slice(0, 10);

export const DEFAULT_SETTINGS = {
  // Body stats
  gender:        'male',
  age:           20,
  height_cm:     175,
  weight_kg:     78,
  // Goal type drives calorie/macro targets via Mifflin-St Jeor
  goal_type:     'maintenance',
  step_goal:     10000,
  // Stored as cache so legacy reads still work; always overwritten on save
  calorie_goal:  2870,
  protein_goal:  200,
  carbs_goal:    300,
  fats_goal:     80,
  diet_plan:     { meals: [] },
  workout_plan:  { days: [] },
};
// SQL migration (run once in Supabase SQL editor):
// ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS gender text DEFAULT 'male';
// ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS goal_type text DEFAULT 'maintenance';

// ── localStorage helpers ──────────────────────────────────────────────────────
const lsSettingsKey = (userId) => `steparc_settings_${userId}`;
const lsLogsKey     = (userId) => `steparc_logs_${userId}_${today()}`;

const lsSet = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
};
const lsGet = (key) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (_) { return null; }
};

export function clearLocalCache(userId) {
  try {
    localStorage.removeItem(lsSettingsKey(userId));
    const prefix = `steparc_logs_${userId}_`;
    Object.keys(localStorage).filter(k => k.startsWith(prefix)).forEach(k => localStorage.removeItem(k));
  } catch (_) {}
}

// SQL to run in Supabase SQL Editor (one-time migration):
// ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS step_goal integer DEFAULT 10000;
// ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS diet_plan jsonb DEFAULT '{"meals":[]}'::jsonb;
// ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS workout_plan jsonb DEFAULT '{"days":[]}'::jsonb;
console.log(
  '[StepArc] MIGRATION — run this in Supabase SQL Editor if you have not already:\n' +
  "ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS step_goal integer DEFAULT 10000;\n" +
  "ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS diet_plan jsonb DEFAULT '{\"meals\":[]}'::jsonb;\n" +
  "ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS workout_plan jsonb DEFAULT '{\"days\":[]}'::jsonb;"
);

export async function testConnection() {
  const { error } = await supabase.from('user_settings').select('user_id').limit(1);
  if (error) {
    console.error('[StepArc] Supabase connection error:', error.message);
    return false;
  }
  console.log('[StepArc] Supabase connected ✓');
  return true;
}

export async function loadSettings(userId) {
  const { data } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (data) {
    // _persisted marks that this user has at least one saved row — never written to DB
    const merged = { ...DEFAULT_SETTINGS, ...data, _persisted: true };
    lsSet(lsSettingsKey(userId), merged);
    return merged;
  }
  // Supabase returned nothing — fall back to locally cached copy
  const cached = lsGet(lsSettingsKey(userId));
  return cached ?? { ...DEFAULT_SETTINGS };
}

export async function saveSettings(userId, settings) {
  // Persist locally first so reopening the app never loses data
  lsSet(lsSettingsKey(userId), { ...settings, _persisted: true });
  const {
    gender, goal_type,
    calorie_goal, protein_goal, carbs_goal, fats_goal,
    age, height_cm, weight_kg,
    step_goal, diet_plan, workout_plan,
  } = settings;
  const { error } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: userId,
        gender:       gender       ?? 'male',
        goal_type:    goal_type    ?? 'maintenance',
        calorie_goal, protein_goal, carbs_goal, fats_goal,
        age, height_cm, weight_kg,
        step_goal:    step_goal    ?? 10000,
        diet_plan:    diet_plan    ?? { meals: [] },
        workout_plan: workout_plan ?? { days: [] },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  if (error) console.error('[StepArc] saveSettings failed:', error.message);
}

export async function loadTodayLogs(userId) {
  const { data } = await supabase
    .from('daily_logs')
    .select('food_logs,workout_logs,cardio_logs,steps')
    .eq('user_id', userId)
    .eq('log_date', today())
    .maybeSingle();
  if (data) {
    lsSet(lsLogsKey(userId), data);
    return data;
  }
  // Fall back to locally cached today's logs
  const cached = lsGet(lsLogsKey(userId));
  return cached ?? { food_logs: [], workout_logs: [], cardio_logs: [], steps: 0 };
}

export async function saveTodayLogs(userId, logs) {
  // Persist locally first
  lsSet(lsLogsKey(userId), logs);
  const { error } = await supabase
    .from('daily_logs')
    .upsert(
      { user_id: userId, log_date: today(), ...logs, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,log_date' }
    );
  if (error) console.error('[StepArc] saveTodayLogs failed:', error.message);
}

export async function load7DayHistory(userId) {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  });
  const { data } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .in('log_date', dates)
    .order('log_date', { ascending: false });
  return dates.map(date => {
    const found = data?.find(d => d.log_date === date);
    return {
      date,
      food_logs:    found?.food_logs    ?? [],
      workout_logs: found?.workout_logs ?? [],
      cardio_logs:  found?.cardio_logs  ?? [],
      steps:        found?.steps        ?? 0,
    };
  });
}

export async function pruneOldLogs(userId) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  await supabase
    .from('daily_logs')
    .delete()
    .eq('user_id', userId)
    .lt('log_date', cutoff.toISOString().slice(0, 10));
}
