"""
pytest fixtures shared across all Selenium test files.

Driver lifecycle  :  one Chrome instance per test (function scope) for clean state.
Auth injection    :  navigate once → set localStorage token → reload.
API mocking       :  Selenium 4 CDP Fetch interception (replaces seleniumwire).
"""
import json
import time
import pytest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

from helpers.api_mocks import setup_api_mocks

# ── Constants ──────────────────────────────────────────────────────────────────
BASE_URL = "http://localhost:5173"

# Derived from the Supabase project URL (zskwpeheleppobhqpbpn.supabase.co)
SUPABASE_LS_KEY = "sb-zskwpeheleppobhqpbpn-auth-token"

MOCK_AUTH_PAYLOAD = {
    "access_token": "mock-access-token-steparc",
    "token_type": "bearer",
    "expires_in": 3600,
    "refresh_token": "mock-refresh-token",
    "user": {
        "id": "mocked-user-id-12345",
        "email": "testathlete@steparc.com",
        "role": "authenticated",
        "aud": "authenticated",
        "app_metadata": {"provider": "email"},
        "user_metadata": {},
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-01-01T00:00:00.000Z",
    },
}


# ── Driver fixture ─────────────────────────────────────────────────────────────
@pytest.fixture(scope="function")
def driver():
    """Chrome driver with CDP enabled for request interception (mobile-sized viewport)."""
    chrome_opts = Options()
    chrome_opts.add_argument("--headless=new")
    chrome_opts.add_argument("--no-sandbox")
    chrome_opts.add_argument("--disable-dev-shm-usage")
    chrome_opts.add_argument("--disable-gpu")
    chrome_opts.add_argument("--window-size=480,800")
    # Required for CDP Fetch domain to work in headless mode
    chrome_opts.add_argument("--remote-debugging-port=0")

    drv = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_opts,
    )
    drv.implicitly_wait(0)  # explicit waits only — never rely on implicit
    yield drv
    drv.quit()


# ── Authenticated app fixture ──────────────────────────────────────────────────
@pytest.fixture(scope="function")
def app(driver):
    """
    Returns a driver that is:
      1. API-mocked   — all Supabase / AI calls intercepted and virtualised.
      2. Authenticated — mock JWT in localStorage so the app skips AuthScreen.
      3. Loaded        — waits until <header h1> is visible (app fully rendered).
    """
    # Register interceptors BEFORE any navigation
    setup_api_mocks(driver)

    # Navigate once so the localStorage write is on the correct origin
    driver.get(BASE_URL)

    # Inject the mock auth token
    payload = dict(MOCK_AUTH_PAYLOAD)
    payload["expires_at"] = int(time.time()) + 3600
    driver.execute_script(
        "window.localStorage.setItem(arguments[0], arguments[1]);",
        SUPABASE_LS_KEY,
        json.dumps(payload),
    )

    # Reload so the Supabase client reads the token from localStorage on init
    driver.refresh()

    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "header h1"))
    )
    return driver


# ── Shared helpers (imported by test files via conftest re-export) ─────────────

def wait_css(driver, selector, timeout=6):
    """Wait for and return an element by CSS selector."""
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, selector))
    )


def wait_text(driver, text, timeout=6):
    """Wait until any element containing *text* is present in the DOM."""
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located(
            (By.XPATH, f"//*[contains(normalize-space(.), '{text}')]")
        )
    )


def wait_clickable(driver, selector, timeout=6):
    return WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
    )


def is_visible(driver, selector, by=By.CSS_SELECTOR):
    """Return True if an element matching *selector* is in the DOM and displayed."""
    try:
        return driver.find_element(by, selector).is_displayed()
    except Exception:
        return False


def text_visible(driver, text):
    """Return True if any element containing *text* is currently visible."""
    try:
        els = driver.find_elements(
            By.XPATH, f"//*[contains(normalize-space(.), '{text}')]"
        )
        return any(e.is_displayed() for e in els)
    except Exception:
        return False


def navigate_tab(driver, label):
    """
    Click a TabBar button.
    *label* is the tab's aria-label WITHOUT the trailing ' tab' suffix,
    e.g.  'Nutrition', 'Training', 'Logs', 'Today', 'History'.
    """
    btn = WebDriverWait(driver, 5).until(
        EC.element_to_be_clickable(
            (By.XPATH, f"//button[@aria-label='{label} tab']")
        )
    )
    btn.click()


def fill_input(driver, placeholder, value):
    """Clear and fill an <input> located by its placeholder attribute."""
    inp = WebDriverWait(driver, 5).until(
        EC.presence_of_element_located(
            (By.XPATH, f"//input[@placeholder='{placeholder}']")
        )
    )
    inp.clear()
    inp.send_keys(str(value))
    return inp


def click_button_text(driver, text, timeout=5):
    """Click the first <button> whose visible text matches *text* (case-insensitive)."""
    btn = WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable(
            (By.XPATH,
             f"//button[contains(translate(normalize-space(.), "
             f"'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "
             f"'{text.lower()}')]")
        )
    )
    btn.click()
    return btn


# ── Shared helpers for food/workout logging (reused across test files) ─────────

def log_custom_food(driver, name, calories, protein="0", fibre="0"):
    """Log a custom-macro food entry and wait for the dashboard to appear."""
    navigate_tab(driver, "Nutrition")
    wait_text(driver, "03 · CUSTOM ENTRY")

    fill_input(driver, "e.g. Low Fat Paneer, Chicken Subji…", name)
    fill_input(driver, "e.g. 180", str(calories))
    if protein != "0":
        fill_input(driver, "e.g. 20", protein)
    if fibre != "0":
        fill_input(driver, "e.g. 0", fibre)

    click_button_text(driver, "log custom food")
    # App auto-navigates to Today/Dashboard tab
    wait_text(driver, "MACROS TODAY", timeout=5)


def log_single_exercise(driver, search_term="Deadlift", sets="3"):
    """Log a single exercise entry via the 02 · SINGLE EXERCISE form."""
    navigate_tab(driver, "Training")
    wait_text(driver, "02 · SINGLE EXERCISE")

    fill_input(driver, "Search exercise… e.g. incline", search_term)
    # Pick first dropdown result
    WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[role='listbox'] div"))
    ).click()

    fill_input(driver, "e.g. 4", sets)
    click_button_text(driver, "log exercise")
    wait_text(driver, "MACROS TODAY", timeout=5)
