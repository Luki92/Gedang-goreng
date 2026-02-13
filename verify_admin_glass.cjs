const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');

  // Wait for loading
  await page.waitForTimeout(2000);

  // Trigger Terminal
  console.log('Triggering Terminal...');
  await page.keyboard.press('Control+Shift+L');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'terminal_auth_glass.png' });

  // Close it
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Open a standard window to check title
  console.log('Opening Identity...');
  await page.click('#c-tl button');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'identity_window_glass.png' });

  await browser.close();
})();
