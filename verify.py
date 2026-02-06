from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 720})

        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        # Navigate
        print("Navigating...")
        try:
            page.goto("http://localhost:5173", timeout=10000)
        except Exception as e:
            print(f"Error navigating: {e}")
            return

        # Wait for animation (Welcome text)
        print("Waiting for initial animation...")
        time.sleep(3)

        # Screenshot Initial State
        page.screenshot(path="verification_initial.png")
        print("Initial screenshot taken.")

        # Click Top Left (Identity)
        print("Opening Identity...")
        page.locator("#c-tl").click()
        time.sleep(2) # increased wait for transition
        page.screenshot(path="verification_identity.png")
        print("Identity screenshot taken.")

        # Click Top Right (Vault)
        print("Opening Vault...")
        page.locator("#c-tr").click()
        time.sleep(2)
        page.screenshot(path="verification_vault.png")
        print("Vault screenshot taken.")

        # Trigger Ghost Admin (Shift+L)
        print("Triggering Ghost Admin...")
        page.keyboard.press("Shift+L")
        time.sleep(1)
        page.screenshot(path="verification_admin.png")
        print("Admin screenshot taken.")

        browser.close()

if __name__ == "__main__":
    run()
