import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/test-setup';
import { uploadKml, getStoreState, fitMapToBounds, latLngToPixel, waitForStoreState } from './helpers/map-helpers';

test.describe('Split & Merge', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await uploadKml(page);
    await fitMapToBounds(page, 9, 9, 11, 13);
  });

  test('shows split mode banner and can cancel', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    // Select Rectangle A and start split
    await sidebar.getByText('Rectangle A').click();
    await page.locator('[title="More actions"]').first().click();
    await page.getByText('Split').click();

    // Split mode banner should be visible
    await expect(page.getByText('Draw a line across the polygon to split it')).toBeVisible();

    const state = await getStoreState(page);
    const rectA = state.features.find((f: any) => f.name === 'Rectangle A');
    expect(state.splittingFeatureId).toBe(rectA!.id);

    // Cancel split
    await page.getByRole('button', { name: 'Cancel' }).click();

    const afterState = await getStoreState(page);
    expect(afterState.splittingFeatureId).toBeNull();
  });

  test('splits a polygon with a line', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    // Select Rectangle A and start split
    await sidebar.getByText('Rectangle A').click();
    await page.locator('[title="More actions"]').first().click();
    await page.getByText('Split').click();

    // Draw a vertical line through the center of Rectangle A
    // Rectangle A is from (9.5,9.5) to (10.5,10.5), center at (10,10)
    const top = await latLngToPixel(page, 10.8, 10);
    const bottom = await latLngToPixel(page, 9.2, 10);

    await page.mouse.click(top.x, top.y);
    await page.waitForTimeout(150);
    await page.mouse.click(bottom.x, bottom.y);
    await page.waitForTimeout(150);
    // Finish the line with double-click
    await page.mouse.dblclick(bottom.x, bottom.y);

    // Wait for the split to complete
    await waitForStoreState(page, 'state.splittingFeatureId === null && state.features.length > 3');

    const state = await getStoreState(page);
    // Split should have created more features than the original 3
    expect(state.features.length).toBeGreaterThan(3);
    // The original Rectangle A should be gone, replaced by split parts
    expect(state.features.find((f: any) => f.name === 'Rectangle A')).toBeUndefined();
    const splitParts = state.features.filter((f: any) => f.name.startsWith('Rectangle A ('));
    expect(splitParts.length).toBeGreaterThanOrEqual(2);
    // Split mode should be off
    expect(state.splittingFeatureId).toBeNull();
  });

  test('shows merge mode banner and can select targets', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    // Select Rectangle A and start merge
    await sidebar.getByText('Rectangle A').click();
    await page.locator('[title="More actions"]').first().click();
    await page.getByText('Merge').click();

    // Merge mode banner should be visible
    await expect(page.getByText(/Click polygons to merge with/)).toBeVisible();

    const state = await getStoreState(page);
    const rectA = state.features.find((f: any) => f.name === 'Rectangle A');
    expect(state.mergingFeatureId).toBe(rectA!.id);

    // Select Triangle B as merge target by clicking its name in sidebar
    await sidebar.getByText('Triangle B').click();

    const afterState = await getStoreState(page);
    const triB = afterState.features.find((f: any) => f.name === 'Triangle B');
    expect(afterState.mergeTargetIds).toContain(triB!.id);

    // Merge button should show count
    await expect(page.getByRole('button', { name: /Merge \(1\)/ })).toBeVisible();
  });

  test('cancels merge mode', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByText('Rectangle A').click();
    await page.locator('[title="More actions"]').first().click();
    await page.getByText('Merge').click();

    // Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    const state = await getStoreState(page);
    expect(state.mergingFeatureId).toBeNull();
  });

  test('merges two overlapping polygons', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    // Start merge from Rectangle A
    await sidebar.getByText('Rectangle A').click();
    await page.locator('[title="More actions"]').first().click();
    await page.getByText('Merge').click();

    // Select Triangle B as target
    await sidebar.getByText('Triangle B').click();

    // Click the Merge button
    await page.getByRole('button', { name: /Merge \(1\)/ }).click();

    // Wait for merge to complete
    await waitForStoreState(page, 'state.mergingFeatureId === null && state.features.length === 2');

    const state = await getStoreState(page);
    // Should have 2 features now (merged + Complex C)
    expect(state.features).toHaveLength(2);
    expect(state.mergingFeatureId).toBeNull();

    // The merged feature should have Rectangle A's name
    const merged = state.features.find((f: any) => f.name === 'Rectangle A');
    expect(merged).toBeTruthy();

    // Triangle B should be gone
    expect(state.features.find((f: any) => f.name === 'Triangle B')).toBeUndefined();
  });
});
