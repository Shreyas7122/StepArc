---
name: Supabase Migration Plan
description: User plans to add Supabase for multi-device sync & user auth
type: project
---

Shreyas wants to add Supabase (free tier) to replace localStorage for multi-device data sync and user accounts.

**Current state:** All data (food_logs, workout_logs, cardio_logs, steps, userProfile) lives in localStorage, auto-resets each day.

**Planned migration:**
1. Create Supabase project → get `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
2. Add `@supabase/supabase-js` npm package
3. Create `src/supabase.js` client
4. Tables needed: `profiles` (age, height_cm, weight_kg), `daily_logs` (date, food_logs jsonb, workout_logs jsonb, cardio_logs jsonb, steps int)
5. Replace localStorage reads/writes in `App.jsx` with Supabase SDK calls
6. Add Google Auth via Supabase Auth (optional first step)

**Status:** Not yet started as of 2026-05-17. Env vars already documented in `.env.example`.

**How to apply:** When Shreyas asks about Supabase, reference this plan. The localStorage → Supabase refactor mostly happens in `App.jsx` (the `loadWithReset` function and `useEffect` persistence hooks).
