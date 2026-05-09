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

SYSTEM_PROMPT = """
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


def analyze_meal(meal_text: str) -> dict:
    response = _client.models.generate_content(
        model="gemini-2.5-flash",
        contents=meal_text,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
        ),
    )

    raw = response.text.strip()
    # Strip any accidental markdown fences the model may still add
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    return json.loads(raw)
