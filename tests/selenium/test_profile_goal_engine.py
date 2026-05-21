"""
Profile modal + BMR-driven goal engine.
Mirrors: tests/user-flows/profile-goal-engine.spec.js
"""
import math
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import navigate_tab, wait_text, fill_input, click_button_text, text_visible

# ── Goal constants (mirror src/calc.js) ────────────────────────────────────────
# Mock settings: male, 23y, 175cm, 75.5kg, maintenance
# BMR = 10*75.5 + 6.25*175 - 5*23 + 5  =  755 + 1093.75 - 115 + 5  =  1738.75  → 1739
# GOAL_OFFSETS: maintenance=0, fat_loss=-400, bulk=+350

def _calc_bmr(weight_kg, height_cm, age):
    return round(10 * weight_kg + 6.25 * height_cm - 5 * age + 5)

MOCK_BMR        = _calc_bmr(75.5, 175, 23)
MAINTENANCE_CAL = MOCK_BMR          # offset 0
FAT_LOSS_CAL    = MOCK_BMR - 400
BULK_CAL        = MOCK_BMR + 350
FIBRE_GOAL      = round(MAINTENANCE_CAL / 1000 * 14)


# ── Helpers ────────────────────────────────────────────────────────────────────

def open_profile(driver):
    """Open the user-profile / settings dropdown and navigate to Edit Profile."""
    toggle_btn = WebDriverWait(driver, 5).until(
        EC.element_to_be_clickable(
            (By.XPATH,
             "//button[@aria-label='Toggle user profile and settings menu'] | "
             "//button[contains(@aria-label,'profile') or contains(@aria-label,'settings') "
             "or contains(@aria-label,'user')]")
        )
    )
    toggle_btn.click()

    edit_btn = WebDriverWait(driver, 3).until(
        EC.element_to_be_clickable(
            (By.XPATH,
             "//button[contains(normalize-space(.), 'Edit Profile')] | "
             "//*[contains(normalize-space(.), 'Edit Profile')]")
        )
    )
    edit_btn.click()
    wait_text(driver, "MY PROFILE", timeout=4)


# ── BMR-Driven Goal Engine ─────────────────────────────────────────────────────

class TestBMRGoalEngine:
    def test_dashboard_shows_correct_maintenance_calories(self, app):
        wait_text(app, "CALORIES LEFT")
        assert text_visible(app, str(MAINTENANCE_CAL)), \
            f"Expected MAINTENANCE_CAL={MAINTENANCE_CAL} visible on dashboard"

    def test_bmr_breakdown_chips_visible(self, app):
        assert text_visible(app, "BMR")
        assert text_visible(app, "Base goal")
        assert text_visible(app, "Activity")

    def test_fibre_goal_matches_dri_formula(self, app):
        # Fibre macro bar shows "eaten / Xg" where X = round(goal/1000 * 14)
        wait_text(app, "Fibre")
        assert text_visible(app, f"/ {FIBRE_GOAL}g"), \
            f"Expected fibre goal '/ {FIBRE_GOAL}g' to be visible"

    def test_fat_loss_goal_type_lowers_calorie_goal(self, app):
        open_profile(app)

        # Select fat_loss from the goal_type dropdown
        goal_select = WebDriverWait(app, 4).until(
            EC.presence_of_element_located(
                (By.XPATH,
                 "//select[contains(@id,'goal') or contains(@name,'goal') "
                 "or contains(@aria-label,'goal')]")
            )
        )
        from selenium.webdriver.support.select import Select
        Select(goal_select).select_by_value("fat_loss")

        click_button_text(app, "save")

        # Modal should close
        WebDriverWait(app, 5).until_not(
            EC.presence_of_element_located(
                (By.XPATH, "//*[normalize-space(text())='MY PROFILE']")
            )
        )

        # Dashboard should show the lower fat-loss calorie target
        wait_text(app, str(FAT_LOSS_CAL), timeout=4)
        assert text_visible(app, str(FAT_LOSS_CAL))

    def test_bulk_goal_type_raises_calorie_goal(self, app):
        open_profile(app)

        goal_select = WebDriverWait(app, 4).until(
            EC.presence_of_element_located(
                (By.XPATH,
                 "//select[contains(@id,'goal') or contains(@name,'goal') "
                 "or contains(@aria-label,'goal')]")
            )
        )
        from selenium.webdriver.support.select import Select
        Select(goal_select).select_by_value("bulk")

        click_button_text(app, "save")

        WebDriverWait(app, 5).until_not(
            EC.presence_of_element_located(
                (By.XPATH, "//*[normalize-space(text())='MY PROFILE']")
            )
        )

        wait_text(app, str(BULK_CAL), timeout=4)
        assert text_visible(app, str(BULK_CAL))

    def test_updating_weight_recalculates_protein_goal(self, app):
        open_profile(app)

        weight_inp = WebDriverWait(app, 4).until(
            EC.presence_of_element_located(
                (By.XPATH,
                 "//input[@type='number' and ("
                 "@placeholder='75.5' or @value='75.5' or "
                 "contains(@id,'weight') or contains(@name,'weight') or "
                 "contains(@aria-label,'weight'))]")
            )
        )
        weight_inp.clear()
        weight_inp.send_keys("90")

        click_button_text(app, "save")

        WebDriverWait(app, 5).until_not(
            EC.presence_of_element_located(
                (By.XPATH, "//*[normalize-space(text())='MY PROFILE']")
            )
        )

        # New protein goal = 2 g/kg * 90 kg = 180 g
        wait_text(app, "/ 180g", timeout=4)
        assert text_visible(app, "/ 180g")


