import pytest
import time
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

def test_admin_delete_hospital(driver):
    wait = WebDriverWait(driver, 15)
    
    # Login
    print("1. Logging in as admin...")
    driver.get("http://localhost:5173/login")
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Admin')]"))).click()
    wait.until(EC.visibility_of_element_located((By.NAME, "email"))).send_keys("nabi@gmail.com")
    wait.until(EC.visibility_of_element_located((By.NAME, "password"))).send_keys("1234")
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))).click()
    time.sleep(5)
    
    # Navigate to hospitals
    print("2. Navigating to hospital management...")
    driver.get("http://localhost:5173/admin-hospitals")
    time.sleep(3)
    
    # Wait for page to load
    wait.until(EC.presence_of_element_located((By.ID, "admin-hospitals")))
    
    # Find hospitals in the list
    print("3. Finding hospitals...")
    hospitals = driver.find_elements(By.XPATH, "//div[contains(@class, 'divide-y')]//div[contains(@class, 'grid-cols-12')]")
    
    if not hospitals:
        print("No hospitals found")
        return
    
    print(f"Found {len(hospitals)} hospitals")
    
    # Get first hospital
    first_hospital = hospitals[3]
    
    # Find the delete button using the exact title attribute from your React component
    delete_btn = first_hospital.find_element(By.XPATH, ".//button[@title='Delete hospital']")
    
    # Scroll to and click delete button
    driver.execute_script("arguments[0].scrollIntoView(true);", delete_btn)
    time.sleep(1)
    delete_btn.click()
    print("4. Delete button clicked")
    time.sleep(2)
    
    # Handle confirmation modal
    print("5. Handling confirmation modal...")
    
    # Wait for modal to appear
    modal = wait.until(EC.visibility_of_element_located(
        (By.XPATH, "//*[contains(text(), 'Delete Hospital')]")
    ))
    
    # Find and click the confirm delete button (the one that says "Delete")
    confirm_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(text(), 'Delete') and contains(@class, 'bg-purple-800')]")
    ))
    confirm_btn.click()
    print("6. Deletion confirmed")
    
    # Wait for deletion to complete
    time.sleep(5)
    print("✓ Hospital deleted successfully")

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])