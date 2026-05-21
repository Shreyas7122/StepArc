"""
Steps Tracking + Dashboard Calorie Math.
Mirrors: tests/user-flows/steps-and-dashboard.spec.js
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import (
    navigate_tab, wait_text, fill_input, click_button_text,
    text_visible,
)

STEP_CALORIES_MULTIPLIER = 0.04   # mirrors src/data.js


# ── Steps Tracking ─────────────────────────────────────────────────────────────

class TestStepsTracking:
    @pytest.fixture(autouse=True)
    def on_training(self, app):
        navigate_tab(app, "Training")
        wait_text(app, "03 · DAILY STEPS")

    def test_entering_steps_shows_calorie_burn_preview(self, app):
        fill_input(app, "e.g. 14000", "10000")
        expected_kcal = round(10000 * STEP_CALORIES_MULTIPLIER)
        wait_text(app, f"{expected_kcal} kcal")
        assert text_visible(app, f"{expected_kcal} kcal")

    def test_submitting_steps_navigates_to_dashboard(self, app):
        fill_input(app, "e.g. 14000", "8000")
        click_button_text(app, "update steps")

        wait_text(app, "DAILY STEPS", timeout=4)
        # The dashboard shows the rounded step count — "8,000" or plain "8000"
        page_text = app.find_element(By.TAG_NAME, "body").text
        assert "8,000" in page_text or "8000" in page_text

    def test_step_burn_appears_in_burned_chip(self, app):
        fill_input(app, "e.g. 14000", "10000")
        click_button_text(app, "update steps")

        wait_text(app, "DAILY STEPS", timeout=4)
        # Locate the DAILY STEPS card and check for a non-zero kcal value
        steps_section = WebDriverWait(app, 5).until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(), 'DAILY STEPS')]/..")
            )
        )
        section_text = steps_section.text
        # Should contain a non-zero number representing burned calories
        digits = [int(tok) for tok in section_text.split() if tok.isdigit()]
        assert any(d > 0 for d in digits), "Expected a positive step burn value"

    def test_calorie_preview_shows_correctly_for_typical_count(self, app):
        # 12000 * 0.04 = 480 kcal
        fill_input(app, "e.g. 14000", "12000")
        wait_text(app, "480 kcal")
        assert text_visible(app, "480 kcal")


# ── Dashboard Calorie Math ─────────────────────────────────────────────────────

class TestDashboardCalorieMath:
    def test_calories_left_is_positive_on_fresh_day(self, app):
        wait_text(app, "CALORIES LEFT")
        # Locate the CALORIES LEFT hero number and verify it's positive
        cal_container = WebDriverWait(app, 5).until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(), 'CALORIES LEFT')]/..")
            )
        )
        nums = [
            int(tok.replace(",", ""))
            for tok in cal_container.text.split()
            if tok.replace(",", "").isdigit()
        ]
        assert any(n > 0 for n in nums), "CALORIES LEFT should be positive on a fresh day"

    def test_consumed_increases_after_logging_custom_food(self, app):
        navigate_tab(app, "Nutrition")
        wait_text(app, "03 · CUSTOM ENTRY")
        fill_input(app, "e.g. Low Fat Paneer, Chicken Subji…", "Test Meal")
        fill_input(app, "e.g. 180", "400")
        click_button_text(app, "log custom food")

        wait_text(app, "kcal eaten", timeout=5)
        consumed_section = app.find_element(
            By.XPATH, "//div[contains(text(), 'kcal eaten')]/.."
        )
        assert "400" in consumed_section.text, "CONSUMED section should contain '400'"

    def test_macros_today_shows_all_four_rows_including_fibre(self, app):
        wait_text(app, "MACROS TODAY")
        assert text_visible(app, "Protein")
        assert text_visible(app, "Carbs")
        assert text_visible(app, "Fats")
        assert text_visible(app, "Fibre")

    def test_over_goal_label_when_calories_exceed_goal(self, app):
        navigate_tab(app, "Nutrition")
        wait_text(app, "03 · CUSTOM ENTRY")
        fill_input(app, "e.g. Low Fat Paneer, Chicken Subji…", "Enormous Meal")
        fill_input(app, "e.g. 180", "9999")
        click_button_text(app, "log custom food")

        wait_text(app, "OVER GOAL", timeout=4)
        assert text_visible(app, "OVER GOAL")

    def test_bmr_breakdown_chips_visible_on_hero_card(self, app):
        assert text_visible(app, "BMR")
        assert text_visible(app, "Base goal")
        assert text_visible(app, "Activity")
