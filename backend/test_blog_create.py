import pytest
import time
import requests
import chromedriver_autoinstaller
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Auto install matching ChromeDriver
chromedriver_autoinstaller.install()

@pytest.fixture(scope="module")
def driver():
    """Setup and teardown Chrome WebDriver"""
    driver = webdriver.Chrome()
    driver.maximize_window()
    yield driver
    driver.quit()

# ---------------- DEBUG FUNCTION ----------------
def debug_page(driver, page_name):
    """Debug function to see what's actually on the page"""
    print(f"\n === DEBUGGING {page_name.upper()} ===")
    print(f"Current URL: {driver.current_url}")
    print(f"Page title: {driver.title}")
    
    # Find all buttons
    buttons = driver.find_elements(By.TAG_NAME, "button")
    print(f"\nFound {len(buttons)} buttons:")
    for i, button in enumerate(buttons):
        text = button.text.strip()
        if text:  # Only show buttons with text
            print(f"  {i+1}. '{text}'")
    
    # Find all input fields
    inputs = driver.find_elements(By.TAG_NAME, "input")
    print(f"\nFound {len(inputs)} input fields:")
    for i, input_field in enumerate(inputs):
        name = input_field.get_attribute('name')
        id_attr = input_field.get_attribute('id')
        placeholder = input_field.get_attribute('placeholder')
        type_attr = input_field.get_attribute('type')
        print(f"  {i+1}. name='{name}', id='{id_attr}', type='{type_attr}', placeholder='{placeholder}'")
    
    # Find all textareas
    textareas = driver.find_elements(By.TAG_NAME, "textarea")
    print(f"\nFound {len(textareas)} textareas:")
    for i, textarea in enumerate(textareas):
        name = textarea.get_attribute('name')
        id_attr = textarea.get_attribute('id')
        placeholder = textarea.get_attribute('placeholder')
        print(f"  {i+1}. name='{name}', id='{id_attr}', placeholder='{placeholder}'")
    
    # Take screenshot
    driver.save_screenshot(f"debug_{page_name}.png")
    print(f"✓ Screenshot saved: debug_{page_name}.png")

# ---------------- Test Backend Connection ----------------
def test_backend_is_running():
    backend_url = "http://127.0.0.1:8000/api/login/"
    print("\nChecking backend status...")
    try:
        response = requests.get(backend_url, timeout=5)
        assert response.status_code in [200, 301, 302, 404, 405]
        print("✓ Backend reachable (status:", response.status_code, ")")
    except Exception as e:
        pytest.fail(f"Backend not reachable: {e}")

# ----------------  Login and Debug ----------------
def test_login_customer(driver):
    print("\nLogging in as Customer...")

    frontend_url = "http://localhost:5173/login"
    driver.get(frontend_url)
    
    # Wait for page load and debug
    time.sleep(3)
    debug_page(driver, "login_page")

    wait = WebDriverWait(driver, 15)

    # Fill credentials
    email_input = wait.until(EC.visibility_of_element_located((By.NAME, "email")))
    password_input = wait.until(EC.visibility_of_element_located((By.NAME, "password")))

    email_input.clear()
    email_input.send_keys("nabila@gmail.com")
    password_input.clear()
    password_input.send_keys("1234")

    # Select Customer role
    customer_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Customer')]")))
    customer_button.click()

    # Click Sign In button
    signin_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Sign in as Customer')]")))
    signin_btn.click()
    print("✓ Login submitted, waiting for redirect...")
    
    # Wait for login to complete
    time.sleep(5)
    
    # Verify login success
    current_url = driver.current_url
    if any(x in current_url.lower() for x in ["dashboard", "blog", "home", "profile"]):
        print(f"✓ Login successful → {current_url}")
    else:
        print(f"⚠ Unexpected page after login: {current_url}")

