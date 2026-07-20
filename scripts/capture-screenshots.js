const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Starting screenshot capture automation...');

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '..', 'public', 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('Created directory: public/screenshots');
  }

  // Launch browser
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  try {
    // 1. Landing Page
    console.log('Capturing Landing Page...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    // Scroll a tiny bit or wait for animations to complete
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outputDir, 'landing.png') });
    console.log('Saved public/screenshots/landing.png');

    // 2. Sign Up flow (mock mode)
    console.log('Navigating to Sign Up page...');
    await page.goto('http://localhost:3000/sign-up', { waitUntil: 'networkidle' });
    await page.fill('#firstName', 'John');
    await page.fill('#lastName', 'Doe');
    await page.fill('#email', 'john.doe@privora.com');
    await page.fill('#password', 'SecurePassword123!');
    await page.waitForTimeout(500);
    
    // Take signup/login page screenshot
    console.log('Capturing Signup/Login Page...');
    await page.screenshot({ path: path.join(outputDir, 'login.png') });
    console.log('Saved public/screenshots/login.png');

    // Submit signup
    console.log('Submitting signup form...');
    await page.click('button[type="submit"]');

    // Wait for the OTP verification page
    console.log('Waiting for verification page...');
    await page.waitForURL('**/verify-email');
    await page.waitForSelector('#code');
    await page.fill('#code', '123456');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');

    // Wait for redirection to dashboard
    console.log('Waiting for Dashboard redirection...');
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(3000); // Allow data seeding and animations to settle

    // 3. Dashboard Page
    console.log('Capturing Dashboard Page...');
    await page.screenshot({ path: path.join(outputDir, 'dashboard.png') });
    console.log('Saved public/screenshots/dashboard.png');

    // 4. Scan Page
    console.log('Navigating to Scan Page...');
    await page.goto('http://localhost:3000/dashboard/scan', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outputDir, 'scan.png') });
    console.log('Saved public/screenshots/scan.png');

    // 5. Reports Page
    console.log('Navigating to Reports Page...');
    await page.goto('http://localhost:3000/dashboard/reports', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outputDir, 'reports.png') });
    console.log('Saved public/screenshots/reports.png');

    // 6. Settings Page
    console.log('Navigating to Settings Page...');
    await page.goto('http://localhost:3000/dashboard/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outputDir, 'settings.png') });
    console.log('Saved public/screenshots/settings.png');

  } catch (error) {
    console.error('An error occurred during capture:', error);
  } finally {
    await browser.close();
    console.log('Screenshot capture finished.');
  }
})();
