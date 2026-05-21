"""
Request interceptors for selenium-wire — mirrors tests/mocks/api-mocks.js.
All Supabase auth/REST calls and FastAPI AI endpoints are virtualised so
tests never hit real network services.
"""
import json
import time

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
    "updated_at": "2026-05-21T00:00:00.000Z",
}

MOCK_DAILY_LOGS = [{
    "user_id": "mocked-user-id-12345",
    "log_date": "2026-05-21",
    "food_logs": [],
    "workout_logs": [],
    "cardio_logs": [],
    "steps": 0,
    "updated_at": "2026-05-21T00:00:00.000Z",
}]

MOCK_AI_ADVICE = {
    "summary": (
        "You are tracking beautifully today! You have met 60% of your "
        "protein goal and are well within your calorie targets."
    ),
    "remaining_macros": {
        "calories": 1220,
        "protein_g": 65,
        "carbs_g": 150,
        "fat_g": 22,
    },
    "recommendations": [
        "Suggest Meal 5: 150g Low Fat Paneer + 100g white rice.",
        "Add 35g Whey Isolate to close protein gaps post-workout.",
    ],
    "warnings": [],
    "status": "on_track",
}

MOCK_ANALYZE_MEAL = {
    "meal_name": "Mocked AI Protein Plate",
    "total_macros": {"calories": 450, "protein_g": 40, "carbs_g": 30, "fat_g": 10},
    "ingredients": [
        {"name": "Grilled Chicken", "amount": 150, "unit": "g",
         "calories": 250, "protein_g": 35, "carbs_g": 0, "fat_g": 5},
        {"name": "Steamed Rice", "amount": 100, "unit": "g",
         "calories": 130, "protein_g": 2.7, "carbs_g": 28, "fat_g": 0.3},
        {"name": "Broccoli", "amount": 80, "unit": "g",
         "calories": 70, "protein_g": 2.3, "carbs_g": 2, "fat_g": 4.7},
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


def _json_resp(body, status=200):
    return dict(
        status_code=status,
        headers={"Content-Type": "application/json"},
        body=json.dumps(body).encode(),
    )


def setup_api_mocks(driver):
    """
    Attach a selenium-wire request interceptor that fulfils every
    Supabase auth/REST call and AI backend endpoint with mock data.
    Must be called before driver.get() so interception is active from
    the first request.
    """
    def interceptor(request):
        url = request.url
        method = request.method.upper()

        # ── Supabase Auth ──────────────────────────────────────────────────────
        if "/auth/v1/session" in url:
            request.create_response(**_json_resp(MOCK_SESSION))

        elif "/auth/v1/user" in url:
            request.create_response(**_json_resp(MOCK_USER))

        elif "/auth/v1/token" in url:
            # Refresh-token grant
            request.create_response(**_json_resp(MOCK_SESSION))

        elif "/auth/v1/logout" in url:
            request.create_response(**_json_resp({}))

        # ── Supabase REST — user_settings ──────────────────────────────────────
        elif "/rest/v1/user_settings" in url:
            if method == "GET":
                request.create_response(**_json_resp(MOCK_SETTINGS))
            else:
                request.create_response(**_json_resp({"success": True}))

        # ── Supabase REST — daily_logs ─────────────────────────────────────────
        elif "/rest/v1/daily_logs" in url:
            if method == "GET":
                request.create_response(**_json_resp(MOCK_DAILY_LOGS))
            else:
                request.create_response(**_json_resp({"success": True}))

        # ── AI backend endpoints ───────────────────────────────────────────────
        elif "/ai-advice" in url:
            request.create_response(**_json_resp(MOCK_AI_ADVICE))

        elif "/analyze-meal" in url:
            request.create_response(**_json_resp(MOCK_ANALYZE_MEAL))

        elif "/analyze-cardio" in url:
            request.create_response(**_json_resp(MOCK_ANALYZE_CARDIO))

        elif "/recommend-diet" in url:
            request.create_response(**_json_resp({
                "recommendation": {
                    "meals": [
                        {"name": "AI Breakfast", "items": []},
                        {"name": "AI Lunch", "items": []},
                    ]
                }
            }))

    driver.request_interceptor = interceptor


def override_ai_advice_error(driver, detail="Internal server error"):
    """Swap the ai-advice mock to return a 500 for error-state tests."""
    def interceptor(request):
        url = request.url
        if "/ai-advice" in url:
            request.create_response(**_json_resp({"detail": detail}, status=500))
        # Fall through for all other requests — handled by the base mock
    driver.request_interceptor = interceptor


def override_ai_advice_abort(driver):
    """Abort the ai-advice request to simulate a network failure."""
    def interceptor(request):
        if "/ai-advice" in request.url:
            request.abort()
    driver.request_interceptor = interceptor
