import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/test-setup';
import { uploadKml, getStoreState } from './helpers/map-helpers';

test.describe('Simplify', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await uploadKml(page);
  });

  test('simplify panel appears when polygon is selected', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    // Select Complex C (which has 23 vertices)
    await sidebar.getByText('Complex C').click();

    // The simplify section should be visible
    await expect(page.getByText('Simplify')).toBeVisible();

    // Should show point count
    await expect(page.getByText(/pts/)).toBeVisible();
  });

  test('simplify panel is hidden when no polygon selected', async ({ page }) => {
    // With nothing selected, the simplify label should not be visible
    // (there may be other "Simplify" text so we check for the slider)
    const slider = page.locator('input[type="range"]');
    await expect(slider).not.toBeVisible();
  });

  test('slider changes preview point count', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByText('Complex C').click();

    // Wait for the simplify panel
    await expect(page.getByText('pts')).toBeVisible();

    // Move the slider to a high simplification value
    const slider = page.locator('input[type="range"]');
    await slider.fill('80');

    // The "Apply simplification" button should become enabled (meaning count decreased)
    await expect(page.getByRole('button', { name: 'Apply simplification' })).toBeEnabled();
  });

  test('apply simplification reduces vertex count', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByText('Complex C').click();

    // Get original vertex count from store
    let state = await getStoreState(page);
    const complexC = state.features.find((f: any) => f.name === 'Complex C');
    const originalVertexCount = complexC!.geometry.coordinates[0].length;

    // Move slider to simplify
    const slider = page.locator('input[type="range"]');
    await slider.fill('80');

    // Wait for apply button to be enabled
    await expect(page.getByRole('button', { name: 'Apply simplification' })).toBeEnabled();

    // Click apply
    await page.getByRole('button', { name: 'Apply simplification' }).click();

    // Verify vertex count decreased
    state = await getStoreState(page);
    const simplified = state.features.find((f: any) => f.name === 'Complex C');
    expect(simplified!.geometry.coordinates[0].length).toBeLessThan(originalVertexCount);
  });
});
