import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/test-setup';
import { getThemeState } from './helpers/map-helpers';

test.describe('Theme', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('defaults to a theme and can toggle', async ({ page }) => {
    const initial = await getThemeState(page);
    const initialTheme = initial.theme; // 'light' or 'dark'

    // The toggle button should be visible
    const toggleBtn = page.locator(`[title="Switch to ${initialTheme === 'light' ? 'dark' : 'light'} mode"]`);
    await expect(toggleBtn).toBeVisible();

    // Click to toggle
    await toggleBtn.click();

    const after = await getThemeState(page);
    const expectedTheme = initialTheme === 'light' ? 'dark' : 'light';
    expect(after.theme).toBe(expectedTheme);

    // data-theme attribute should update
    const dataTheme = await page.getAttribute('html', 'data-theme');
    expect(dataTheme).toBe(expectedTheme);
  });

  test('persists theme to localStorage', async ({ page }) => {
    // Toggle theme
    const initial = await getThemeState(page);
    const toggleBtn = page.locator(`[title="Switch to ${initial.theme === 'light' ? 'dark' : 'light'} mode"]`);
    await toggleBtn.click();

    const expectedTheme = initial.theme === 'light' ? 'dark' : 'light';

    // Check localStorage
    const stored = await page.evaluate(() => localStorage.getItem('pe-theme'));
    expect(stored).toBe(expectedTheme);

    // Reload and verify persistence
    await page.reload();
    await page.waitForSelector('.leaflet-container', { timeout: 15_000 });

    const dataTheme = await page.getAttribute('html', 'data-theme');
    expect(dataTheme).toBe(expectedTheme);
  });
});
