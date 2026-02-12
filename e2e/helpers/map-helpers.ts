import { Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Upload a KML file via the file input.
 */
export async function uploadKml(page: Page, filename = 'test-polygons.kml') {
  const filePath = path.resolve(__dirname, '..', 'fixtures', filename);
  const fileInput = page.locator('input[type="file"][accept=".kml"]');
  await fileInput.setInputFiles(filePath);
  // Wait for features to appear in the store
  await page.waitForFunction(() => {
    const store = (window as any).__polygonStore;
    return store?.getState().features.length > 0;
  }, { timeout: 5_000 });
}

/**
 * Get the pixel position on the page for a given lat/lng coordinate.
 */
export async function latLngToPixel(page: Page, lat: number, lng: number): Promise<{ x: number; y: number }> {
  return page.evaluate(({ lat, lng }) => {
    const map = (window as any).__leafletMap;
    if (!map) throw new Error('__leafletMap not found on window');
    const container = map.getContainer();
    const point = map.latLngToContainerPoint([lat, lng]);
    const rect = container.getBoundingClientRect();
    return { x: rect.left + point.x, y: rect.top + point.y };
  }, { lat, lng });
}

/**
 * Click on the map at a specific lat/lng coordinate.
 */
export async function clickMapAt(page: Page, lat: number, lng: number) {
  const { x, y } = await latLngToPixel(page, lat, lng);
  await page.mouse.click(x, y);
}

/**
 * Draw a polygon on the map by clicking a series of lat/lng points.
 * Clicks each point, then clicks the first point again to close the polygon.
 * Geoman finishes drawing when the user clicks back on the first vertex.
 */
export async function drawPolygonOnMap(page: Page, points: [number, number][]) {
  if (points.length < 3) throw new Error('Need at least 3 points');

  for (let i = 0; i < points.length; i++) {
    const [lat, lng] = points[i];
    const { x, y } = await latLngToPixel(page, lat, lng);
    await page.mouse.click(x, y);
    await page.waitForTimeout(150);
  }

  // Click the first point again to close the polygon
  const [firstLat, firstLng] = points[0];
  const { x, y } = await latLngToPixel(page, firstLat, firstLng);
  await page.mouse.click(x, y);
}

/**
 * Get the polygon store state from the exposed dev window object.
 */
export async function getStoreState(page: Page) {
  return page.evaluate(() => {
    const store = (window as any).__polygonStore;
    if (!store) throw new Error('__polygonStore not found on window');
    const state = store.getState();
    return {
      features: state.features,
      selectedFeatureId: state.selectedFeatureId,
      editingFeatureId: state.editingFeatureId,
      isDrawing: state.isDrawing,
      hasUnsavedChanges: state.hasUnsavedChanges,
      hiddenFeatureIds: Array.from(state.hiddenFeatureIds),
      splittingFeatureId: state.splittingFeatureId,
      mergingFeatureId: state.mergingFeatureId,
      mergeTargetIds: state.mergeTargetIds,
      focusedFeatureId: state.focusedFeatureId,
    };
  });
}

/**
 * Get the theme store state.
 */
export async function getThemeState(page: Page) {
  return page.evaluate(() => {
    const store = (window as any).__themeStore;
    if (!store) throw new Error('__themeStore not found on window');
    return store.getState();
  });
}

/**
 * Get the number of Leaflet polygon layers currently on the map.
 */
export async function getMapLayerCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const map = (window as any).__leafletMap;
    if (!map) throw new Error('__leafletMap not found on window');
    let count = 0;
    map.eachLayer((layer: any) => {
      if (layer.featureId) count++;
    });
    return count;
  });
}

/**
 * Fit the map to show specific bounds so our test coordinates are visible.
 * Waits for the map moveend event instead of a fixed timeout.
 */
export async function fitMapToBounds(page: Page, south: number, west: number, north: number, east: number) {
  await page.evaluate(({ south, west, north, east }) => {
    return new Promise<void>((resolve) => {
      const map = (window as any).__leafletMap;
      if (!map) throw new Error('__leafletMap not found on window');
      map.once('moveend', () => resolve());
      map.fitBounds([[south, west], [north, east]]);
    });
  }, { south, west, north, east });
}

/**
 * Wait for the polygon store to reach a specific condition.
 */
export async function waitForStoreState(
  page: Page,
  predicate: string,
  timeout = 5_000,
) {
  await page.waitForFunction(
    (pred: string) => {
      const store = (window as any).__polygonStore;
      if (!store) return false;
      const state = store.getState();
      return new Function('state', `return ${pred}`)(state);
    },
    predicate,
    { timeout },
  );
}
