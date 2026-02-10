# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev`
- **Build:** `npm run build` (runs `tsc -b && vite build`)
- **Lint:** `npm run lint`
- **Preview production build:** `npm run preview`

No test framework is configured.

## Deployment

Pushes to `main` auto-deploy to GitHub Pages via `.github/workflows/deploy.yml`. The Vite `base` is set to `/polygon-editor/`.

## Architecture

A client-side React + TypeScript polygon editor built on Leaflet. Users upload KML files, view/edit polygons on a map, and export as KML or GeoJSON.

**Key dependencies:** React 19, react-leaflet v5, Leaflet-Geoman (`@geoman-io/leaflet-geoman-free`), Zustand, Tailwind CSS v4, Font Awesome, `@tmcw/togeojson`, `tokml`.

### State Management

Two Zustand stores:

- **`polygonStore`** (`src/store/polygonStore.ts`) — polygon data, selection, editing, and drawing state. Key fields: `features: PolygonFeature[]`, `selectedFeatureId`, `editingFeatureId`, `isDrawing`, `hasUnsavedChanges`.
- **`themeStore`** (`src/store/themeStore.ts`) — light/dark theme toggle, persisted to localStorage. Applies `data-theme` attribute on `<html>` for CSS variable theming.

### Data Model

`PolygonFeature` (`src/types/polygon.ts`) wraps a GeoJSON `Polygon` geometry with an `id`, `name`, and `properties` containing style info (`fillColor`, `fillOpacity`, `strokeColor`, `strokeWidth`).

### Map Layer Architecture

`GeomanLayer.tsx` (`src/components/Map/GeomanLayer.tsx`) is the sole map editing component. It uses Leaflet-Geoman for drawing and vertex editing, managing all polygon layers imperatively via a diff-based sync against the store:

- Maintains a `Map<featureId, L.Polygon>` ref to track layers
- On each render: removes stale layers, updates existing layers (geometry, style, edit mode), adds new layers
- Drawing is triggered programmatically (`map.pm.enableDraw('Polygon')`) from the sidebar — the Geoman toolbar is hidden
- Edit mode is toggled per-layer via `polygon.pm.enable()/disable()` based on `editingFeatureId`
- Styles are derived from CSS custom properties (`--color-accent`, `--color-editing`) for theme awareness

`MapBoundsHandler.tsx` auto-fits the map to feature bounds when features are loaded.

### Key Data Flow

1. **Import:** `FileUpload` → `kmlParser.parseKmlFile()` (uses `@tmcw/togeojson`) → `store.loadFeatures()`
2. **Draw:** Sidebar triggers `store.startDrawing()` → `GeomanLayer` enables Geoman draw mode → `pm:create` event → `store.addFeature()`
3. **Edit:** `store.editFeature(id)` → `GeomanLayer` enables `pm` on that layer → `pm:edit` event → `store.updateFeature()`
4. **Simplify:** `SimplifyPanel` uses Ramer-Douglas-Peucker (`src/utils/simplify.ts`) on the selected polygon
5. **Export:** `ExportPanel` → `kmlExporter.exportToKml()` (uses `tokml`) or `exportToGeoJson()` → `fileDownload.ts` → blob download

### Coordinate Convention

GeoJSON uses `[lng, lat]`; Leaflet uses `[lat, lng]`. Conversions happen at the boundary in `GeomanLayer.tsx`.
