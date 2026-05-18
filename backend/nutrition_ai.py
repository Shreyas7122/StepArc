import base64
import json
import os
from dotenv import load_dotenv, find_dotenv
from google import genai
from google.genai import types

load_dotenv(find_dotenv())

_api_key = os.getenv("API_KEY")
if not _api_key:
    raise EnvironmentError("API_KEY not found in environment. Check your .env file.")

_client = genai.Client(api_key=_api_key)

MEAL_SYSTEM_PROMPT = """
You are a precise sports nutrition analyst. When given a meal description, you MUST respond
with a single valid JSON object — no markdown, no explanation, no extra text.

The JSON must follow this exact structure:
{
  "meal_name": "A short descriptive name for the entire meal",
  "total_macros": {
    "calories": <number>,
    "protein_g": <number>,
    "carbs_g": <number>,
    "fat_g": <number>
  },
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": <number>,
      "unit": "g | ml | tbsp | piece | scoop | etc.",
      "calories": <number>,
      "protein_g": <number>,
      "carbs_g": <number>,
      "fat_g": <number>
    }
  ],
  "top_protein_source": "name of the ingredient with the highest total protein",
  "top_carb_source": "name of the ingredient with the highest total carbs"
}

Rules:
- All macro values must be numbers (not strings), rounded to one decimal place.
- total_macros must equal the sum of all ingredient macros.
- If an ingredient amount is ambiguous (e.g. "a scoop"), use a realistic standard serving.
- If no quantity is specified, assume a standard single serving.
- top_protein_source and top_carb_source must exactly match one of the ingredient names.
"""

CARDIO_SYSTEM_PROMPT = """
You are a precise fitness calorie calculator. When given a cardio session description,
parse each segment and calculate calories burned for a 78 kg person.

Reference calorie rates for incline treadmill walking (adjust proportionally for other values):
- Speed 4.0 km/h, 10° incline: 8.5 kcal/min
- Speed 4.2 km/h, 10° incline: 9.2 kcal/min
- Speed 4.5 km/h, 10° incline: 10.4 kcal/min
- Speed 5.0 km/h, 10° incline: 11.5 kcal/min
- Speed 4.0 km/h, flat:         5.5 kcal/min
- Speed 5.0 km/h, flat:         7.0 kcal/min
- Running 8 km/h, flat:         11.0 kcal/min
- Cycling moderate:              8.0 kcal/min
- Rowing moderate:               9.5 kcal/min

For incline: every 2 degrees above 0° adds roughly 0.5 kcal/min to the flat rate.
For speed: every 0.5 km/h change adds roughly 0.5 kcal/min.

Return ONLY a valid JSON object — no markdown, no extra text:
{
  "session_name": "brief descriptive name (e.g. 'Incline Walk Session')",
  "total_duration_mins": <number>,
  "total_calories_burned": <number>,
  "segments": [
    {
      "description": "concise segment label",
      "duration_mins": <number>,
      "calories_burned": <number>,
      "speed_kmh": <number or null>,
      "incline_degrees": <number or null>
    }
  ]
}

Rules:
- All values must be numbers rounded to 1 decimal place.
- total_calories_burned must equal the sum of all segment calories_burned.
- total_duration_mins must equal the sum of all segment duration_mins.
- If incline/speed is missing for a segment, infer from context or use null.
"""


