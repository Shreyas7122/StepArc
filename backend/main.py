import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from nutrition_ai import analyze_meal, analyze_meal_image, analyze_cardio, get_ai_advice, get_diet_recommendation, get_workout_recommendation

MAINTENANCE_KCAL = 2570
BULK_TARGET_KCAL = MAINTENANCE_KCAL + 300  # 2870

app = FastAPI(title="StepArc Nutrition API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Meal models ──────────────────────────────────────────────────────────────

class AnalyzeMealRequest(BaseModel):
    meal_text: str
    calories_logged_today: Optional[float] = 0.0
    calorie_goal: Optional[float] = None


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
    effective_target = request.calorie_goal or BULK_TARGET_KCAL
    remaining = max(0, effective_target - total_consumed)

    return AnalyzeMealResponse(
        meal_name=ai_result["meal_name"],
        total_macros=ai_result["total_macros"],
        ingredients=ai_result["ingredients"],
        top_protein_source=ai_result["top_protein_source"],
        top_carb_source=ai_result["top_carb_source"],
        daily_summary=DailySummary(
            bulk_target_kcal=int(effective_target),
            maintenance_kcal=MAINTENANCE_KCAL,
            calories_logged_today=request.calories_logged_today or 0,
            this_meal_calories=meal_calories,
            remaining_calories=remaining,
        ),
    )


# ── Image meal analysis ──────────────────────────────────────────────────────

class AnalyzeMealImageRequest(BaseModel):
    image_base64: str
    mime_type: Optional[str] = "image/jpeg"
    calories_logged_today: Optional[float] = 0.0
    calorie_goal: Optional[float] = None


@app.post("/analyze-meal-image", response_model=AnalyzeMealResponse)
async def analyze_meal_image_endpoint(request: AnalyzeMealImageRequest):
    if not request.image_base64.strip():
        raise HTTPException(status_code=400, detail="image_base64 cannot be empty.")
    try:
        ai_result = analyze_meal_image(request.image_base64, request.mime_type or "image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    meal_calories = ai_result.get("total_macros", {}).get("calories", 0)
    total_consumed = (request.calories_logged_today or 0) + meal_calories
    effective_target = request.calorie_goal or BULK_TARGET_KCAL
    remaining = max(0, effective_target - total_consumed)

    return AnalyzeMealResponse(
        meal_name=ai_result["meal_name"],
        total_macros=ai_result["total_macros"],
        ingredients=ai_result["ingredients"],
        top_protein_source=ai_result["top_protein_source"],
        top_carb_source=ai_result["top_carb_source"],
        daily_summary=DailySummary(
            bulk_target_kcal=int(effective_target),
            maintenance_kcal=MAINTENANCE_KCAL,
            calories_logged_today=request.calories_logged_today or 0,
            this_meal_calories=meal_calories,
            remaining_calories=remaining,
        ),
    )


# ── AI Advisor ───────────────────────────────────────────────────────────────

class AIAdviceRequest(BaseModel):
    age: int
    height_cm: float
    weight_kg: float
    goal_calories: int
    goal_protein: int
    goal_carbs: int
    goal_fat: int
    calories_eaten: float
    protein_eaten: float
    carbs_eaten: float
    fat_eaten: float
    steps: int
    steps_calories: float
    workout_calories: float
    food_log_text: str
    workout_log_text: str
    fridge_items: Optional[str] = None


class AIAdviceResponse(BaseModel):
    summary: str
    remaining_macros: dict
    recommendations: list
    warnings: list
    status: str


@app.post("/ai-advice", response_model=AIAdviceResponse)
async def ai_advice_endpoint(request: AIAdviceRequest):
    try:
        result = get_ai_advice(request.model_dump())
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI advice failed: {str(e)}")
    return AIAdviceResponse(**result)


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


# ── Diet recommendation ───────────────────────────────────────────────────────

class DietRecommendRequest(BaseModel):
    age: int
    weight_kg: float
    height_cm: float
    calorie_goal: int
    protein_goal: int
    carbs_goal: int
    fats_goal: int


@app.post("/recommend-diet")
async def recommend_diet_endpoint(request: DietRecommendRequest):
    try:
        result = get_diet_recommendation(request.model_dump())
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Diet recommendation failed: {str(e)}")
    return result["plan"]


# ── Workout recommendation ────────────────────────────────────────────────────

class WorkoutRecommendRequest(BaseModel):
    age: int
    weight_kg: float
    calorie_goal: int


@app.post("/recommend-workout")
async def recommend_workout_endpoint(request: WorkoutRecommendRequest):
    try:
        result = get_workout_recommendation(request.model_dump())
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Workout recommendation failed: {str(e)}")
    return result["plan"]
