import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173'; // Assuming this is the base URL

test.describe('Login and Navigation Test', () => {
  let page: Page;
  const consoleLogs: { page: string; type: string; text: string }[] = [];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    // Listen for console messages
    page.on('console', message => {
      consoleLogs.push({
        page: page.url(),
        type: message.type(),
        text: message.text(),
      });
    });

    await page.goto(BASE_URL);

    // Fill in login credentials
    await page.fill('input[type="email"]', 'admin@dudufisio.com');
    await page.fill('input[type="password"]', 'DuduFisio2024!');

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForURL(`${BASE_URL}/**`); // Wait for any URL under the base URL
  });

  test('should log in successfully and navigate through pages', async () => {
    // After login, we are on some dashboard or home page.
    // Let's capture the console logs for this initial page.
    console.log(`--- Console logs for ${page.url()} (after login) ---`);
    consoleLogs.filter(log => log.page === page.url()).forEach(log => {
      console.log(`[${log.type}] ${log.text}`);
    });

    // Now, let's try to find some links and navigate.
    // This part will be generic and might need adjustment based on the actual application.
    // For now, let's try to click on all 'a' tags that are visible and have an href.
    const links = await page.$$('a[href]');
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#')) { // Avoid external links and anchor links
        try {
          await link.click();
          await page.waitForLoadState('networkidle'); // Wait for the page to load
          console.log(`--- Navigated to: ${page.url()} ---`);
          consoleLogs.filter(log => log.page === page.url()).forEach(log => {
            console.log(`[${log.type}] ${log.text}`);
          });
          await page.goBack(); // Go back to continue exploring other links
          await page.waitForLoadState('networkidle');
        } catch (error) {
          console.error(`Could not navigate to ${href}: ${error}`);
        }
      }
    }

    // You can add more specific navigation steps here if needed.
    // For example:
    // await page.click('text=Patients');
    // await page.waitForURL(`${BASE_URL}/patients`);
    // console.log(`--- Console logs for ${page.url()} ---`);
    // consoleLogs.filter(log => log.page === page.url()).forEach(log => {
    //   console.log(`[${log.type}] ${log.text}`);
    // });
  });

  test.afterAll(async () => {
    await page.close();
    console.log('\n--- All Console Logs Captured ---');
    consoleLogs.forEach(log => {
      console.log(`[${log.page}] [${log.type}] ${log.text}`);
    });
  });
});
