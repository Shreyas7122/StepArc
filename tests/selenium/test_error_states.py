"""
Error state tests — AI advisor 500/abort, meal analysis 500, cardio analysis 500.
Mirrors: tests/user-flows/error-states.spec.js
"""
import json
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import navigate_tab, wait_text, fill_input, click_button_text, text_visible
from helpers.api_mocks import override_ai_advice_error, override_ai_advice_abort


# ── AI Advisor Error States ────────────────────────────────────────────────────

class TestAIAdvisorErrors:
    def test_shows_error_message_on_500_from_ai_advice(self, driver):
        """Override the interceptor to 500 *before* the app fixture loads the page."""
        from conftest import BASE_URL, SUPABASE_LS_KEY, MOCK_AUTH_PAYLOAD
        import time
        from helpers.api_mocks import setup_api_mocks, _json_resp

        # Set up base mocks first, then override ai-advice to 500
        setup_api_mocks(driver)

        def ai_error_interceptor(request):
            url = request.url
            method = request.method.upper()
            if "/ai-advice" in url:
                request.create_response(**_json_resp(
                    {"detail": "Internal server error — Gemini quota exceeded"}, status=500
                ))
            elif "/auth/v1/session" in url:
                from helpers.api_mocks import MOCK_SESSION
                request.create_response(**_json_resp(MOCK_SESSION))
            elif "/auth/v1/user" in url:
                from helpers.api_mocks import MOCK_USER
                request.create_response(**_json_resp(MOCK_USER))
            elif "/auth/v1/token" in url:
                from helpers.api_mocks import MOCK_SESSION
                request.create_response(**_json_resp(MOCK_SESSION))
            elif "/auth/v1/logout" in url:
                request.create_response(**_json_resp({}))
            elif "/rest/v1/user_settings" in url:
                if method == "GET":
                    from helpers.api_mocks import MOCK_SETTINGS
                    request.create_response(**_json_resp(MOCK_SETTINGS))
                else:
                    request.create_response(**_json_resp({"success": True}))
            elif "/rest/v1/daily_logs" in url:
                if method == "GET":
                    from helpers.api_mocks import MOCK_DAILY_LOGS
                    request.create_response(**_json_resp(MOCK_DAILY_LOGS))
                else:
                    request.create_response(**_json_resp({"success": True}))
            elif "/analyze-meal" in url:
                from helpers.api_mocks import MOCK_ANALYZE_MEAL
                request.create_response(**_json_resp(MOCK_ANALYZE_MEAL))
            elif "/analyze-cardio" in url:
                from helpers.api_mocks import MOCK_ANALYZE_CARDIO
                request.create_response(**_json_resp(MOCK_ANALYZE_CARDIO))

        driver.request_interceptor = ai_error_interceptor

        # Auth injection
        driver.get(BASE_URL)
        payload = dict(MOCK_AUTH_PAYLOAD)
        payload["expires_at"] = int(time.time()) + 3600
        driver.execute_script(
            "window.localStorage.setItem(arguments[0], arguments[1]);",
            SUPABASE_LS_KEY,
            json.dumps(payload),
        )
        driver.refresh()

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "header h1"))
        )

        click_button_text(driver, "ask gemini")

        # Should show the server error detail
        WebDriverWait(driver, 6).until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'gemini quota exceeded')]")
            )
        )

    def test_shows_connection_error_when_ai_advice_aborted(self, driver):
        from conftest import BASE_URL, SUPABASE_LS_KEY, MOCK_AUTH_PAYLOAD
        import time
        from helpers.api_mocks import setup_api_mocks, _json_resp

        setup_api_mocks(driver)

        def abort_interceptor(request):
            url = request.url
            method = request.method.upper()
            if "/ai-advice" in url:
                request.abort()
            elif "/auth/v1/session" in url:
                from helpers.api_mocks import MOCK_SESSION
                request.create_response(**_json_resp(MOCK_SESSION))
            elif "/auth/v1/user" in url:
                from helpers.api_mocks import MOCK_USER
                request.create_response(**_json_resp(MOCK_USER))
            elif "/auth/v1/token" in url:
                from helpers.api_mocks import MOCK_SESSION
                request.create_response(**_json_resp(MOCK_SESSION))
            elif "/auth/v1/logout" in url:
                request.create_response(**_json_resp({}))
            elif "/rest/v1/user_settings" in url:
                if method == "GET":
                    from helpers.api_mocks import MOCK_SETTINGS
                    request.create_response(**_json_resp(MOCK_SETTINGS))
                else:
                    request.create_response(**_json_resp({"success": True}))
            elif "/rest/v1/daily_logs" in url:
                if method == "GET":
                    from helpers.api_mocks import MOCK_DAILY_LOGS
                    request.create_response(**_json_resp(MOCK_DAILY_LOGS))
                else:
                    request.create_response(**_json_resp({"success": True}))
            elif "/analyze-meal" in url:
                from helpers.api_mocks import MOCK_ANALYZE_MEAL
                request.create_response(**_json_resp(MOCK_ANALYZE_MEAL))
            elif "/analyze-cardio" in url:
                from helpers.api_mocks import MOCK_ANALYZE_CARDIO
                request.create_response(**_json_resp(MOCK_ANALYZE_CARDIO))

        driver.request_interceptor = abort_interceptor

        driver.get(BASE_URL)
        payload = dict(MOCK_AUTH_PAYLOAD)
        payload["expires_at"] = int(time.time()) + 3600
        driver.execute_script(
            "window.localStorage.setItem(arguments[0], arguments[1]);",
            SUPABASE_LS_KEY,
            json.dumps(payload),
        )
        driver.refresh()

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "header h1"))
        )

        click_button_text(driver, "ask gemini")

        WebDriverWait(driver, 6).until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'cannot reach')]")
            )
        )

    def test_ask_gemini_button_re_enabled_after_error(self, app):
        """Use the app fixture (base mocks) and override to abort after load."""
        override_ai_advice_abort(app)
        click_button_text(app, "ask gemini")

        WebDriverWait(app, 6).until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'cannot reach')]")
            )
        )

        ask_btn = app.find_element(
            By.XPATH,
            "//button[contains(translate(normalize-space(.), "
            "'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "
            "'ask gemini')]",
        )
        assert ask_btn.is_enabled(), "ASK GEMINI button should be re-enabled after error"

    def test_result_panel_closeable_after_error(self, app):
        override_ai_advice_abort(app)
        click_button_text(app, "ask gemini")

        # Wait for error text
        WebDriverWait(app, 6).until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'cannot reach')]")
            )
        )

        # Close the panel — find the × button inside the advice panel
        advice_panel = WebDriverWait(app, 3).until(
            EC.presence_of_element_located(
                (By.XPATH,
                 "//div[contains(., \"Gemini's Advice\") or contains(., 'cannot reach')]")
            )
        )
        close_btn = advice_panel.find_elements(By.TAG_NAME, "button")[-1]
        close_btn.click()

        WebDriverWait(app, 3).until_not(
            EC.presence_of_element_located(
                (By.XPATH,
                 "//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'cannot reach')]")
            )
        )