# ── Profile Modal Structural Checks ───────────────────────────────────────────

class TestProfileModalStructure:
    def test_modal_opens_with_my_profile_heading(self, app):
        open_profile(app)
        assert text_visible(app, "MY PROFILE")

    def test_modal_prefills_age_height_weight_from_settings(self, app):
        open_profile(app)
        # Mock settings: age=23, height_cm=175, weight_kg=75.5
        age_inp = app.find_element(
            By.XPATH,
            "//input[@value='23' or @placeholder='23'] | "
            "//input[contains(@id,'age') or contains(@name,'age') or "
            "contains(@aria-label,'age')]"
        )
        assert age_inp.get_attribute("value") == "23"

        height_inp = app.find_element(
            By.XPATH,
            "//input[@value='175' or @placeholder='175'] | "
            "//input[contains(@id,'height') or contains(@name,'height') or "
            "contains(@aria-label,'height')]"
        )
        assert height_inp.get_attribute("value") == "175"

        weight_inp = app.find_element(
            By.XPATH,
            "//input[@value='75.5' or @placeholder='75.5'] | "
            "//input[contains(@id,'weight') or contains(@name,'weight') or "
            "contains(@aria-label,'weight')]"
        )
        assert weight_inp.get_attribute("value") == "75.5"

    def test_cancel_keeps_dashboard_visible(self, app):
        open_profile(app)

        click_button_text(app, "cancel")

        WebDriverWait(app, 4).until_not(
            EC.presence_of_element_located(
                (By.XPATH, "//*[normalize-space(text())='MY PROFILE']")
            )
        )
        assert text_visible(app, "MACROS TODAY")

    def test_diet_plan_tab_accessible_from_profile_modal(self, app):
        open_profile(app)

        diet_tab = WebDriverWait(app, 4).until(
            EC.element_to_be_clickable(
                (By.XPATH,
                 "//button[contains(translate(normalize-space(.), "
                 "'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "
                 "'diet plan')]")
            )
        )
        diet_tab.click()

        # Should show either the AI plan generate button or existing meal names
        WebDriverWait(app, 4).until(
            EC.presence_of_element_located(
                (By.XPATH,
                 "//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'generate ai plan') or "
                 "contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'pre-workout')]")
            )
        )

    def test_training_plan_tab_accessible_from_profile_modal(self, app):
        open_profile(app)

        training_tab = WebDriverWait(app, 4).until(
            EC.element_to_be_clickable(
                (By.XPATH,
                 "//button[contains(translate(normalize-space(.), "
                 "'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "
                 "'training plan')]")
            )
        )
        training_tab.click()

        WebDriverWait(app, 4).until(
            EC.presence_of_element_located(
                (By.XPATH,
                 "//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'generate ai plan') or "
                 "contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'monday') or "
                 "contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
                 "'abcdefghijklmnopqrstuvwxyz'), 'gym')]")
            )
        )
