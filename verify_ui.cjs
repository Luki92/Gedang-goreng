const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');

  // Wait for loading
  await page.waitForTimeout(2000);

  // Click top-left corner
  console.log('Clicking IDENTITY corner...');
  await page.click('#c-tl button');
  await page.waitForTimeout(1000);

  // Click top-right corner
  console.log('Clicking WORKS corner...');
  await page.click('#c-tr button');
  await page.waitForTimeout(1000);

  // Verify two windows are open
  const windows = await page.locator('.window-frame').count();
  console.log('Number of windows open:', windows);

  // Take screenshot of tiled layout
  await page.screenshot({ path: 'tiled_windows.png' });

  // Verify gap (approximate)
  const masterWindow = await page.locator('.window-frame').first();
  const box = await masterWindow.boundingBox();
  console.log('Master window bounding box:', box);

  // Check if corner buttons (bottom ones) are still there
  const blVisible = await page.isVisible('#c-bl button');
  const brVisible = await page.isVisible('#c-br button');
  console.log('Bottom corners visible:', blVisible, brVisible);

  // Drag master window to trigger edge-glow
  console.log('Starting drag...');
  await page.mouse.move(box.x + 50, box.y + 5);
  await page.mouse.down();
  await page.mouse.move(20, box.y + 200); // Drag to left edge
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'dragging_edge_glow.png' });
  await page.mouse.up();

  await browser.close();
})();