# ----------------  Navigate to Blog Page ----------------
def test_navigate_to_blog_and_create_post(driver):
    print("\nNavigating to Blog page...")

    blog_url = "http://localhost:5173/blog-posts"
    driver.get(blog_url)
    time.sleep(3)
    print(f"✓ Successfully loaded blog page: {driver.current_url}")

    wait = WebDriverWait(driver, 20)

    # Click Create Post button
    create_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Create Post')]")))
    create_btn.click()
    print("✓ Clicked Create Post button")

    # Wait for redirect
    time.sleep(3)
    print(f"✓ Redirected to create post page → {driver.current_url}")

# ---------------- 4 Fill Create Post Form (FIXED VERSION) ----------------
def test_fill_create_post_form(driver):
    print("\n Filling create post form...")

    wait = WebDriverWait(driver, 20)

    # --- Fill Title (without emoji) ---
    title_input = wait.until(EC.visibility_of_element_located((By.ID, "blog_title")))
    title_input.clear()
    title_input.send_keys("Healing Through Writing - My Therapy Journey")  # ✅ No emoji
    print("✓ Title filled")

    # --- Select Author Type ---
    try:
        author_type_identity = driver.find_element(By.ID, "author-type-identity")
        author_type_identity.click()
        print("✓ Author type selected: Identity")
    except Exception as e:
        print(f"⚠ Author type selection skipped: {e}")

    # --- Fill Author Name ---
    try:
        author_name = driver.find_element(By.ID, "blog_author_name")
        author_name.clear()
        author_name.send_keys("Nabila")
        print("✓ Author name filled")
    except Exception as e:
        print(f"⚠ Author name field not found: {e}")

    # --- Upload Image (optional) ---
    try:
        image_input = driver.find_element(By.ID, "blog_image")
        # Use a simple text file or skip if no image available
        # image_path = r"C:\path\to\image.jpg"  # Update with actual path
        # image_input.send_keys(image_path)
        print("⚠ Image upload skipped (no file path provided)")
    except Exception as e:
        print(f"⚠ Image upload skipped: {e}")

    # --- Fill Content (without emoji) ---
    content_input = wait.until(EC.visibility_of_element_located((By.ID, "blog_content")))
    content_input.clear()
    
    # Use simple text without emojis or special characters
    blog_content = """Writing has always been my therapy. In this post, I share how journaling helped me heal from anxiety and rediscover my inner peace.

Through daily writing exercises, I learned to process my emotions and understand myself better. The act of putting thoughts on paper created space for self-reflection and growth.

This journey taught me that healing is possible through self-expression and consistent practice."""
    
    content_input.send_keys(blog_content)
    print("✓ Content filled")

    # --- Click Publish Button ---
    publish_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Publish Post')]")))
    
    # Scroll to button to make sure it's visible
    driver.execute_script("arguments[0].scrollIntoView(true);", publish_button)
    time.sleep(5)
    
    publish_button.click()
    print("✓ Publish button clicked")

    # --- Wait for processing and check success ---
    time.sleep(10)
    
    current_url = driver.current_url
    print(f"Final URL after publishing: {current_url}")

    # Check for success
    if "blog-posts" in current_url or "blog" in current_url:
        print("SUCCESS: Blog post created and redirected to blog page!")
        
        # Check for success message
        try:
            success_elements = driver.find_elements(By.XPATH, "//*[contains(text(),'success') or contains(text(),'Success') or contains(text(),'created')]")
            for element in success_elements:
                if element.is_displayed():
                    print(f"Success message: {element.text}")
        except:
            print("✓ Blog post created successfully!")
            
    elif "create-post" in current_url:
        # Still on create post page - check for errors
        print("⚠ Still on create post page - checking for errors...")
        try:
            error_elements = driver.find_elements(By.XPATH, "//*[contains(text(),'error') or contains(text(),'Error')]")
            for error in error_elements:
                if error.is_displayed():
                    print(f"Error: {error.text}")
                    driver.save_screenshot("blog_creation_error.png")
        except:
            driver.save_screenshot("blog_creation_uncertain.png")
            print("⚠ Could not determine success status - check screenshot")
    else:
        print(f"Ended up on {current_url} - blog post likely created successfully!")

    # Final assertion
    assert "blog" in current_url.lower(), f"Expected to be on blog page, but on: {current_url}"