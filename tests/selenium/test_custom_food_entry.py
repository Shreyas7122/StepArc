"""
03 · Custom Food Entry — Manual Macro Form
Mirrors: tests/user-flows/custom-food-entry.spec.js
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import (
    navigate_tab, wait_text, fill_input, click_button_text,
    text_visible, is_visible,
)


@pytest.fixture(autouse=True)
def on_nutrition_tab(app):
    """Open the Nutrition tab before each test in this module."""
    navigate_tab(app, "Nutrition")
    wait_text(app, "03 · CUSTOM ENTRY")
    return app


# ── Render ─────────────────────────────────────────────────────────────────────

class TestCustomFoodFormRenders:
    def test_section_heading_visible(self, app):
        assert text_visible(app, "03 · CUSTOM ENTRY")
        assert text_visible(app, "Enter Macros")

    def test_all_six_input_fields_present(self, app):
        placeholders = [
            "e.g. Low Fat Paneer, Chicken Subji…",
            "e.g. 180",   # Calories
            "e.g. 20",    # Protein
            "e.g. 4",     # Carbs
            "e.g. 10",    # Fats
            "e.g. 0",     # Fibre
        ]
        for ph in placeholders:
            el = app.find_element(By.XPATH, f"//input[@placeholder='{ph}']")
            assert el.is_displayed(), f"Input with placeholder '{ph}' is not visible"


# ── Disabled-state guards ──────────────────────────────────────────────────────

class TestSubmitButtonGuards:
    def _log_btn(self, driver):
        return driver.find_element(
            By.XPATH,
            "//button[contains(translate(normalize-space(.), "
            "'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "
            "'log custom food')]",
        )

    def test_disabled_when_blank(self, app):
        assert not self._log_btn(app).is_enabled()

    def test_disabled_with_name_only(self, app):
        fill_input(app, "e.g. Low Fat Paneer, Chicken Subji…", "Mystery Snack")
        assert not self._log_btn(app).is_enabled()

    def test_disabled_with_calories_only(self, app):
        fill_input(app, "e.g. 180", "300")
        assert not self._log_btn(app).is_enabled()

    def test_enabled_with_name_and_calories(self, app):
        fill_input(app, "e.g. Low Fat Paneer, Chicken Subji…", "Egg White Omelette")
        fill_input(app, "e.g. 180", "220")
        assert self._log_btn(app).is_enabled()

    def test_disabled_with_whitespace_only_name(self, app):
        fill_input(app, "e.g. Low Fat Paneer, Chicken Subji…", "   ")
        fill_input(app, "e.g. 180", "250")
        assert not self._log_btn(app).is_enabled()


# ── Happy path ─────────────────────────────────────────────────────────────────

class TestCustomFoodSubmission:
    def test_submission_navigates_to_dashboard(self, app):
        fill_input(app, "e.g. Low Fat Paneer, Chicken Subji…", "Low Fat Paneer")
        fill_input(app, "e.g. 180", "180")
        fill_input(app, "e.g. 20", "20")
        fill_input(app, "e.g. 4", "4")
        fill_input(app, "e.g. 10", "10")
        fill_input(app, "e.g. 0", "0")
        click_button_text(app, "log custom food")

        # App auto-navigates to Today tab
        wait_text(app, "MACROS TODAY", timeout=5)

    def test_consumed_card_shows_logged_calories(self, app):
        fill_input(app, "e.g. Low Fat Paneer, Chicken Subji…", "Test Meal")
        fill_input(app, "e.g. 180", "400")
        click_button_text(app, "log custom food")

        wait_text(app, "kcal eaten", timeout=5)
        consumed_section = app.find_element(
            By.XPATH, "//div[contains(text(),'kcal eaten')]/.."
        )
        assert "400" in consumed_section.text

    def test_form_resets_after_successful_submission(self, app):
        fill_input(app, "e.g. Low Fat Paneer, Chicken Subji…", "Reset Test Food")
        fill_input(app, "e.g. 180", "300")
        click_button_text(app, "log custom food")

        # Navigate back
        navigate_tab(app, "Nutrition")
        wait_text(app, "03 · CUSTOM ENTRY")

        name_inp = app.find_element(
            By.XPATH, "//input[@placeholder='e.g. Low Fat Paneer, Chicken Subji…']"
        )
        assert name_inp.get_attribute("value") == ""

        cal_inp = app.find_element(By.XPATH, "//input[@placeholder='e.g. 180']")
        assert cal_inp.get_attribute("value") == ""


# ── Fibre feature ──────────────────────────────────────────────────────────────

class TestFibreTracking:
    def test_fibre_badge_visible_in_logs_when_fibre_entered(self, app):
        fill_input(app, "e.g. Low Fat Paneer, Chicken Subji…", "High Fibre Oats")
        fill_input(app, "e.g. 180", "350")
        fill_input(app, "e.g. 20", "12")
        fill_input(app, "e.g. 4", "60")
        fill_input(app, "e.g. 10", "7")
        fill_input(app, "e.g. 0", "8")
        click_button_text(app, "log custom food")

        navigate_tab(app, "Logs")
        wait_text(app, "Food Log")

        fibre_badge = WebDriverWait(app, 5).until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(), 'Fb 8.0g')]")
            )
        )
        assert fibre_badge.is_displayed()

    def test_no_fibre_badge_when_fibre_is_zero(self, app):
        fill_input(app, "e.g. Low Fat Paneer, Chicken Subji…", "Sugar Water")
        fill_input(app, "e.g. 180", "50")
        click_button_text(app, "log custom food")

        navigate_tab(app, "Logs")
        wait_text(app, "Food Log")

        badges = app.find_elements(
            By.XPATH, "//*[contains(text(), 'Fb 0.0g')]"
        )
        visible = [b for b in badges if b.is_displayed()]
        assert len(visible) == 0, "Fb 0.0g badge should not be visible"

    def test_custom_log_shows_ai_badge(self, app):
        fill_input(app, "e.g. Low Fat Paneer, Chicken Subji…", "Chicken Subji")
        fill_input(app, "e.g. 180", "185")
        click_button_text(app, "log custom food")

        navigate_tab(app, "Logs")
        wait_text(app, "Food Log")
        wait_text(app, "Chicken Subji")

        # Custom foods go through handleAILog so they carry the "AI" mono badge
        ai_badges = app.find_elements(
            By.XPATH, "//*[normalize-space(text())='AI']"
        )
        assert any(b.is_displayed() for b in ai_badges)
