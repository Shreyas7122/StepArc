"""
Request interception via JS fetch mocking injected on new document.
Mirrors tests/mocks/api-mocks.js — all Supabase and AI backend calls are virtualised.

Uses CDP Page.addScriptToEvaluateOnNewDocument to inject a window.fetch override
before any app code runs. Compatible with selenium==4.18.1 (no add_cdp_listener needed).
"""
import json
from typing import Optional

BASE_URL = "http://localhost:5173"

# ── Shared mock payloads ────────────────────────────────────────────────────────

MOCK_USER = {
    "id": "mocked-user-id-12345",
    "email": "testathlete@steparc.com",
    "role": "authenticated",
    "aud": "authenticated",
    "app_metadata": {"provider": "email"},
    "user_metadata": {},
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z",
}

MOCK_SESSION = {
    "access_token": "mock-access-token-steparc",
    "token_type": "bearer",
    "expires_in": 3600,
    "refresh_token": "mock-refresh-token",
    "user": MOCK_USER,
}

MOCK_SETTINGS = {
    "user_id": "mocked-user-id-12345",
    "gender": "male",
    "goal_type": "maintenance",
    "activity_level": "moderate",
    "calorie_goal": 2870,
    "protein_goal": 160,
    "carbs_goal": 400,
    "fats_goal": 70,
    "age": 23,
    "height_cm": 175,
    "weight_kg": 75.5,
    "step_goal": 10000,
    "diet_plan": {"meals": []},
    "workout_plan": {"days": []},
    "updated_at": "2026-05-22T00:00:00.000Z",
}

MOCK_DAILY_LOGS = [{
    "user_id": "mocked-user-id-12345",
    "log_date": "2026-05-22",
    "food_logs": [],
    "workout_logs": [],
    "cardio_logs": [],
    "steps": 0,
    "updated_at": "2026-05-22T00:00:00.000Z",
}]

MOCK_AI_ADVICE = {
    "summary": "You are tracking beautifully today!",
    "remaining_macros": {"calories": 1220, "protein_g": 65, "carbs_g": 150, "fat_g": 22},
    "recommendations": ["Suggest Meal 5: 150g Low Fat Paneer + 100g white rice."],
    "warnings": [],
    "status": "on_track",
}

MOCK_ANALYZE_MEAL = {
    "meal_name": "Mocked AI Protein Plate",
    "total_macros": {"calories": 450, "protein_g": 40, "carbs_g": 30, "fat_g": 10},
    "ingredients": [
        {"name": "Grilled Chicken", "amount": 150, "unit": "g",
         "calories": 250, "protein_g": 35, "carbs_g": 0, "fat_g": 5},
    ],
    "daily_summary": {
        "bulk_target_kcal": 2870,
        "calories_logged_today": 1200,
        "this_meal_calories": 450,
        "remaining_calories": 1220,
    },
}

MOCK_ANALYZE_CARDIO = {
    "session_name": "Mocked AI Treadmill Cardio",
    "total_duration_mins": 30,
    "total_calories_burned": 312,
    "segments": [{
        "description": "Incline walk speed 4.5, incline 10",
        "duration_mins": 30,
        "calories_burned": 312,
        "speed_kmh": 4.5,
        "incline_degrees": 10,
    }],
}


def _build_fetch_mock_script(mocks: dict, error_urls: Optional[dict] = None) -> str:
    """
    Build a JS script that overrides window.fetch before any app code runs.

    mocks       — {url_substring: (status_code, body_dict)}
    error_urls  — {url_substring: status_code}  — these return the given HTTP status
    """
    if error_urls is None:
        error_urls = {}

    mocks_json       = json.dumps({k: {"status": v[0], "body": v[1]} for k, v in mocks.items()})
    error_urls_json  = json.dumps(error_urls)

    return f"""
(function() {{
  const MOCKS       = {mocks_json};
  const ERROR_URLS  = {error_urls_json};
  const _realFetch  = window.fetch.bind(window);

  window.fetch = function(input, init) {{
    const url = (typeof input === 'string') ? input : (input && input.url) || '';
    const method = (init && init.method || 'GET').toUpperCase();

    // Error overrides (e.g. 500 for error-state tests)
    for (const [pat, status] of Object.entries(ERROR_URLS)) {{
      if (url.includes(pat)) {{
        return Promise.resolve(new Response(JSON.stringify({{detail: 'mocked error'}}), {{
          status: status,
          headers: {{'Content-Type': 'application/json'}},
        }}));
      }}
    }}

    // Normal mocks
    for (const [pat, cfg] of Object.entries(MOCKS)) {{
      if (url.includes(pat)) {{
        // For mutating calls return success body; for GET return full mock
        const body = (method === 'GET' || method === 'OPTIONS')
          ? cfg.body
          : (cfg.body_write !== undefined ? cfg.body_write : {{'success': true}});
        return Promise.resolve(new Response(JSON.stringify(body), {{
          status: cfg.status,
          headers: {{'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}},
        }}));
      }}
    }}

    // Pass-through for local dev server assets
    return _realFetch(input, init);
  }};
}})();
"""


# Default mock table used by setup_api_mocks
_DEFAULT_MOCKS = {
    "/auth/v1/session":     (200, MOCK_SESSION),
    "/auth/v1/token":       (200, MOCK_SESSION),
    "/auth/v1/user":        (200, MOCK_USER),
    "/auth/v1/logout":      (200, {}),
    "/rest/v1/user_settings": (200, MOCK_SETTINGS),
    "/rest/v1/daily_logs":  (200, MOCK_DAILY_LOGS),
    "/ai-advice":           (200, MOCK_AI_ADVICE),
    "/analyze-meal":        (200, MOCK_ANALYZE_MEAL),
    "/analyze-cardio":      (200, MOCK_ANALYZE_CARDIO),
    "/recommend-diet":      (200, {"recommendation": {"meals": []}}),
}


def setup_api_mocks(driver, extra_mocks: Optional[dict] = None, error_urls: Optional[dict] = None):
    """
    Inject a window.fetch mock that returns virtualised payloads for all
    Supabase and AI backend requests.  Must be called BEFORE driver.get().

    extra_mocks — additional {url_substring: (status, body)} overrides
    error_urls  — {url_substring: http_status} — force HTTP error responses
    """
    mocks = dict(_DEFAULT_MOCKS)
    if extra_mocks:
        mocks.update(extra_mocks)

    script = _build_fetch_mock_script(mocks, error_urls)
    driver.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument",
        {"source": script},
    )


def override_ai_advice_error(driver, detail="Internal server error"):
    """Replace the ai-advice mock with a 500 for error-state tests."""
    mocks = dict(_DEFAULT_MOCKS)
    # Remove the normal ai-advice mock and add an error override
    del mocks["/ai-advice"]
    script = _build_fetch_mock_script(mocks, error_urls={"/ai-advice": 500})
    driver.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument",
        {"source": script},
    )


def override_ai_advice_abort(driver):
    """Simulate a network failure on ai-advice by returning a 503."""
    mocks = dict(_DEFAULT_MOCKS)
    del mocks["/ai-advice"]
    script = _build_fetch_mock_script(mocks, error_urls={"/ai-advice": 503})
    driver.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument",
        {"source": script},
    )
