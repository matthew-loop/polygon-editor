import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/test-setup';
import { uploadKml, getStoreState } from './helpers/map-helpers';

test.describe('Sidebar UI', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('shows empty state when no polygons loaded', async ({ page }) => {
    // The sidebar should exist
    await expect(page.getByText('Polygon Editor')).toBeVisible();

    // Export download button should be disabled
    const downloadBtn = page.getByRole('button', { name: /Download/i });
    await expect(downloadBtn).toBeDisabled();

    // Empty state message should be visible
    await expect(page.getByText('Upload a KML file or draw')).toBeVisible();

    // "Clear all layers" button is hidden when no features exist
    await expect(page.getByText('Clear all layers')).not.toBeVisible();
  });

  test('shows layer count badge after import', async ({ page }) => {
    await uploadKml(page);

    // The badge should show "3"
    await expect(page.getByText('3').first()).toBeVisible();
  });

  test('shows unsaved changes indicator after import', async ({ page }) => {
    // Upload uses appendFeatures which sets hasUnsavedChanges=true
    await uploadKml(page);

    const state = await getStoreState(page);
    expect(state.hasUnsavedChanges).toBe(true);

    // The unsaved indicator dot should be visible
    await expect(page.locator('[title="Unsaved changes"]')).toBeVisible();
  });

  test('Draw button toggles between Draw and Cancel', async ({ page }) => {
    await uploadKml(page);

    const drawBtn = page.getByRole('button', { name: 'Draw' });
    await expect(drawBtn).toBeVisible();

    // Click Draw to start drawing
    await drawBtn.click();

    // Button should now say Cancel
    const cancelBtn = page.getByRole('button', { name: 'Cancel' });
    await expect(cancelBtn).toBeVisible();

    // Click Cancel to stop drawing
    await cancelBtn.click();

    // Button should be back to Draw
    await expect(page.getByRole('button', { name: 'Draw' })).toBeVisible();

    const state = await getStoreState(page);
    expect(state.isDrawing).toBe(false);
  });

  test('Draw button is disabled during split mode', async ({ page }) => {
    await uploadKml(page);

    const sidebar = page.getByRole('complementary');
    // Select first polygon and enter split mode via the menu
    await sidebar.getByText('Rectangle A').click();
    // Open the three-dot menu
    await page.locator('[title="More actions"]').first().click();
    await page.getByText('Split').click();

    // Draw button should now be disabled
    const drawBtn = page.getByRole('button', { name: 'Draw' });
    await expect(drawBtn).toBeDisabled();
  });
});
