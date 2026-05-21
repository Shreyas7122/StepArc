"""
Quick Log → DraftMealReview → Confirm / Cancel
Quick Workout → DraftWorkoutReview → Confirm / Cancel
Mirrors: tests/user-flows/draft-meal-flow.spec.js
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import (
    navigate_tab, wait_text, fill_input, click_button_text,
    text_visible,
)


# ── Food Draft Flow ────────────────────────────────────────────────────────────

class TestDraftMealFlow:
    @pytest.fixture(autouse=True)
    def on_nutrition(self, app):
        navigate_tab(app, "Nutrition")
        wait_text(app, "01 · QUICK LOG")

    def _click_first_quick_meal(self, driver):
        """Click 'Meal 1: Pre-Workout' button in the Quick Log section."""
        btn = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(., 'Pre-Workout')]")
            )
        )
        btn.click()

    def test_clicking_quick_meal_opens_draft_review(self, app):
        self._click_first_quick_meal(app)
        wait_text(app, "REVIEW MEAL")
        assert text_visible(app, "REVIEW MEAL")

    def test_draft_review_shows_meal_food_items(self, app):
        self._click_first_quick_meal(app)
        wait_text(app, "REVIEW MEAL")
        # Pre-Workout meal → Whole Egg (Raw) + Banana (Raw)
        assert text_visible(app, "Whole Egg (Raw)")
        assert text_visible(app, "Banana (Raw)")

    def test_can_change_item_amount_in_draft(self, app):
        self._click_first_quick_meal(app)
        wait_text(app, "REVIEW MEAL")

        # First amount input = Whole Egg amount (default 100g)
        amount_inputs = app.find_elements(By.CSS_SELECTOR, "input[type='number']")
        # Filter to item amount inputs (those with ~64px width style or value 100)
        item_input = next(
            (i for i in amount_inputs if i.get_attribute("value") in ("100", "150")),
            amount_inputs[0],
        )
        item_input.clear()
        item_input.send_keys("150")
        assert item_input.get_attribute("value") == "150"

    def test_can_remove_item_from_draft(self, app):
        self._click_first_quick_meal(app)
        wait_text(app, "Whole Egg (Raw)")

        # Each item row has a red × remove button
        # Find the remove button inside the "Whole Egg" row
        egg_row = app.find_element(
            By.XPATH,
            "//div[contains(., 'Whole Egg (Raw)') and .//input[@type='number']]"
        )
        remove_btn = egg_row.find_element(By.XPATH, ".//button[last()]")
        remove_btn.click()

        WebDriverWait(app, 3).until_not(
            EC.presence_of_element_located(
                (By.XPATH, "//*[normalize-space(text())='Whole Egg (Raw)']")
            )
        )

    def test_confirming_logs_food_and_navigates_to_dashboard(self, app):
        self._click_first_quick_meal(app)
        wait_text(app, "REVIEW MEAL")

        click_button_text(app, "confirm")

        wait_text(app, "MACROS TODAY", timeout=5)
        # Consumed should be non-zero (Egg 100g + Banana 150g ≈ 277 kcal)
        consumed_div = app.find_element(
            By.XPATH, "//div[contains(text(),'kcal eaten')]/.."
        )
        values = [
            int(d.text) for d in consumed_div.find_elements(By.XPATH, ".//div")
            if d.text.strip().lstrip("0").isdigit() and int(d.text) > 0
        ]
        assert any(v > 0 for v in values), "CONSUMED should be > 0 after confirming draft"

    def test_cancel_returns_to_food_tab_with_no_logs(self, app):
        self._click_first_quick_meal(app)
        wait_text(app, "REVIEW MEAL")

        # The header × button inside DraftMealReview
        cancel_btn = WebDriverWait(app, 5).until(
            EC.element_to_be_clickable(
                (By.XPATH,
                 "//div[.//div[contains(text(),'REVIEW MEAL')]]//button[last()]")
            )
        )
        cancel_btn.click()

        wait_text(app, "01 · QUICK LOG", timeout=4)

        navigate_tab(app, "Logs")
        wait_text(app, "Food Log")
        assert text_visible(app, "No food logged yet.")

    def test_can_add_extra_item_to_draft(self, app):
        self._click_first_quick_meal(app)
        wait_text(app, "Add Extra Item")

        extra_search = app.find_element(
            By.XPATH, "//input[@placeholder='Search food… e.g. paneer']"
        )
        extra_search.click()
        extra_search.send_keys("Oats")

        first_result = WebDriverWait(app, 4).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, "[role='listbox'] div")
            )
        )
        first_result.click()

        grams_input = app.find_element(
            By.XPATH, "//input[@placeholder='grams']"
        )
        grams_input.clear()
        grams_input.send_keys("60")

        # Submit the add-item form (the + button inside the form)
        add_btn = app.find_element(
            By.XPATH, "//form[.//input[@placeholder='grams']]//button"
        )
        add_btn.click()

        wait_text(app, "Oats (Dry/Raw)", timeout=5)


# ── Workout Draft Flow ─────────────────────────────────────────────────────────

class TestDraftWorkoutFlow:
    @pytest.fixture(autouse=True)
    def on_training(self, app):
        navigate_tab(app, "Training")
        wait_text(app, "Gym Routine")

    def _click_monday_workout(self, driver):
        btn = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(., 'Monday')]")
            )
        )
        btn.click()

    def test_clicking_quick_workout_opens_draft_review(self, app):
        self._click_monday_workout(app)
        wait_text(app, "REVIEW WORKOUT")
        assert text_visible(app, "REVIEW WORKOUT")

    def test_draft_workout_lists_exercises(self, app):
        self._click_monday_workout(app)
        wait_text(app, "REVIEW WORKOUT")
        assert text_visible(app, "Deadlift")
        assert text_visible(app, "Lat Pull Down")

    def test_confirming_workout_navigates_to_dashboard_with_burn(self, app):
        self._click_monday_workout(app)
        wait_text(app, "REVIEW WORKOUT")
        click_button_text(app, "confirm")

        wait_text(app, "MACROS TODAY", timeout=5)
        # BURNED / kcal active should be > 0
        burned_div = app.find_element(
            By.XPATH, "//div[contains(text(),'kcal active')]/.."
        )
        vals = [
            int(d.text) for d in burned_div.find_elements(By.XPATH, ".//div")
            if d.text.strip().isdigit()
        ]
        assert any(v > 0 for v in vals), "BURNED should be > 0 after confirming workout"

    def test_cancel_returns_to_training_tab(self, app):
        self._click_monday_workout(app)
        wait_text(app, "REVIEW WORKOUT")

        cancel_btn = WebDriverWait(app, 5).until(
            EC.element_to_be_clickable(
                (By.XPATH,
                 "//div[.//div[contains(text(),'REVIEW WORKOUT')]]//button[last()]")
            )
        )
        cancel_btn.click()

        wait_text(app, "Gym Routine", timeout=4)
