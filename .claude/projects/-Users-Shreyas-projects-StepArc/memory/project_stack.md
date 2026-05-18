---
name: StepArc Tech Stack & Architecture
description: Frontend (React/Vite), FastAPI backend, Gemini AI, Arena Fitness design system, deployment targets
type: project
---

StepArc is a personal fitness tracker built by Shreyas. Tech stack:
- **Frontend**: React 19 + Vite, deployed to Vercel (free)
- **Backend**: FastAPI (Python), runs from `/backend/` dir, deploys to Railway/Render (free)
- **AI**: Google Gemini 2.5 Flash via `google-genai` SDK — API key in `.env` as `API_KEY`
- **Design**: Arena Fitness design system — deep purple (#1A0B2E) + gold (#FFB800) palette, Anton/Oswald/Inter fonts
- **Data**: localStorage (auto-resets daily) — Supabase integration planned for multi-device sync
- **Mobile**: Capacitor for Android packaging

**Why:** Useful files:
- `start.sh` — one command to run both frontend+backend locally
- `vercel.json` — Vercel frontend deployment config
- `backend/Procfile` — Railway/Render backend deployment
- `.env.example` — all env vars documented
- Backend must be run from `backend/` directory (not root) for `nutrition_ai.py` import to work

**How to apply:** When suggesting run commands, always use `./start.sh`. Backend env is in root `.env`, found automatically by `find_dotenv()`.
