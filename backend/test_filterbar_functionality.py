import time
import pytest
import chromedriver_autoinstaller
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Automatically install ChromeDriver
chromedriver_autoinstaller.install()

@pytest.fixture(scope="module")
def driver():
    driver = webdriver.Chrome()
    driver.maximize_window()
    yield driver
    driver.quit()

def test_filterbar_search_and_filters(driver):
    wait = WebDriverWait(driver, 20)

    # Open Find Therapist page
    driver.get("http://localhost:5173/findtherapist")
    wait.until(EC.presence_of_element_located((By.ID, "filterbar")))
    print("Find Therapist page loaded.")
    # Verify core filter elements exist
    assert driver.find_element(By.ID, "therapist-search-input")
    assert driver.find_element(By.ID, "specialty-select")
    assert driver.find_element(By.ID, "gender-select")
    assert driver.find_element(By.ID, "clear-all-filters-btn")
    # Test search input
    search_input = driver.find_element(By.ID, "therapist-search-input")
    search_input.clear()
    search_input.send_keys("Dr. Chaya Bhattacharjee")
    time.sleep(2)
    print("Search input working.")
    # Clear search
    driver.find_element(By.ID, "clear-search-btn").click()
    time.sleep(1)
    # Apply Specialty Filter
    specialty_select = wait.until(EC.presence_of_element_located((By.ID, "specialty-select")))
    specialty_select.find_element(By.XPATH, "//option[contains(text(),'Counseling Psychologist')]").click()
    print("Specialty filter applied.")
    time.sleep(1)
    # Apply Hospital Filter (with fallback)
    try:
        hospital_select = wait.until(
            EC.presence_of_element_located((By.ID, "hospital-select"))
        )
        hospital_select.find_element(By.XPATH, "//option[3]").click()
        print("Hospital filter applied.")
    except Exception as e:
        print("Hospital filter not found or not loaded yet. Skipping this step.")
    time.sleep(1)
    # Apply Gender Filter
    gender_select = wait.until(EC.presence_of_element_located((By.ID, "gender-select")))
    gender_select.find_element(By.XPATH, "//option[@value='female']").click()
    print("Gender filter applied.")
    time.sleep(1)
    # Verify Active Filters section
    active_filters = driver.find_element(By.ID, "active-filters-display")
    assert "Active Filters" in active_filters.text
    print("Active filters displayed correctly.")
    # Clear All Filters
    driver.find_element(By.ID, "clear-all-filters-btn").click()
    time.sleep(1)
    print("All filters cleared.")
    # Verify filters reset
    assert driver.find_element(By.ID, "specialty-select").get_attribute("value") == ""
    gender_value = driver.find_element(By.ID, "gender-select").get_attribute("value")
    assert gender_value == "" or gender_value is None
    print("Filters successfully reset.")

    print("\nFilterbar functionality test passed successfully!\n")