# ── AI Meal Analysis Errors ────────────────────────────────────────────────────

class TestAIMealAnalysisErrors:
    def test_shows_error_when_analyze_meal_returns_500(self, driver):
        from conftest import BASE_URL, SUPABASE_LS_KEY, MOCK_AUTH_PAYLOAD
        import time
        from helpers.api_mocks import setup_api_mocks, _json_resp

        setup_api_mocks(driver)

        def meal_error_interceptor(request):
            url = request.url
            method = request.method.upper()
            if "/analyze-meal" in url:
                request.create_response(**_json_resp(
                    {"detail": "AI model unavailable"}, status=500
                ))
            elif "/auth/v1/session" in url:
                from helpers.api_mocks import MOCK_SESSION
                request.create_response(**_json_resp(MOCK_SESSION))
            elif "/auth/v1/user" in url:
                from helpers.api_mocks import MOCK_USER
                request.create_response(**_json_resp(MOCK_USER))
            elif "/auth/v1/token" in url:
                from helpers.api_mocks import MOCK_SESSION
                request.create_response(**_json_resp(MOCK_SESSION))
            elif "/auth/v1/logout" in url:
                request.create_response(**_json_resp({}))
            elif "/rest/v1/user_settings" in url:
                if method == "GET":
                    from helpers.api_mocks import MOCK_SETTINGS
                    request.create_response(**_json_resp(MOCK_SETTINGS))
                else:
                    request.create_response(**_json_resp({"success": True}))
            elif "/rest/v1/daily_logs" in url:
                if method == "GET":
                    from helpers.api_mocks import MOCK_DAILY_LOGS
                    request.create_response(**_json_resp(MOCK_DAILY_LOGS))
                else:
                    request.create_response(**_json_resp({"success": True}))
            elif "/ai-advice" in url:
                from helpers.api_mocks import MOCK_AI_ADVICE
                request.create_response(**_json_resp(MOCK_AI_ADVICE))
            elif "/analyze-cardio" in url:
                from helpers.api_mocks import MOCK_ANALYZE_CARDIO
                request.create_response(**_json_resp(MOCK_ANALYZE_CARDIO))

        driver.request_interceptor = meal_error_interceptor

        driver.get(BASE_URL)
        payload = dict(MOCK_AUTH_PAYLOAD)
        payload["expires_at"] = int(time.time()) + 3600
        driver.execute_script(
            "window.localStorage.setItem(arguments[0], arguments[1]);",
            SUPABASE_LS_KEY,
            json.dumps(payload),
        )
        driver.refresh()

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "header h1"))
        )

        # The AI meal input lives on Today tab — find the textarea/input
        ai_input = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located(
                (By.XPATH,
                 "//textarea | //input[contains(@placeholder,'what did you eat') "
                 "or contains(@placeholder,'meal') or contains(@placeholder,'ate')]")
            )
        )
        ai_input.clear()
        ai_input.send_keys("3 boiled eggs and a banana")
        click_button_text(driver, "analyze meal")

        WebDriverWait(driver, 6).until(
            EC.presence_of_element_located(
                (By.XPATH,
                 "//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'ai model unavailable') or "
                 "contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'error') or "
                 "contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'failed')]")
            )
        )