def _strip_fences(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return raw.strip()


ADVISOR_SYSTEM_PROMPT = """
You are a personal nutrition and fitness advisor. Given a summary of what the user has eaten and done today,
recommend what to eat for remaining meals to hit their calorie and macro goals. Flag anything to reduce.

Respond ONLY with a valid JSON object — no markdown, no extra text:
{
  "summary": "2-3 sentences on how they are tracking today",
  "remaining_macros": {
    "calories": <number>,
    "protein_g": <number>,
    "carbs_g": <number>,
    "fat_g": <number>
  },
  "recommendations": [
    "specific actionable suggestion 1",
    "specific actionable suggestion 2",
    "specific actionable suggestion 3"
  ],
  "warnings": ["thing to cut or watch if any — empty list if none"],
  "status": "on_track" | "over" | "under"
}

Rules:
- remaining_macros must equal goal minus already consumed.
- recommendations must be specific (e.g. name foods, quantities).
- status is "over" if calories_eaten > goal, "under" if far below with no meals left, else "on_track".
"""


def analyze_meal(meal_text: str) -> dict:
    response = _client.models.generate_content(
        model="gemini-2.5-flash",
        contents=meal_text,
        config=types.GenerateContentConfig(
            system_instruction=MEAL_SYSTEM_PROMPT,
            response_mime_type="application/json",
        ),
    )
    return json.loads(_strip_fences(response.text))


def analyze_meal_image(image_base64: str, mime_type: str = "image/jpeg") -> dict:
    image_bytes = base64.b64decode(image_base64)
    response = _client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            "Analyze this meal photo and provide a detailed macro breakdown of everything visible.",
        ],
        config=types.GenerateContentConfig(
            system_instruction=MEAL_SYSTEM_PROMPT,
            response_mime_type="application/json",
        ),
    )
    return json.loads(_strip_fences(response.text))


def analyze_cardio(session_text: str) -> dict:
    response = _client.models.generate_content(
        model="gemini-2.5-flash",
        contents=session_text,
        config=types.GenerateContentConfig(
            system_instruction=CARDIO_SYSTEM_PROMPT,
            response_mime_type="application/json",
        ),
    )
    return json.loads(_strip_fences(response.text))


DIET_PLAN_SYSTEM_PROMPT = """
You are a sports nutritionist. Given a user's body stats and daily macro targets, create a structured daily meal plan with EXACTLY 5 meals in this fixed order and focus:

1. Pre-Workout  — good fast/slow carbs and micronutrients (e.g. banana, eggs, oats, dates/fruit). Fuels the session.
2. Post-Workout — high protein + fibre + antioxidants to replenish micronutrients lost in training (e.g. whey, banana, blueberry, egg white, oats, seeds).
3. Lunch        — carb refill, muscle-repairing protein, must include dahi (yogurt). Use rice/chapati, paneer/tofu, vegetables.
4. Snacks       — light: one or two fruits + a protein source (e.g. egg whites, dahi, almonds).
5. Dinner       — low-calorie, MUST include potato (good slow carb, improves sleep quality). Keep fats moderate.

You MUST respond with ONLY a valid JSON object — no markdown, no explanation.

Structure (the meals array must have exactly 5 items in the order above):
{
  "meals": [
    { "name": "Pre-Workout",  "items": [ { "foodId": 2, "amount": 100 }, { "foodId": 1, "amount": 150 } ] },
    { "name": "Post-Workout", "items": [ ... ] },
    { "name": "Lunch",        "items": [ ... ] },
    { "name": "Snacks",       "items": [ ... ] },
    { "name": "Dinner",       "items": [ ... ] }
  ]
}

Rules:
- Use ONLY the foodIds listed in the prompt. Never invent new IDs.
- amount is in grams (integer).
- The 5 meals together must hit the user's daily calorie and macro targets.
- Each meal: 2–7 items appropriate to its category.
- Dinner MUST include foodId 9 (Potato) and MUST NOT include whey protein.
- Lunch MUST include foodId 11 (Low Fat Dahi) or foodId 28 (Amul High Protein Dahi).
"""

WORKOUT_PLAN_SYSTEM_PROMPT = """
You are a strength & conditioning coach. Given a user profile and an exercise database with IDs, create a structured weekly workout plan.
You MUST respond with ONLY a valid JSON object — no markdown, no explanation.

Structure:
{
  "days": [
    {
      "name": "Monday: Back, Biceps & Abs",
      "items": [
        { "exerciseId": 101, "sets": 3 },
        { "exerciseId": 102, "sets": 4 }
      ]
    }
  ]
}

Rules:
- Use ONLY the exerciseIds listed in the prompt. Never invent new IDs.
- sets is an integer (typically 3-4).
- Suggest a 5-6 day split. Each day should have 6-11 exercises.
- Always include exerciseId 200 (Incline Walk cardio) as the last item on training days.
"""


