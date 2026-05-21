/**
 * setupApiMocks
 * Registers Playwright page.route interceptors to fully virtualize all Supabase DB/Auth
 * and FastAPI backend AI endpoints.
 */
export async function setupApiMocks(page) {
  // ── Mock Supabase Auth Check ───────────────────────────────────────────────
  await page.route('**/auth/v1/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-access-token-steparc',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'mocked-user-id-12345',
          email: 'testathlete@steparc.com',
          role: 'authenticated',
          aud: 'authenticated',
          app_metadata: { provider: 'email' },
          user_metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
    });
  });

  await page.route('**/auth/v1/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mocked-user-id-12345',
        email: 'testathlete@steparc.com',
        role: 'authenticated',
        aud: 'authenticated',
      }),
    });
  });

  // ── Mock Supabase DB: user_settings (select) ──────────────────────────────────
  await page.route('**/rest/v1/user_settings?*', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user_id: 'mocked-user-id-12345',
          gender: 'male',
          goal_type: 'maintenance',
          calorie_goal: 2870,
          protein_goal: 160,
          carbs_goal: 400,
          fats_goal: 70,
          age: 23,
          height_cm: 175,
          weight_kg: 75.5,
          step_goal: 10000,
          diet_plan: { meals: [] },
          workout_plan: { days: [] },
          updated_at: new Date().toISOString(),
        }),
      });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    }
  });

  // ── Mock Supabase DB: daily_logs (select/upsert) ──────────────────────────────
  await page.route('**/rest/v1/daily_logs?*', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            user_id: 'mocked-user-id-12345',
            log_date: new Date().toISOString().slice(0, 10),
            food_logs: [],
            workout_logs: [],
            cardio_logs: [],
            steps: 0,
            updated_at: new Date().toISOString(),
          }
        ]),
      });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    }
  });

  // ── Mock Supabase DB general delete ──────────────────────────────────────────
  await page.route('**/rest/v1/daily_logs', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });

  // ── Mock Gemini Backend: AI Advice Endpoint ─────────────────────────────────
  await page.route('**/ai-advice', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        summary: "You are tracking beautifully today! You have met 60% of your protein goal and are well within your calorie targets. Keep up the high energy inputs.",
        remaining_macros: {
          calories: 1220,
          protein_g: 65,
          carbs_g: 150,
          fat_g: 22
        },
        recommendations: [
          "Suggest Meal 5: 150g Low Fat Paneer + 100g white rice + 100g steamed broccoli to hit protein and carbohydrate margins.",
          "Add 35g Whey Isolate to close any remaining protein gaps post-workout."
        ],
        warnings: [],
        status: "on_track"
      }),
    });
  });

  // ── Mock Gemini Backend: AI Meal Analysis Endpoint ────────────────────────────
  await page.route('**/analyze-meal', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        meal_name: "Mocked AI Protein Plate",
        total_macros: { calories: 450, protein_g: 40, carbs_g: 30, fat_g: 10 },
        ingredients: [
          { name: "Grilled Chicken", amount: 150, unit: "g", calories: 250, protein_g: 35, carbs_g: 0, fat_g: 5 },
          { name: "Steamed Rice", amount: 100, unit: "g", calories: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3 },
          { name: "Broccoli", amount: 80, unit: "g", calories: 70, protein_g: 2.3, carbs_g: 2, fat_g: 4.7 }
        ],
        top_protein_source: "Grilled Chicken",
        top_carb_source: "Steamed Rice",
        daily_summary: {
          bulk_target_kcal: 2870,
          maintenance_kcal: 2570,
          calories_logged_today: 1200,
          this_meal_calories: 450,
          remaining_calories: 1220
        }
      }),
    });
  });

  // ── Mock Gemini Backend: AI Cardio Analysis Endpoint ──────────────────────────
  await page.route('**/analyze-cardio', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        session_name: "Mocked AI Treadmill Cardio",
        total_duration_mins: 30,
        total_calories_burned: 312,
        segments: [
          { description: "Incline walk speed 4.5, incline 10", duration_mins: 30, calories_burned: 312, speed_kmh: 4.5, incline_degrees: 10 }
        ]
      }),
    });
  });
}
