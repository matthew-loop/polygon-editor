import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/test-setup';
import { uploadKml, getStoreState } from './helpers/map-helpers';

test.describe('Delete & Clear', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await uploadKml(page);
  });

  test('deletes a polygon with confirmation', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    // Select and open menu
    await sidebar.getByText('Rectangle A').click();
    await page.locator('[title="More actions"]').first().click();
    await page.getByText('Delete').click();

    // Confirm modal should appear
    await expect(page.getByText('Delete polygon')).toBeVisible();
    await expect(page.getByText(/Are you sure you want to delete/)).toBeVisible();

    // Click Delete in the modal
    await page.getByRole('button', { name: 'Delete' }).click();

    // Rectangle A should be gone from sidebar
    await expect(sidebar.getByText('Rectangle A')).not.toBeVisible();
    const state = await getStoreState(page);
    expect(state.features).toHaveLength(2);
  });

  test('cancels delete via Cancel button', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByText('Rectangle A').click();
    await page.locator('[title="More actions"]').first().click();
    await page.getByText('Delete').click();

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Rectangle A should still exist in sidebar
    await expect(sidebar.getByText('Rectangle A')).toBeVisible();
    const state = await getStoreState(page);
    expect(state.features).toHaveLength(3);
  });

  test('dismisses delete modal with Escape', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByText('Rectangle A').click();
    await page.locator('[title="More actions"]').first().click();
    await page.getByText('Delete').click();

    // Press Escape
    await page.keyboard.press('Escape');

    // Modal should be dismissed, polygon should remain
    await expect(page.getByText('Delete polygon')).not.toBeVisible();
    const state = await getStoreState(page);
    expect(state.features).toHaveLength(3);
  });

  test('clears all layers', async ({ page }) => {
    // Click "Clear all layers"
    await page.getByText('Clear all layers').click();

    // Confirm modal should appear (appendFeatures sets hasUnsavedChanges)
    await expect(page.getByText(/Are you sure/)).toBeVisible();
    await page.getByRole('button', { name: 'Clear all', exact: true }).click();

    const state = await getStoreState(page);
    expect(state.features).toHaveLength(0);
  });
});