def get_diet_recommendation(ctx: dict) -> dict:
    prompt = f"""User profile: Age {ctx['age']}, Weight {ctx['weight_kg']} kg, Height {ctx['height_cm']} cm
Daily targets: {ctx['calorie_goal']} kcal | Protein {ctx['protein_goal']}g | Carbs {ctx['carbs_goal']}g | Fats {ctx['fats_goal']}g

Available foods — use ONLY these foodIds, never invent new ones:
PRE-WORKOUT candidates (carbs + micros):
  1: Banana (Raw) — 89kcal P1.1g C22.8g
  2: Whole Egg (Raw) — 143kcal P12.6g C0.7g F9.5g
  3: Oats (Dry/Raw) — 389kcal P16.9g C66.3g F6.9g
  4: Mixed Seeds — 550kcal P20g C20g F45g

POST-WORKOUT candidates (protein + antioxidants + fibre):
  1: Banana (Raw) — 89kcal P1.1g C22.8g
  3: Oats (Dry/Raw) — 389kcal P16.9g C66.3g F6.9g
  4: Mixed Seeds — 550kcal P20g C20g F45g
  6: Blueberry (Raw) — 57kcal P0.7g C14.5g
  25: ON Whey (Gold Standard) — 375kcal P77g C10g F3.3g
  26: Egg White (Raw) — 52kcal P10.9g C0.7g
  27: Whey Isolate (NitroTech) — 370kcal P81g C6.5g F2g
  28: Amul High Protein Dahi — 80kcal P10g C4g

LUNCH candidates (carbs + muscle repair + dahi):
  7: Rice (White, Cooked) — 130kcal P2.7g C28g
  8: Chapati (Whole Wheat) — 297kcal P9g C46g F10g
  9: Potato (Boiled/Raw) — 77kcal P2g C17g
  10: Low Fat Paneer — 180kcal P20g C4g F10g
  11: Low Fat Dahi — 43kcal P4.3g C4.7g F1.5g
  12: Capsicum — 20kcal P1g C4.6g
  13: Carrot — 41kcal P0.9g C9.6g
  16: Ghee — 900kcal F100g (use sparingly, 3-8g)
  17: French Beans — 31kcal P1.8g C7g
  19: Tomato — 18kcal P0.9g C3.9g
  24: Tofu (Firm) — 144kcal P16g C2.8g F8.7g
  28: Amul High Protein Dahi — 80kcal P10g C4g
  29: Cucumber (Raw) — 15kcal P0.6g C3.6g
  30: Mom's Subji (Green Leafy) — 100kcal P3.5g C7g F6g
  31: Mom's Subji (Starchy) — 175kcal P2.5g C22.5g F8g
  32: Mom's Subji (Cruciferous) — 110kcal P2.5g C9g F6g
  33: Mom's Subji (Legume-based) — 140kcal P4.5g C13.5g F7g

SNACKS candidates (fruit + protein):
  1: Banana (Raw) — 89kcal
  5: Almonds (Raw) — 579kcal P21.1g F49.9g
  6: Blueberry (Raw) — 57kcal
  20: Papaya — 43kcal
  22: Watermelon — 30kcal
  23: Mango — 60kcal (if available)
  26: Egg White (Raw) — 52kcal P10.9g
  28: Amul High Protein Dahi — 80kcal P10g

DINNER candidates (low-cal, MUST include potato, NO whey):
  9: Potato (Boiled/Raw) — 77kcal ← REQUIRED
  10: Low Fat Paneer — 180kcal P20g
  11: Low Fat Dahi — 43kcal P4.3g
  12: Capsicum — 20kcal
  16: Ghee — 900kcal (use sparingly, 3-8g)
  17: French Beans — 31kcal
  19: Tomato — 18kcal
  24: Tofu (Firm) — 144kcal P16g
  26: Egg White (Raw) — 52kcal P10.9g
  29: Cucumber (Raw) — 15kcal
  30: Mom's Subji (Green Leafy) — 100kcal P3.5g
  32: Mom's Subji (Cruciferous) — 110kcal
  33: Mom's Subji (Legume-based) — 140kcal P4.5g

Generate the 5-meal plan now."""

    response = _client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=DIET_PLAN_SYSTEM_PROMPT,
            response_mime_type="application/json",
        ),
    )
    data = json.loads(_strip_fences(response.text))
    return {"plan": data}


