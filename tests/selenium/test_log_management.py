"""
Log Management — CRUD for food, workout, and cardio logs.
Mirrors: tests/user-flows/log-management.spec.js
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import (
    navigate_tab, wait_text, fill_input, click_button_text,
    text_visible, log_custom_food, log_single_exercise,
)


# ── Food Logs ──────────────────────────────────────────────────────────────────

class TestFoodLogs:
    def test_empty_state_before_any_food_is_logged(self, app):
        navigate_tab(app, "Logs")
        wait_text(app, "Food Log")
        assert text_visible(app, "No food logged yet.")

    def test_logged_food_appears_in_list(self, app):
        log_custom_food(app, "Grilled Paneer", 180)
        navigate_tab(app, "Logs")
        wait_text(app, "Food Log")
        assert text_visible(app, "Grilled Paneer")

    def test_deleting_food_removes_it_from_list(self, app):
        log_custom_food(app, "Delete Me Food", 100)
        navigate_tab(app, "Logs")
        wait_text(app, "Delete Me Food")

        # The log row for an AI/custom entry has only a delete button (no edit)
        row = WebDriverWait(app, 5).until(
            EC.presence_of_element_located(
                (By.XPATH, "//div[contains(., 'Delete Me Food') and .//span[text()='AI']]")
            )
        )
        delete_btn = row.find_elements(By.TAG_NAME, "button")[-1]
        delete_btn.click()

        WebDriverWait(app, 4).until_not(
            EC.presence_of_element_located(
                (By.XPATH, "//*[normalize-space(text())='Delete Me Food']")
            )
        )

    def test_deleting_only_food_shows_empty_state(self, app):
        log_custom_food(app, "Solo Food", 200)
        navigate_tab(app, "Logs")
        wait_text(app, "Solo Food")

        row = WebDriverWait(app, 5).until(
            EC.presence_of_element_located(
                (By.XPATH, "//div[contains(., 'Solo Food') and .//span[text()='AI']]")
            )
        )
        row.find_elements(By.TAG_NAME, "button")[-1].click()

        wait_text(app, "No food logged yet.", timeout=5)

    def test_multiple_food_entries_all_visible(self, app):
        log_custom_food(app, "Morning Oats", 350)

        # Log second food
        navigate_tab(app, "Nutrition")
        wait_text(app, "03 · CUSTOM ENTRY")
        fill_input(app, "e.g. Low Fat Paneer, Chicken Subji…", "Afternoon Paneer")
        fill_input(app, "e.g. 180", "250")
        click_button_text(app, "log custom food")

        navigate_tab(app, "Logs")
        wait_text(app, "Food Log")
        assert text_visible(app, "Morning Oats")
        assert text_visible(app, "Afternoon Paneer")


# ── Workout Logs ───────────────────────────────────────────────────────────────

class TestWorkoutLogs:
    def test_empty_state_before_any_workout(self, app):
        navigate_tab(app, "Logs")
        wait_text(app, "Workout Log")
        assert text_visible(app, "No workout logged yet.")

    def test_logged_workout_shows_sets(self, app):
        log_single_exercise(app, "Deadlift", "4")
        navigate_tab(app, "Logs")
        wait_text(app, "Workout Log")
        assert text_visible(app, "Deadlift")
        assert text_visible(app, "4 sets")

    def test_editing_workout_sets_updates_display(self, app):
        log_single_exercise(app, "Deadlift", "3")
        navigate_tab(app, "Logs")
        wait_text(app, "3 sets")

        workout_row = WebDriverWait(app, 5).until(
            EC.presence_of_element_located(
                (By.XPATH, "//div[contains(., 'Deadlift') and contains(., '3 sets')]")
            )
        )
        # First button in the row = edit (pencil icon)
        edit_btn = workout_row.find_elements(By.TAG_NAME, "button")[0]
        edit_btn.click()

        # Inline sets input appears
        sets_input = WebDriverWait(app, 3).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "input[type='number']")
            )
        )
        sets_input.clear()
        sets_input.send_keys("5")

        # Confirm (✓) button
        confirm_btn = workout_row.find_element(
            By.XPATH, ".//button[contains(@class, 'check') or ./*[name()='svg']]"
        )
        confirm_btn.click()

        wait_text(app, "5 sets", timeout=3)

        # Old value should be gone
        assert not text_visible(
            app, "3 sets"
        ), "Old set count should no longer be visible"

    def test_deleting_workout_removes_it(self, app):
        log_single_exercise(app, "Deadlift", "3")
        navigate_tab(app, "Logs")
        wait_text(app, "Deadlift")

        workout_row = app.find_element(
            By.XPATH, "//div[contains(., 'Deadlift') and contains(., 'sets')]"
        )
        # Last button = delete (red ×)
        workout_row.find_elements(By.TAG_NAME, "button")[-1].click()

        WebDriverWait(app, 4).until_not(
            EC.presence_of_element_located(
                (By.XPATH, "//*[normalize-space(text())='Deadlift']")
            )
        )
        wait_text(app, "No workout logged yet.", timeout=4)


# ── Cardio Logs ────────────────────────────────────────────────────────────────

class TestCardioLogs:
    def test_empty_state_before_any_cardio(self, app):
        navigate_tab(app, "Logs")
        wait_text(app, "Cardio Log")
        assert text_visible(app, "No cardio logged yet.")

    def _log_cardio(self, driver):
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
        cardio_inp.send_keys("walked on treadmill 30 mins")
        click_button_text(driver, "analyze cardio")

        wait_text(driver, "Mocked AI Treadmill Cardio", timeout=6)
        click_button_text(driver, "log cardio")
        wait_text(driver, "MACROS TODAY", timeout=5)

    def test_logged_cardio_appears_with_duration(self, app):
        self._log_cardio(app)
        navigate_tab(app, "Logs")
        wait_text(app, "Cardio Log")
        assert text_visible(app, "Mocked AI Treadmill Cardio")
        assert text_visible(app, "30 min")

    def test_deleting_cardio_removes_it(self, app):
        self._log_cardio(app)
        navigate_tab(app, "Logs")
        wait_text(app, "Mocked AI Treadmill Cardio")

        cardio_row = app.find_element(
            By.XPATH,
            "//div[contains(., 'Mocked AI Treadmill Cardio') and contains(., 'min')]"
        )
        cardio_row.find_elements(By.TAG_NAME, "button")[-1].click()

        WebDriverWait(app, 4).until_not(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(), 'Mocked AI Treadmill Cardio')]")
            )
        )
        wait_text(app, "No cardio logged yet.", timeout=4)
