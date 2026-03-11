import asyncio
from playwright.async_api import async_playwright
import time

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1280, 'height': 720})

        # Set isAdmin to true via localStorage or just hope the server is still running with the store hack
        # Wait, I reverted the store hack. I should re-apply it temporarily for verification.

        print("Navigating to app...")
        await page.goto('http://localhost:5173')
        await asyncio.sleep(3)

        # Trigger Admin Panel (assuming isAdmin is true)
        print("Clicking IDENTITY_MATRIX...")
        try:
            await page.click('button:has-text("IDENTITY_MATRIX")')
            print("Clicked IDENTITY_MATRIX")
        except Exception as e:
            print(f"Failed to click IDENTITY_MATRIX: {e}")
            await page.screenshot(path='/home/jules/verification/fail_click.png')
            await browser.close()
            return

        await asyncio.sleep(2)
        await page.screenshot(path='/home/jules/verification/profile_editor.png')

        # Check for Preview button
        print("Checking for Preview button...")
        try:
            preview_btn = page.locator('button:has-text("Preview")')
            await preview_btn.click()
            print("Clicked Preview")
        except Exception as e:
            print(f"Failed to click Preview: {e}")

        await asyncio.sleep(2)
        await page.screenshot(path='/home/jules/verification/profile_preview_open.png')

        # Type in the Name field and check if it updates in the preview
        print("Typing in Full Name...")
        try:
            # The input has id "full_name"
            await page.fill('#full_name', 'JULES_THE_BOT')
            print("Typed JULES_THE_BOT")
        except Exception as e:
            print(f"Failed to type: {e}")

        await asyncio.sleep(1)
        await page.screenshot(path='/home/jules/verification/profile_realtime_update.png')

        print("Done.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
