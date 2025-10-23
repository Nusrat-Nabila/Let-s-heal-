import pytest
import time
import chromedriver_autoinstaller
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

chromedriver_autoinstaller.install()

@pytest.fixture(scope="module")
def driver():
    driver = webdriver.Chrome()
    driver.maximize_window()
    yield driver
    driver.quit()

def test_therapist_login_and_edit(driver):
    wait = WebDriverWait(driver, 15)
    
    # Login
    driver.get("http://localhost:5173/login")
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Therapist')]"))).click()
    wait.until(EC.visibility_of_element_located((By.NAME, "email"))).send_keys("22201269@uap-bd.edu")
    wait.until(EC.visibility_of_element_located((By.NAME, "password"))).send_keys("123456")
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))).click()
    time.sleep(3)
    
    # Navigate to profile and enter edit mode
    driver.get("http://localhost:5173/therapistprofileown")
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Edit Profile')]"))).click()
    time.sleep(1)
    
    # Update profile fields
    test_data = {
        "therapist_name": "Dr. Johnson",
        "therapist_phone": "+8801111111111",
        "therapist_specialization": "Clinical Psychologist",
        "therapist_qualification": "PhD in Clinical Psychology",
        "year_of_experience": "5",
        "therapist_Serve_for": "CBT, Anxiety Management",
        "therapist_gender": "female",
        "therapist_status": "Available"
    }
    
    for field_name, value in test_data.items():
        try:
            field = wait.until(EC.presence_of_element_located((By.NAME, field_name)))
            if field.tag_name == 'select':
                Select(field).select_by_visible_text(value)
            else:
                field.clear()
                field.send_keys(value)
        except:
            pass
    
    driver.save_screenshot("before_save.png")
    
    # Save changes
    save_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Save Changes')]")))
    save_button.click()
    time.sleep(3)
    
    # Optional: check for success message
    try:
        wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(),'success') or contains(text(),'updated')]")))
    except:
        pass
    
    driver.save_screenshot("after_save.png")
    
    # Logout
    try:
        logout_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Logout')]")))
        logout_button.click()
        time.sleep(2)
    except:
        pass

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
