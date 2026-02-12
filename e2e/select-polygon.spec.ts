import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/test-setup';
import { uploadKml, getStoreState, clickMapAt, fitMapToBounds, waitForStoreState } from './helpers/map-helpers';

test.describe('Select Polygon', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await uploadKml(page);
    // Fit map to show our test polygons
    await fitMapToBounds(page, 9, 9, 11, 17);
  });

  test('selects polygon by clicking its name in the sidebar', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByText('Rectangle A').click();

    const state = await getStoreState(page);
    const rectA = state.features.find((f: any) => f.name === 'Rectangle A');
    expect(state.selectedFeatureId).toBe(rectA!.id);
  });

  test('selects polygon by clicking on the map', async ({ page }) => {
    // Click at the center of Rectangle A (lat 10, lng 10)
    await clickMapAt(page, 10, 10);

    const state = await getStoreState(page);
    const rectA = state.features.find((f: any) => f.name === 'Rectangle A');
    expect(state.selectedFeatureId).toBe(rectA!.id);
  });

  test('deselects polygon by clicking empty map space', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    // First select via sidebar
    await sidebar.getByText('Rectangle A').click();
    await waitForStoreState(page, 'state.selectedFeatureId !== null');

    // Click on empty map area — between the polygon groups (lat 10, lng 13)
    // This is within the fitted bounds but not on any polygon
    await clickMapAt(page, 10, 13);
    await waitForStoreState(page, 'state.selectedFeatureId === null');

    const state = await getStoreState(page);
    expect(state.selectedFeatureId).toBeNull();
  });

  test('switching selection between polygons', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByText('Rectangle A').click();
    let state = await getStoreState(page);
    const rectA = state.features.find((f: any) => f.name === 'Rectangle A');
    expect(state.selectedFeatureId).toBe(rectA!.id);

    await sidebar.getByText('Triangle B').click();
    state = await getStoreState(page);
    const triB = state.features.find((f: any) => f.name === 'Triangle B');
    expect(state.selectedFeatureId).toBe(triB!.id);
  });
});
