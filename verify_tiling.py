import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = context.new_page()

    print("Navigating to app...")
    page.goto("http://localhost:5173/")

    # Wait for app to load (initial animations)
    time.sleep(3)

    print("Opening Window 1 (Guestbook) via HUD...")
    # Click BR (Guestbook)
    # Note: HUD corners are initially small buttons.
    # Need to hover to see label? No, button is clickable.
    page.locator(".hud-corner.br .hud-btn").click()
    time.sleep(2)

    print("Verifying Window 1 Open...")
    window1 = page.locator(".window-frame").first
    if not window1.is_visible():
        print("Error: Window 1 not visible")
        page.screenshot(path="verification_failure.png")
        return

    print("Checking Close Button Style (X)...")
    close_btn = window1.locator(".close-btn svg")
    lines = close_btn.locator("line")
    if lines.count() == 2:
        print("Success: Close button uses X (2 lines)")
    else:
        # Check if it's path?
        paths = close_btn.locator("path")
        print(f"Failure: Close button has {lines.count()} lines. Paths: {paths.count()}. Expected 2 lines.")

    print("Dragging Window 1 to Center...")
    box = window1.bounding_box()
    if box:
        center_x = box['x'] + box['width'] / 2
        center_y = box['y'] + box['height'] / 2

        # Drag to absolute center (640, 400)
        page.mouse.move(center_x, center_y)
        page.mouse.down()
        page.mouse.move(640, 400, steps=20)
        page.mouse.up()
        time.sleep(1)

    print("Opening Window 2 (Vault - BL)...")
    page.locator(".hud-corner.bl .hud-btn").click()
    time.sleep(2)

    print("Verifying Smart Tiling...")
    windows = page.locator(".window-frame")
    count = windows.count()
    print(f"Found {count} windows")

    page.screenshot(path="verification_tiling.png")
    print("Screenshot saved to verification_tiling.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
