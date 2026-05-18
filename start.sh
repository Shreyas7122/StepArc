#!/usr/bin/env bash
# Run StepArc locally: backend (FastAPI) + frontend (Vite) in one shot.
# Usage: ./start.sh
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="$ROOT/venv/bin"

if [ ! -f "$VENV/uvicorn" ]; then
  echo "ERROR: venv not found. Run: python3 -m venv venv && venv/bin/pip install -r backend/requirements.txt"
  exit 1
fi

echo ""
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "your-laptop-ip")

echo "  ╔══════════════════════════════════════════╗"
echo "  ║           StepArc  Dev                   ║"
echo "  ║  Backend  →  http://localhost:8000        ║"
echo "  ║  Frontend →  http://localhost:5173        ║"
echo "  ║  Phone AI →  set VITE_API_URL=            ║"
echo "  ║               http://$LOCAL_IP:8000       ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

# Backend: bind to 0.0.0.0 so it's reachable from phone on same WiFi.
# To use local backend on phone: set VITE_API_URL=http://<this-ip>:8000 in .env.development.local
(cd "$ROOT/backend" && "$VENV/uvicorn" main:app \
  --host 0.0.0.0 --port 8000 \
  --reload) &
BACKEND=$!

# Frontend
(cd "$ROOT" && npm run dev) &
FRONTEND=$!

trap "echo ''; echo 'Shutting down…'; kill $BACKEND $FRONTEND 2>/dev/null; wait; exit 0" INT TERM

echo "Press Ctrl+C to stop both servers."
wait
