import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/test-setup';
import { uploadKml, getStoreState, fitMapToBounds } from './helpers/map-helpers';

test.describe('Edit Polygon', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await uploadKml(page);
    await fitMapToBounds(page, 9, 9, 11, 17);
  });

  test('enters edit mode via menu and shows editing UI', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    // Select a polygon
    await sidebar.getByText('Rectangle A').click();

    // Open menu and click "Edit vertices"
    await page.locator('[title="More actions"]').first().click();
    await page.getByText('Edit vertices').click();

    const state = await getStoreState(page);
    const rectA = state.features.find((f: any) => f.name === 'Rectangle A');
    expect(state.editingFeatureId).toBe(rectA!.id);

    // Save button should appear
    await expect(page.locator('[title="Save changes"]')).toBeVisible();
  });

  test('saves edit mode via save button', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByText('Rectangle A').click();
    await page.locator('[title="More actions"]').first().click();
    await page.getByText('Edit vertices').click();

    // Click save
    await page.locator('[title="Save changes"]').click();

    const state = await getStoreState(page);
    expect(state.editingFeatureId).toBeNull();
  });

  test('renames polygon via double-click', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    // Double-click the name to start editing
    await sidebar.getByText('Rectangle A').dblclick();

    // An input field should appear
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible();

    // Clear and type new name
    await input.fill('Renamed Polygon');
    await input.press('Enter');

    // Verify the name changed
    await expect(sidebar.getByText('Renamed Polygon')).toBeVisible();
    const state = await getStoreState(page);
    const renamed = state.features.find((f: any) => f.name === 'Renamed Polygon');
    expect(renamed).toBeTruthy();
  });

  test('cancels rename on Escape', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByText('Rectangle A').dblclick();

    const input = page.locator('input[type="text"]').first();
    await input.fill('Should Not Save');
    await input.press('Escape');

    // Original name should still be there
    await expect(sidebar.getByText('Rectangle A')).toBeVisible();
    const state = await getStoreState(page);
    const original = state.features.find((f: any) => f.name === 'Rectangle A');
    expect(original).toBeTruthy();
  });
});
