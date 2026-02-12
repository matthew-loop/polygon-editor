import { Page } from '@playwright/test';

/**
 * Navigate to the app and wait for the map to be ready.
 */
export async function setupPage(page: Page) {
  await page.goto('/');
  // Wait for the Leaflet map container to appear
  await page.waitForSelector('.leaflet-container', { timeout: 15_000 });
  // Wait for tiles to start loading (map is interactive)
  await page.waitForSelector('.leaflet-tile-loaded', { timeout: 15_000 });
}
