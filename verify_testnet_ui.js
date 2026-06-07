const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');

  // Set identity in localStorage to bypass onboarding
  await page.evaluate(() => {
    localStorage.setItem('sovereign_id', JSON.stringify({
      username: 'TestnetUser',
      dht_key: 'vld_key_testnet_verification_123',
      private_key: 'secret'
    }));
  });

  await page.reload();
  await page.waitForSelector('h1');

  // Take screenshot
  await page.screenshot({ path: 'testnet_dashboard.png', fullPage: true });

  // Verify badge text
  const badge = await page.textContent('.px-2.py-1.bg-amber-100');
  console.log('Badge text:', badge);

  // Verify feedback form existence
  const feedbackHeading = await page.textContent('section.bg-gray-800 h2');
  console.log('Feedback heading:', feedbackHeading);

  await browser.close();
})();
