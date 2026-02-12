import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/test-setup';
import { getStoreState, drawPolygonOnMap, fitMapToBounds, waitForStoreState } from './helpers/map-helpers';

test.describe('Draw Polygon', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    // Fit map to a known area for drawing — use coordinates that will be
    // visible to the right of the sidebar
    await fitMapToBounds(page, 5, 5, 15, 15);
  });

  test('enters and exits draw mode', async ({ page }) => {
    const drawBtn = page.getByRole('button', { name: 'Draw' });
    await drawBtn.click();

    let state = await getStoreState(page);
    expect(state.isDrawing).toBe(true);

    // Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    state = await getStoreState(page);
    expect(state.isDrawing).toBe(false);
  });

  test('draws a polygon on the map and verifies creation', async ({ page }) => {
    // Start draw mode
    await page.getByRole('button', { name: 'Draw' }).click();
    await waitForStoreState(page, 'state.isDrawing === true');

    // Draw a large triangle with well-separated points
    await drawPolygonOnMap(page, [
      [12, 10],
      [12, 14],
      [8, 12],
    ]);

    // Wait for the pm:create event to process and drawing to finish
    await waitForStoreState(page, 'state.features.length >= 1 && !state.isDrawing');

    const state = await getStoreState(page);
    expect(state.features.length).toBeGreaterThanOrEqual(1);

    // The new polygon should be named "New Polygon"
    const newPoly = state.features.find((f: any) => f.name === 'New Polygon');
    expect(newPoly).toBeTruthy();

    // It should be selected
    expect(state.selectedFeatureId).toBe(newPoly!.id);

    // Draw mode should be off
    expect(state.isDrawing).toBe(false);

    const sidebar = page.getByRole('complementary');
    // Should show in the sidebar
    await expect(sidebar.getByText('New Polygon')).toBeVisible();
  });
});
