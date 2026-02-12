import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/test-setup';
import { uploadKml, getStoreState, getMapLayerCount, fitMapToBounds } from './helpers/map-helpers';

test.describe('Visibility & Focus', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await uploadKml(page);
    await fitMapToBounds(page, 9, 9, 11, 17);
  });

  test('hides individual polygon via eye icon', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    // Hover over the first polygon item to reveal the eye button
    const firstItem = sidebar.getByText('Rectangle A').locator('..');
    await firstItem.hover();

    // Click the hide button
    await page.locator('[title="Hide polygon"]').first().click();

    const state = await getStoreState(page);
    const rectA = state.features.find((f: any) => f.name === 'Rectangle A');
    expect(state.hiddenFeatureIds).toContain(rectA!.id);

    // Map should have one less layer
    const layerCount = await getMapLayerCount(page);
    expect(layerCount).toBe(2);
  });

  test('shows hidden polygon via eye-slash icon', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    // Hide first
    const firstItem = sidebar.getByText('Rectangle A').locator('..');
    await firstItem.hover();
    await page.locator('[title="Hide polygon"]').first().click();

    // Now show it again
    await firstItem.hover();
    await page.locator('[title="Show polygon"]').first().click();

    const state = await getStoreState(page);
    expect(state.hiddenFeatureIds).toHaveLength(0);

    const layerCount = await getMapLayerCount(page);
    expect(layerCount).toBe(3);
  });

  test('hides all layers via header button', async ({ page }) => {
    // Click the "Hide all layers" button in the layers header
    await page.locator('[title="Hide all layers"]').click();

    const state = await getStoreState(page);
    expect(state.hiddenFeatureIds).toHaveLength(3);

    const layerCount = await getMapLayerCount(page);
    expect(layerCount).toBe(0);
  });

  test('shows all layers via header button', async ({ page }) => {
    // First hide all
    await page.locator('[title="Hide all layers"]').click();

    // Then show all
    await page.locator('[title="Show all layers"]').click();

    const state = await getStoreState(page);
    expect(state.hiddenFeatureIds).toHaveLength(0);

    const layerCount = await getMapLayerCount(page);
    expect(layerCount).toBe(3);
  });

  test('focus mode hides all except selected polygon', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    // Select polygon and open menu
    await sidebar.getByText('Rectangle A').click();
    await page.locator('[title="More actions"]').first().click();
    await page.getByText('Focus').click();

    const state = await getStoreState(page);
    const rectA = state.features.find((f: any) => f.name === 'Rectangle A');
    expect(state.focusedFeatureId).toBe(rectA!.id);
    // All others should be hidden
    expect(state.hiddenFeatureIds).toHaveLength(2);
    expect(state.hiddenFeatureIds).not.toContain(rectA!.id);

    const layerCount = await getMapLayerCount(page);
    expect(layerCount).toBe(1);
  });

  test('unfocus restores all visibility', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    // Enter focus mode
    await sidebar.getByText('Rectangle A').click();
    await page.locator('[title="More actions"]').first().click();
    await page.getByText('Focus').click();

    // Open menu again — should now show "Show All"
    await page.locator('[title="More actions"]').first().click();
    await page.getByText('Show All').click();

    const state = await getStoreState(page);
    expect(state.focusedFeatureId).toBeNull();
    expect(state.hiddenFeatureIds).toHaveLength(0);

    const layerCount = await getMapLayerCount(page);
    expect(layerCount).toBe(3);
  });
});
