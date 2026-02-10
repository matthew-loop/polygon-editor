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

### State Management

Single Zustand store (`src/store/polygonStore.ts`) holds all app state: the `PolygonFeature[]` array, selected feature ID, and unsaved changes flag. Components access store via `usePolygonStore` selectors.

### Data Model

`PolygonFeature` (`src/types/polygon.ts`) wraps GeoJSON `Polygon | MultiPolygon` geometry with an `id`, `name`, and `properties` containing style info (`fillColor`, `fillOpacity`, `strokeColor`, `strokeWidth`).

### Map Layer Architecture

The map uses two distinct layer groups managed imperatively in `EditableLayer.tsx`:

- **displayLayer** (L.LayerGroup) — non-selected polygons, read-only
- **editableGroup** (L.FeatureGroup) — selected polygon only, wired to `L.Control.Draw` for vertex editing

`PolygonLayer.tsx` exists as an unused declarative react-leaflet alternative. The active rendering path is `EditableLayer`.

### Key Data Flow

1. **Import:** `FileUpload` → `kmlParser.parseKmlFile()` (uses `@tmcw/togeojson`) → `store.loadFeatures()`
2. **Edit:** Leaflet draw events in `EditableLayer` → `store.updateFeature()` / `store.addFeature()`
3. **Simplify:** `SimplifyPanel` uses Ramer-Douglas-Peucker (`src/utils/simplify.ts`) on the selected polygon
4. **Export:** `ExportPanel` → `kmlExporter.exportToKml()` (uses `tokml`) or `exportToGeoJson()` → blob download

### Coordinate Convention

GeoJSON uses `[lng, lat]`; Leaflet uses `[lat, lng]`. Conversions happen at the boundary in `EditableLayer.tsx` and `PolygonLayer.tsx`.
