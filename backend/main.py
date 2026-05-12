import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from nutrition_ai import analyze_meal, analyze_cardio

MAINTENANCE_KCAL = 2570
BULK_TARGET_KCAL = MAINTENANCE_KCAL + 300  # 2870

app = FastAPI(title="StepArc Nutrition API", version="1.0.0")

_frontend_url = os.getenv("FRONTEND_URL", "")
_allowed_origins = ["http://localhost:5173", "http://localhost:3000", "https://localhost"]
if _frontend_url:
    _allowed_origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Meal models ──────────────────────────────────────────────────────────────

class AnalyzeMealRequest(BaseModel):
    meal_text: str
    calories_logged_today: Optional[float] = 0.0


class DailySummary(BaseModel):
    bulk_target_kcal: int
    maintenance_kcal: int
    calories_logged_today: float
    this_meal_calories: float
    remaining_calories: float


class AnalyzeMealResponse(BaseModel):
    meal_name: str
    total_macros: dict
    ingredients: list
    top_protein_source: str
    top_carb_source: str
    daily_summary: DailySummary


# ── Cardio models ────────────────────────────────────────────────────────────

class AnalyzeCardioRequest(BaseModel):
    session_text: str


class AnalyzeCardioResponse(BaseModel):
    session_name: str
    total_duration_mins: float
    total_calories_burned: float
    segments: list


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze-meal", response_model=AnalyzeMealResponse)
async def analyze_meal_endpoint(request: AnalyzeMealRequest):
    if not request.meal_text.strip():
        raise HTTPException(status_code=400, detail="meal_text cannot be empty.")
    try:
        ai_result = analyze_meal(request.meal_text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    meal_calories = ai_result.get("total_macros", {}).get("calories", 0)
    total_consumed = (request.calories_logged_today or 0) + meal_calories
    remaining = max(0, BULK_TARGET_KCAL - total_consumed)

    return AnalyzeMealResponse(
        meal_name=ai_result["meal_name"],
        total_macros=ai_result["total_macros"],
        ingredients=ai_result["ingredients"],
        top_protein_source=ai_result["top_protein_source"],
        top_carb_source=ai_result["top_carb_source"],
        daily_summary=DailySummary(
            bulk_target_kcal=BULK_TARGET_KCAL,
            maintenance_kcal=MAINTENANCE_KCAL,
            calories_logged_today=request.calories_logged_today or 0,
            this_meal_calories=meal_calories,
            remaining_calories=remaining,
        ),
    )


@app.post("/analyze-cardio", response_model=AnalyzeCardioResponse)
async def analyze_cardio_endpoint(request: AnalyzeCardioRequest):
    if not request.session_text.strip():
        raise HTTPException(status_code=400, detail="session_text cannot be empty.")
    try:
        result = analyze_cardio(request.session_text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    return AnalyzeCardioResponse(
        session_name=result["session_name"],
        total_duration_mins=result["total_duration_mins"],
        total_calories_burned=result["total_calories_burned"],
        segments=result["segments"],
    )