def get_workout_recommendation(ctx: dict) -> dict:
    prompt = f"""User: Age {ctx['age']}, Weight {ctx['weight_kg']}kg, Goal: {ctx['calorie_goal']} kcal/day

Available exercises (use ONLY these exerciseIds):
BACK: 101 Deadlift, 102 Lat Pull Down, 103 Seated Rowing, 104 Chest Supported DB Rowing, 140 Pull Ups, 141 T Bar
BICEPS: 105 DB Curl Incline, 106 EZ Barbell Curl, 107 DB Preacher Curl
CHEST: 110 Incline Smith Machine Bench Press, 138 Flat Smith Machine Bench Press, 111 Cable Crossover, 112 Push Ups, 113 Machine Chest Press, 114 Pec Dec Fly, 139 Low to High Cable Fly
TRICEPS: 115 Close Grip Bench Press, 116 Cable Overhead Extension, 117 Cable Pushdown, 118 Cross Cable Triceps Tension, 119 Bar Dips
SHOULDERS: 129 Smith Machine Shoulder Press, 130 Cable Lateral Raises, 131 Rear Delt DB Fly, 132 Plate Front Raises, 133 Face Pull, 134 DB Shrugs, 135 Smith Machine Shrugs
LEGS: 120 Smith Machine Squats, 121 Leg Extension, 122 Leg Press, 123 Lying Leg Curls, 124 Glute Mid Kickback, 125 Standing Calf Raises, 126 Seated Calf Raises, 142 RDL, 143 Walking Lunges, 144 Bulgarian Split Squats, 145 Hip Thrust, 146 Seated Leg Curl
ABS: 108 Cable Crunch Kneeling, 109 Decline Bench Crunch, 127 Russian Twist, 128 Plank (60s), 136 Seated In and Outs, 137 Lying Leg Raises
CARDIO: 200 Incline Walk (always add at end of each training day, sets: 1)

Create a 5-6 day workout split optimised for muscle building."""

    response = _client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=WORKOUT_PLAN_SYSTEM_PROMPT,
            response_mime_type="application/json",
        ),
    )
    data = json.loads(_strip_fences(response.text))
    return {"plan": data}


def get_ai_advice(context: dict) -> dict:
    prompt = f"""
User Profile: Age {context['age']}, Height {context['height_cm']} cm, Weight {context['weight_kg']} kg
Daily Goal: {context['goal_calories']} kcal (Protein {context['goal_protein']}g · Carbs {context['goal_carbs']}g · Fat {context['goal_fat']}g)

Progress so far today:
- Calories eaten: {context['calories_eaten']} kcal
- Protein: {context['protein_eaten']}g  |  Carbs: {context['carbs_eaten']}g  |  Fat: {context['fat_eaten']}g

Activity:
- Steps: {context['steps']} (~{context['steps_calories']} kcal burned)
- Gym calories burned: {context['workout_calories']} kcal

Meals logged today:
{context['food_log_text'] or 'None yet'}

Exercises done today:
{context['workout_log_text'] or 'None yet'}

Available in fridge:
{context.get('fridge_items') or 'Not specified (no fridge items provided)'}

Based on this, tell me what to eat for remaining meals to hit my goals and what (if anything) I should cut back on. If fridge items are provided, suggest recipes using those ingredients.
"""
    response = _client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=ADVISOR_SYSTEM_PROMPT,
            response_mime_type="application/json",
        ),
    )
    return json.loads(_strip_fences(response.text))
