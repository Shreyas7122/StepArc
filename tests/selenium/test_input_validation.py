"""
Input validation guards — food, workout, and steps forms.
Mirrors: tests/user-flows/input-validation.spec.js
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import (
    navigate_tab, wait_text, fill_input, click_button_text,
    text_visible,
)


# ── Food Tab Validation ────────────────────────────────────────────────────────

class TestFoodInputValidation:
    @pytest.fixture(autouse=True)
    def on_nutrition(self, app):
        navigate_tab(app, "Nutrition")
        wait_text(app, "02 · FROM DATABASE")

    def _select_first_food(self, driver, query):
        """Type in the food search and click the first dropdown result."""
        search = fill_input(driver, "Search food… e.g. oats", query)
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[role='listbox'] div"))
        ).click()

    def test_add_food_blocked_with_empty_amount(self, app):
        self._select_first_food(app, "Banana")
        click_button_text(app, "add food")
        # No navigation — still on Nutrition tab
        assert text_visible(app, "02 · FROM DATABASE")

        navigate_tab(app, "Logs")
        wait_text(app, "Food Log")
        assert text_visible(app, "No food logged yet.")

    def test_add_food_blocked_when_amount_is_zero(self, app):
        self._select_first_food(app, "Oats")
        # Fill 0 in the amount input (label "Amount (grams)" or just the number input)
        try:
            amount_inp = app.find_element(By.XPATH, "//input[@type='number']")
        except Exception:
            amount_inp = app.find_elements(By.TAG_NAME, "input")[-1]
        amount_inp.clear()
        amount_inp.send_keys("0")

        click_button_text(app, "add food")
        assert text_visible(app, "02 · FROM DATABASE")

    def test_add_food_blocked_with_negative_amount(self, app):
        self._select_first_food(app, "Banana")
        try:
            amount_inp = app.find_element(By.XPATH, "//input[@type='number']")
        except Exception:
            amount_inp = app.find_elements(By.TAG_NAME, "input")[-1]
        amount_inp.clear()
        amount_inp.send_keys("-50")

        click_button_text(app, "add food")
        assert text_visible(app, "02 · FROM DATABASE")

    def test_custom_food_submit_blocked_with_whitespace_name(self, app):
        fill_input(app, "e.g. Low Fat Paneer, Chicken Subji…", "   ")
        fill_input(app, "e.g. 180", "250")

        log_btn = app.find_element(
            By.XPATH,
            "//button[contains(translate(normalize-space(.), "
            "'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "
            "'log custom food')]",
        )
        assert not log_btn.is_enabled(), "Button should be disabled with whitespace-only name"


# ── Workout Tab Validation ─────────────────────────────────────────────────────

class TestWorkoutInputValidation:
    @pytest.fixture(autouse=True)
    def on_training(self, app):
        navigate_tab(app, "Training")
        wait_text(app, "02 · SINGLE EXERCISE")

    def _select_exercise(self, driver, query):
        fill_input(driver, "Search exercise… e.g. incline", query)
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[role='listbox'] div"))
        ).click()

    def test_log_exercise_blocked_with_empty_sets(self, app):
        self._select_exercise(app, "Deadlift")
        click_button_text(app, "log exercise")
        assert text_visible(app, "02 · SINGLE EXERCISE")

    def test_log_exercise_blocked_when_sets_is_zero(self, app):
        self._select_exercise(app, "Squat")
        fill_input(app, "e.g. 4", "0")
        click_button_text(app, "log exercise")
        assert text_visible(app, "02 · SINGLE EXERCISE")

    def test_calorie_preview_only_shows_when_sets_positive(self, app):
        # No preview before any entry
        assert not text_visible(app, "est. burn"), \
            "Calorie preview should not show before exercise is selected"

        self._select_exercise(app, "Deadlift")
        fill_input(app, "e.g. 4", "3")

        # Preview should now be visible
        wait_text(app, "est. burn", timeout=4)
        assert text_visible(app, "est. burn")


# ── Steps Validation ───────────────────────────────────────────────────────────

class TestStepsInputValidation:
    @pytest.fixture(autouse=True)
    def on_training(self, app):
        navigate_tab(app, "Training")
        wait_text(app, "03 · DAILY STEPS")

    def test_update_steps_blocked_with_empty_field(self, app):
        click_button_text(app, "update steps")
        assert text_visible(app, "03 · DAILY STEPS")

    def test_calorie_preview_for_12000_steps(self, app):
        # 12000 * 0.04 = 480 kcal
        fill_input(app, "e.g. 14000", "12000")
        wait_text(app, "480 kcal", timeout=3)
        assert text_visible(app, "480 kcal")
