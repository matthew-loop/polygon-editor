# Polygon Editor — Open Issues

10 open issues, 2 fixed: 1 GeomanLayer bug, 5 UX, 2 store design, 1 data model, 1 dependency.

---

## Bugs in GeomanLayer

### 1. `pm:remove` Race Condition with Sync Effect

**File:** `src/components/Map/GeomanLayer.tsx`

**Problem:** When removal mode is active and the user clicks a polygon:
1. Geoman removes the layer from the map
2. `pm:remove` fires -> handler calls `deleteFeature(featureId)`
3. Store update triggers the sync effect
4. Sync tries `layer.pm.disable()` on the already-removed layer

Calling `pm.disable()` on a layer that's no longer on the map may throw or silently fail. Currently no `pm:remove` handler is registered at all, so Geoman removal mode is not connected to the store.

**Fix:** Add a `pm:remove` handler that removes the layer from `layerMapRef` immediately, before calling `deleteFeature()` on the store.

---

## UX Issues

### 2. `loadFeatures` Replaces All Existing Polygons

**File:** `src/store/polygonStore.ts`

**Problem:** Uploading a new KML file calls `loadFeatures()` which replaces the entire `features` array. Existing polygons are lost with no warning or merge option.

**Fix:** Add an `appendFeatures` action, or show a dialog asking "Replace all or merge?" when polygons already exist.

---

### ~~3. Native `confirm()` and `alert()` Dialogs~~ FIXED

Replaced with custom `ConfirmModal` component (`src/components/ConfirmModal.tsx`). Used in `PolygonListItem.tsx` for delete confirmation and `Sidebar.tsx` for clear-all confirmation.

---

### 4. No Simplify Preview on Map

**File:** `src/components/Sidebar/SimplifyPanel.tsx`

**Problem:** The simplify panel shows point counts but never previews the simplified shape on the map. The user has to guess whether the simplification is acceptable before clicking "Apply."

**Fix:** While the slider is adjusted, render a semi-transparent preview polygon on the map showing the simplified shape alongside the original.

---

### 5. Simplify is Destructive — No Undo

**Files:** `src/components/Sidebar/SimplifyPanel.tsx`, `src/store/polygonStore.ts`

**Problem:** Once "Apply" is clicked, the original geometry is permanently replaced. There's no undo capability.

**Fix:** Add undo/redo (e.g. zundo middleware), or store `originalGeometry` on first simplify with a "Reset" button.

---

### ~~6. No Zoom-to-Polygon on Sidebar Selection~~ FIXED

`MapBoundsHandler.tsx` now has a `useEffect` that calls `map.flyToBounds()` with padding when `selectedFeatureId` changes.

---

### 7. MapBoundsHandler Only Fits on Initial Load

**File:** `src/components/Map/MapBoundsHandler.tsx`

**Problem:** Bounds are only fit when going from zero to some features. Subsequent imports won't adjust the view. The handler tracks `prevFeaturesLength` (a count) rather than the set of feature IDs.

**Fix:** Track feature IDs rather than count. Re-fit bounds when the *set* of features changes, not just on initial load.

---

## Store Design Issues

### 8. Shallow Spread in `updateFeature` — Fragile Deep Updates

**File:** `src/store/polygonStore.ts`

**Problem:** `updateFeature` uses a shallow spread. Passing `{ properties: { name: 'new' } }` replaces the entire `properties` object (including `style`). `Sidebar.tsx` works around this by manually reconstructing the full `properties` object.

**Fix:** Use Immer middleware, write specific action methods, or use a deep merge utility.

---

### 9. Duplicate `name` Field on `PolygonFeature`

**Files:** `src/types/polygon.ts`, `src/components/Sidebar/Sidebar.tsx`, `src/components/Map/GeomanLayer.tsx`

**Problem:** `PolygonFeature` has `name` at the top level AND `properties.name`. Both must be kept in sync manually. If either is missed, the polygon name in sidebar vs. tooltip vs. export will diverge.

**Fix:** Remove the top-level `name` and use `properties.name` as the single source of truth.

---

## Data Model Issues

### 10. KML Export Loses Style Data

**File:** `src/services/kmlExporter.ts`

**Problem:** `exportToKml()` only includes `name` and `description` — style data (fill, stroke, opacity, weight) is dropped. Round-tripping through KML export -> import loses all polygon styling. The GeoJSON export correctly includes style properties.

**Fix:** Include style properties in the KML export via `tokml`'s `simplestyle` option, or map to KML `<Style>` elements.

---

## Dependencies

### 11. `tokml` is Unmaintained

**Files:** `src/services/kmlExporter.ts`, `src/types/tokml.d.ts`, `package.json`

**Problem:** `tokml` (v0.4.0) hasn't been updated in years, has no ESM support (requiring the custom type declaration `tokml.d.ts`).

**Fix:** Write a simple KML serializer (this also fixes issue #10 more reliably), or keep `tokml` if it works fine.

---

### 12. Bundle Size Exceeds 500KB Warning

**Problem:** The single JS chunk (~714KB) includes Leaflet, Geoman, and all application code.

**Fix:** Use `manualChunks` to split Leaflet + Geoman into a vendor chunk. Low priority — gzipped size is reasonable for a map app.

---

## Implementation Priority

### Medium Effort
- **#1** Fix pm:remove race condition / add handler
- **#9** Deduplicate name field on PolygonFeature
- **#8** Fix shallow merge in updateFeature
- **#10** Fix KML export to include style data
- **#2** Add append/merge option for file uploads
- **#7** Improve MapBoundsHandler to handle new features

### Larger Effort
- **#4 + #5** Add simplify preview and undo support
- **#11** Replace or rewrite tokml
- **#12** Code-split the bundle
