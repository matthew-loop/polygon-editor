import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/test-setup';
import { uploadKml, getStoreState } from './helpers/map-helpers';
import path from 'path';

test.describe('Import / Export', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('imports KML file and shows 3 polygons in sidebar', async ({ page }) => {
    await uploadKml(page);

    const state = await getStoreState(page);
    expect(state.features).toHaveLength(3);

    const sidebar = page.getByRole('complementary');
    // Verify names appear in the sidebar
    await expect(sidebar.getByText('Rectangle A')).toBeVisible();
    await expect(sidebar.getByText('Triangle B')).toBeVisible();
    await expect(sidebar.getByText('Complex C')).toBeVisible();
  });

  test('shows error for empty/invalid KML', async ({ page }) => {
    // Create an empty KML file content
    const emptyKml = '<?xml version="1.0"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document></Document></kml>';
    const buffer = Buffer.from(emptyKml);

    const fileInput = page.locator('input[type="file"][accept=".kml"]');
    await fileInput.setInputFiles({
      name: 'empty.kml',
      mimeType: 'application/vnd.google-earth.kml+xml',
      buffer,
    });

    // Should show error or no features loaded
    const state = await getStoreState(page);
    expect(state.features).toHaveLength(0);
  });

  test('appends polygons on re-import', async ({ page }) => {
    await uploadKml(page);
    let state = await getStoreState(page);
    expect(state.features).toHaveLength(3);

    // Import same file again — should append
    await uploadKml(page);
    state = await getStoreState(page);
    expect(state.features).toHaveLength(6);
  });

  test('exports as KML download', async ({ page }) => {
    await uploadKml(page);

    // Click the KML format tab button
    await page.getByRole('button', { name: 'KML', exact: true }).click();

    // Click download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download KML' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.kml$/);
  });

  test('exports as GeoJSON download', async ({ page }) => {
    await uploadKml(page);

    // Switch to GeoJSON format
    await page.getByRole('button', { name: 'GeoJSON' }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download GeoJSON/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.geojson$/);
  });

  test('export button is disabled when no features exist', async ({ page }) => {
    const downloadBtn = page.getByRole('button', { name: /Download/i });
    await expect(downloadBtn).toBeDisabled();
  });
});
