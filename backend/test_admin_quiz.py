import time
import pytest
import chromedriver_autoinstaller
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

chromedriver_autoinstaller.install()

@pytest.fixture(scope="module")
def driver():
    driver = webdriver.Chrome()
    driver.maximize_window()
    yield driver
    driver.quit()

def test_add_question_and_result_range(driver):
    wait = WebDriverWait(driver, 20)

    # --- Login as Admin ---
    driver.get("http://localhost:5173/login")
    wait.until(EC.visibility_of_element_located((By.NAME, "email"))).send_keys("nabi@gmail.com")
    wait.until(EC.visibility_of_element_located((By.NAME, "password"))).send_keys("1234")
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Admin')]"))).click()
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Sign')]"))).click()
    time.sleep(5)

    # --- Go to Admin Quiz Page ---
    driver.get("http://localhost:5173/admin-quiz")
    time.sleep(3)

    # ============ ADD QUESTIONS ============
    questions = [
        {
            "order": "1",
            "text": "How often do you feel stressed in your daily life?",
            "options": {
                "option-a": "Never", "score-a": "0",
                "option-b": "Sometimes", "score-b": "1",
                "option-c": "Often", "score-c": "2",
                "option-d": "Always", "score-d": "3",
            },
        },
    ]

    for q in questions:
        wait.until(EC.visibility_of_element_located((By.ID, "question-order"))).clear()
        driver.find_element(By.ID, "question-order").send_keys(q["order"])
        driver.find_element(By.ID, "question-text").clear()
        driver.find_element(By.ID, "question-text").send_keys(q["text"])
        for fid, val in q["options"].items():
            el = driver.find_element(By.ID, fid)
            el.clear()
            el.send_keys(val)
        driver.find_element(By.ID, "question-required").click()
        driver.find_element(By.ID, "submit-question-btn").click()
        time.sleep(2)

    # ============ ADD RESULT RANGES ============
    driver.find_element(By.ID, "result-ranges-tab").click()
    time.sleep(2)

    ranges = [
        ("0", "5", "Low stress level. You're managing well!"),
    ]

    for min_s, max_s, text in ranges:
        driver.find_element(By.ID, "min-score").clear()
        driver.find_element(By.ID, "min-score").send_keys(min_s)
        driver.find_element(By.ID, "max-score").clear()
        driver.find_element(By.ID, "max-score").send_keys(max_s)
        driver.find_element(By.ID, "result-text").clear()
        driver.find_element(By.ID, "result-text").send_keys(text)
        driver.find_element(By.ID, "submit-result-range-btn").click()
        time.sleep(2)

    driver.save_screenshot("quiz_test_done.png")