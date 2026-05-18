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


def get_diet_recommendation(ctx: dict) -> dict:
    prompt = f"""You are a sports nutritionist. Based on the user's profile and the available food database, suggest a daily meal plan.

User: Age {ctx['age']}, Weight {ctx['weight_kg']}kg, Height {ctx['height_cm']}cm
Daily targets: {ctx['calorie_goal']} kcal, Protein {ctx['protein_goal']}g, Carbs {ctx['carbs_goal']}g, Fats {ctx['fats_goal']}g

Available foods in app database:
- Banana (Raw): 89kcal, P1.1g C22.8g F0.3g — energy, potassium
- Whole Egg (Raw): 143kcal, P12.6g C0.7g F9.5g — complete protein
- Oats (Dry/Raw): 389kcal, P16.9g C66.3g F6.9g — fiber, slow carbs
- Mixed Seeds: 550kcal, P20g C20g F45g — omega-3, fiber, antioxidants
- Almonds (Raw): 579kcal, P21.1g C21.6g F49.9g — healthy fats, vitamin E
- Blueberry: 57kcal — powerful antioxidants
- Rice (White, Cooked): 130kcal, P2.7g C28g F0.3g
- Chapati (Whole Wheat): 297kcal, P9g C46g F10g — fiber
- Potato (Boiled): 77kcal — carbs, potassium
- Low Fat Paneer: 180kcal, P20g C4g F10g — protein
- Low Fat Dahi: 43kcal, P4.3g C4.7g F1.5g — probiotics
- Capsicum: 20kcal — vitamin C, antioxidants
- Carrot: 41kcal — beta-carotene, fiber
- French Beans: 31kcal — fiber
- Cucumber: 15kcal — hydration
- Tomato: 18kcal — lycopene antioxidant
- Papaya: 43kcal — digestive enzymes, antioxidants
- Watermelon: 30kcal — hydration, lycopene
- Mango: 60kcal — vitamins, antioxidants
- Tofu (Firm): 144kcal, P16g — plant protein
- ON Whey / Whey Isolate: ~375kcal, P77-81g — post-workout protein
- Egg White: 52kcal, P10.9g — lean protein
- Amul High Protein Dahi: 80kcal, P10g
- Mom's Subji (Green Leafy): 100kcal — iron, antioxidants, fiber
- Mom's Subji (Cruciferous): 110kcal — fiber, glucosinolates
- Mom's Subji (Legume-based): 140kcal, P4.5g — plant protein, fiber
- Ghee: 900kcal — healthy fats (use sparingly)

Suggest 4-5 meals (Pre-Workout, Post-Workout, Lunch, Evening Snack, Dinner) using ONLY foods from this list. For each meal specify food items and approximate amounts in grams. Keep it practical and hit the macro targets. Format as plain readable text, not JSON."""

    response = _client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt,
    )
    return {"recommendation": response.text}


def get_workout_recommendation(ctx: dict) -> dict:
    prompt = f"""You are a strength & conditioning coach. Based on this user's profile, suggest a weekly gym workout plan.

User: Age {ctx['age']}, Weight {ctx['weight_kg']}kg, Goal: {ctx['calorie_goal']} kcal/day (muscle building/maintenance)

Available exercises in app database:
BACK: Deadlift, Lat Pull Down, Seated Rowing, Chest Supported DB Rowing, T Bar, Pull Ups
BICEPS: DB Curl Incline, EZ Barbell Curl, DB Preacher Curl
CHEST: Incline Smith Machine Bench Press, Flat Smith Machine Bench Press, Cable Crossover, Push Ups, Machine Chest Press, Pec Dec Fly, Low to High Cable Fly
TRICEPS: Close Grip Bench Press, Cable Overhead Extension, Cable Pushdown, Cross Cable Triceps Tension, Bar Dips
SHOULDERS: Smith Machine Shoulder Press, Cable Lateral Raises, Rear Delt DB Fly, Plate Front Raises, Face Pull, DB Shrugs, Smith Machine Shrugs
LEGS: Smith Machine Squats, Leg Extension, Leg Press, Lying Leg Curls, Glute Mid Kickback, Standing Calf Raises, Seated Calf Raises, RDL, Walking Lunges, Bulgarian Split Squats, Hip Thrust, Seated Leg Curl
ABS: Cable Crunch Kneeling, Decline Bench Crunch, Russian Twist, Plank (60s), Seated In and Outs, Lying Leg Raises
CARDIO: Incline Walk (25 mins, 10 Incl, 4.5 Spd)

Suggest a 5-6 day workout split using ONLY exercises from this list. For each day specify muscle group focus, exercises, and sets (typically 3-4 sets per exercise). Format as plain readable text."""

    response = _client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt,
    )
    return {"recommendation": response.text}


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
