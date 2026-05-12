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
