const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Go to login page
    await page.goto('http://localhost:3007/');
    await page.waitForTimeout(2000);

    // Click Create Account tab
    await page.click('text=Create Account');
    await page.waitForTimeout(800);

    // Fill Full Name
    await page.fill('input[placeholder*="Alex Morgan"]', 'Test Candidate');
    await page.waitForTimeout(300);

    // Fill Email
    await page.fill('input[type="email"]', 'testcandidate.careonix@gmail.com');
    await page.waitForTimeout(300);

    // Fill Password
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.waitForTimeout(300);

    console.log('Form filled. Clicking Send OTP button...');

    // Click Send Verification OTP button
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);

    // Check if OTP modal appeared
    const modalVisible = await page.locator('text=OTP Security Verification').isVisible().catch(() => false);
    console.log('OTP Modal visible:', modalVisible);

    if (modalVisible) {
      // OTP that was just fetched fresh from API is: 852111
      const digits = ['8','5','2','1','1','1'];
      for (let i = 0; i < 6; i++) {
        const input = page.locator('#rotp-' + i);
        const count = await input.count();
        if (count > 0) {
          await input.click();
          await input.fill(digits[i]);
          await page.waitForTimeout(150);
        }
      }
      console.log('OTP digits entered: 852111');

      // Click Verify button
      await page.click('text=Verify & Complete Sign Up');
      await page.waitForTimeout(3000);
    }

    // Take screenshot
    await page.screenshot({ path: 'signup_result.png' });
    const bodyText = await page.locator('body').innerText();
    if (bodyText.includes('Welcome back') || bodyText.includes('Dashboard') || bodyText.includes('Employer Hub') || bodyText.includes('Candidate')) {
      console.log('SUCCESS: Dashboard loaded!');
    } else if (bodyText.includes('Invalid OTP')) {
      console.log('FAIL: Invalid OTP error shown');
    } else {
      console.log('Result text snippet:', bodyText.substring(0, 300));
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (browser) await browser.close();
  }
})();