# ── AI Cardio Analysis Errors ──────────────────────────────────────────────────

class TestAICardioAnalysisErrors:
    def test_shows_error_when_analyze_cardio_returns_500(self, driver):
        from conftest import BASE_URL, SUPABASE_LS_KEY, MOCK_AUTH_PAYLOAD
        import time
        from helpers.api_mocks import setup_api_mocks, _json_resp

        setup_api_mocks(driver)

        def cardio_error_interceptor(request):
            url = request.url
            method = request.method.upper()
            if "/analyze-cardio" in url:
                request.create_response(**_json_resp(
                    {"detail": "Cardio model error"}, status=500
                ))
            elif "/auth/v1/session" in url:
                from helpers.api_mocks import MOCK_SESSION
                request.create_response(**_json_resp(MOCK_SESSION))
            elif "/auth/v1/user" in url:
                from helpers.api_mocks import MOCK_USER
                request.create_response(**_json_resp(MOCK_USER))
            elif "/auth/v1/token" in url:
                from helpers.api_mocks import MOCK_SESSION
                request.create_response(**_json_resp(MOCK_SESSION))
            elif "/auth/v1/logout" in url:
                request.create_response(**_json_resp({}))
            elif "/rest/v1/user_settings" in url:
                if method == "GET":
                    from helpers.api_mocks import MOCK_SETTINGS
                    request.create_response(**_json_resp(MOCK_SETTINGS))
                else:
                    request.create_response(**_json_resp({"success": True}))
            elif "/rest/v1/daily_logs" in url:
                if method == "GET":
                    from helpers.api_mocks import MOCK_DAILY_LOGS
                    request.create_response(**_json_resp(MOCK_DAILY_LOGS))
                else:
                    request.create_response(**_json_resp({"success": True}))
            elif "/ai-advice" in url:
                from helpers.api_mocks import MOCK_AI_ADVICE
                request.create_response(**_json_resp(MOCK_AI_ADVICE))
            elif "/analyze-meal" in url:
                from helpers.api_mocks import MOCK_ANALYZE_MEAL
                request.create_response(**_json_resp(MOCK_ANALYZE_MEAL))

        driver.request_interceptor = cardio_error_interceptor

        driver.get(BASE_URL)
        payload = dict(MOCK_AUTH_PAYLOAD)
        payload["expires_at"] = int(time.time()) + 3600
        driver.execute_script(
            "window.localStorage.setItem(arguments[0], arguments[1]);",
            SUPABASE_LS_KEY,
            json.dumps(payload),
        )
        driver.refresh()

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "header h1"))
        )

        navigate_tab(driver, "Training")
        wait_text(driver, "Gym Routine")

        cardio_inp = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located(
                (By.XPATH,
                 "//textarea | //input[contains(@placeholder,'what did you do') "
                 "or contains(@placeholder,'walked') or contains(@placeholder,'ran')]")
            )
        )
        cardio_inp.clear()
        cardio_inp.send_keys("ran 5km in 25 mins")
        click_button_text(driver, "analyze cardio")

        WebDriverWait(driver, 6).until(
            EC.presence_of_element_located(
                (By.XPATH,
                 "//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'cardio model error') or "
                 "contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'error') or "
                 "contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'failed')]")
            )
        )
