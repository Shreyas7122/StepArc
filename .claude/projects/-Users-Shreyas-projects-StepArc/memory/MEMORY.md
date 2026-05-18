# Memory Index

This file indexes all memory files saved for the StepArc project.

## Entries

### project_stack.md
- **Name:** StepArc Tech Stack & Architecture
- **Description:** Frontend (React/Vite), FastAPI backend, Gemini AI, Arena Fitness design system, deployment targets
- **Type:** project
- **File:** `project_stack.md`
- **Summary:** Core tech stack reference — React 19 + Vite (Vercel), FastAPI backend (Railway/Render), Gemini 2.5 Flash AI, Arena Fitness design system (deep purple + gold), localStorage data layer with Capacitor for Android. Key entrypoint is `./start.sh`.

### project_supabase_plan.md
- **Name:** Supabase Migration Plan
- **Description:** User plans to add Supabase for multi-device sync & user auth
- **Type:** project
- **File:** `project_supabase_plan.md`
- **Summary:** Planned migration from localStorage to Supabase (free tier) for multi-device sync and user accounts. Not yet started as of 2026-05-17. Refactor will mainly touch `App.jsx` (`loadWithReset` and `useEffect` persistence hooks). Tables: `profiles` and `daily_logs`.
