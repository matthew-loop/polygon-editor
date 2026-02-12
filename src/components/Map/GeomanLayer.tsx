import { useEffect, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { usePolygonStore } from '../../store/polygonStore';
import { useThemeStore } from '../../store/themeStore';
import { DEFAULT_STYLE } from '../../types/polygon';
import type { PolygonFeature } from '../../types/polygon';
import type { Polygon, Position } from 'geojson';
import { splitPolygon } from '../../utils/splitPolygon';

type ExtendedPolygon = L.Polygon & { featureId?: string };

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function featureStyle(selected: boolean): L.PolylineOptions {
  const accent = getCssVar('--color-accent');
  if (selected) {
    return {
      fillColor: accent,
      fillOpacity: 0.3,
      color: getCssVar('--color-editing'),
      weight: 3,
    };
  }
  return {
    fillColor: accent,
    fillOpacity: 0.15,
    color: accent,
    weight: 2,
  };
}

function toLatLngs(geometry: Polygon): L.LatLng[][] {
  return geometry.coordinates.map((ring) =>
    ring.map(([lng, lat]) => L.latLng(lat, lng))
  );
}

export function GeomanLayer() {
  const map = useMap();

  // Track Leaflet layers by feature ID for diff-based updates
  const layerMapRef = useRef<Map<string, ExtendedPolygon>>(new Map());

  // Track whether Geoman is actively drawing
  const isDrawingRef = useRef(false);
  // Track whether we're in split-line drawing mode
  const isSplittingRef = useRef(false);
  // Flag to skip the map click handler when a polygon was just clicked
  const layerClickedRef = useRef(false);
  const prevShowLabelsRef = useRef(false);

  const features = usePolygonStore((s) => s.features);
  const selectedFeatureId = usePolygonStore((s) => s.selectedFeatureId);
  const editingFeatureId = usePolygonStore((s) => s.editingFeatureId);
  const hiddenFeatureIds = usePolygonStore((s) => s.hiddenFeatureIds);
  const showLabels = usePolygonStore((s) => s.showLabels);
  const splittingFeatureId = usePolygonStore((s) => s.splittingFeatureId);
  const mergingFeatureId = usePolygonStore((s) => s.mergingFeatureId);
  const mergeTargetIds = usePolygonStore((s) => s.mergeTargetIds);
  const selectFeature = usePolygonStore((s) => s.selectFeature);

  const handleLayerClick = useCallback(
    (featureId: string) => {
      if (isDrawingRef.current || isSplittingRef.current) return;
      const state = usePolygonStore.getState();
      if (state.mergingFeatureId) {
        if (featureId !== state.mergingFeatureId) {
          state.toggleMergeTarget(featureId);
        }
        return;
      }
      if (state.editingFeatureId && state.editingFeatureId !== featureId) return;
      selectFeature(featureId);
    },
    [selectFeature]
  );

  // Click empty map space to deselect (only when not editing or drawing)
  useEffect(() => {
    const handleMapClick = () => {
      // Skip if a polygon layer was just clicked (Leaflet fires both layer + map click)
      if (layerClickedRef.current) {
        layerClickedRef.current = false;
        return;
      }
      const { editingFeatureId, selectedFeatureId, isDrawing, splittingFeatureId, mergingFeatureId } = usePolygonStore.getState();
      if (!editingFeatureId && selectedFeatureId && !isDrawing && !isDrawingRef.current && !splittingFeatureId && !mergingFeatureId) {
        selectFeature(null);
      }
    };
    map.on('click', handleMapClick);
    return () => { map.off('click', handleMapClick); };
  }, [map, selectFeature]);

  const isDrawing = usePolygonStore((s) => s.isDrawing);
  const theme = useThemeStore((s) => s.theme);

  // ── Geoman setup + events (runs once per map) ──────────────────
  useEffect(() => {
    // No toolbar — drawing is triggered from the sidebar
    map.pm.addControls({
      position: 'topright',
      drawPolygon: false,
      drawMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawText: false,
      cutPolygon: false,
      rotateMode: false,
      editMode: false,
      dragMode: false,
      removalMode: false,
    });

    const accent = getCssVar('--color-accent');
    map.pm.setGlobalOptions({
      pathOptions: {
        color: accent,
        fillColor: accent,
        fillOpacity: 0.2,
        weight: 2,
      },
      snappable: true,
    });

    // ── Drawing events ──
    const onDrawStart = () => {
      isDrawingRef.current = true;
    };
    const onDrawEnd = () => {
      isDrawingRef.current = false;
      if (isSplittingRef.current) {
        isSplittingRef.current = false;
        usePolygonStore.getState().stopSplitting();
      } else {
        usePolygonStore.getState().stopDrawing();
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onCreate = (e: any) => {
      const layer = e.layer;

      // Handle split-line creation
      if (e.shape === 'Line' && isSplittingRef.current) {
        const geoJson = (layer as L.Polyline).toGeoJSON();
        map.removeLayer(layer);

        const { splittingFeatureId, features } = usePolygonStore.getState();
        if (!splittingFeatureId) return;

        const feature = features.find((f) => f.id === splittingFeatureId);
        if (!feature) return;

        const lineCoords = geoJson.geometry.coordinates as Position[];
        const result = splitPolygon(feature.geometry, lineCoords);

        if (result.success) {
          usePolygonStore.getState().splitFeature(splittingFeatureId, result.polygons);
        } else {
          usePolygonStore.getState().setSplitError(result.error);
        }

        isSplittingRef.current = false;
        return;
      }

      // Normal polygon creation
      const polygon = layer as ExtendedPolygon;
      const geoJson = polygon.toGeoJSON();
      const id = crypto.randomUUID();

      const newFeature: PolygonFeature = {
        id,
        name: 'New Polygon',
        geometry: geoJson.geometry as Polygon,
        properties: {
          name: 'New Polygon',
          style: { ...DEFAULT_STYLE },
        },
      };

      // Remove the Geoman-created layer — we manage our own layers
      map.removeLayer(layer);

      usePolygonStore.getState().addFeature(newFeature);
      usePolygonStore.getState().selectFeature(id);
      isDrawingRef.current = false;
    };

    const onRemove = (e: { layer: L.Layer }) => {
      const layer = e.layer as ExtendedPolygon;
      if (layer.featureId) {
        // Remove from layerMapRef BEFORE the store update triggers the sync
        // effect, so sync won't try to call pm.disable() on the detached layer
        layerMapRef.current.delete(layer.featureId);
        usePolygonStore.getState().deleteFeature(layer.featureId);
      }
    };

    map.on('pm:drawstart', onDrawStart);
    map.on('pm:drawend', onDrawEnd);
    map.on('pm:create', onCreate as L.LeafletEventHandlerFn);
    map.on('pm:remove', onRemove as L.LeafletEventHandlerFn);

    return () => {
      map.pm.removeControls();
      map.off('pm:drawstart', onDrawStart);
      map.off('pm:drawend', onDrawEnd);
      map.off('pm:create', onCreate as L.LeafletEventHandlerFn);
      map.off('pm:remove', onRemove as L.LeafletEventHandlerFn);
      isDrawingRef.current = false;
    };
  }, [map]);

  // ── Update draw style when theme changes ────────────────────────
  useEffect(() => {
    const accent = getCssVar('--color-accent');
    map.pm.setGlobalOptions({
      pathOptions: {
        color: accent,
        fillColor: accent,
        fillOpacity: 0.2,
        weight: 2,
      },
    });
  }, [theme, map]);

  // ── Toggle draw mode when isDrawing changes ────────────────────
  useEffect(() => {
    if (isDrawing) {
      map.pm.enableDraw('Polygon');
    } else if (!splittingFeatureId && map.pm.globalDrawModeEnabled()) {
      map.pm.disableDraw();
    }
  }, [isDrawing, splittingFeatureId, map]);

  // ── Toggle split-line draw mode ────────────────────────────────
  useEffect(() => {
    if (splittingFeatureId) {
      isSplittingRef.current = true;
      const editingColor = getCssVar('--color-editing');
      map.pm.enableDraw('Line', {
        snappable: true,
        templineStyle: { dashArray: '8,8', color: editingColor },
        hintlineStyle: { dashArray: '8,8', color: editingColor, opacity: 0.5 },
      });
    } else if (!isDrawing && map.pm.globalDrawModeEnabled()) {
      map.pm.disableDraw();
      isSplittingRef.current = false;
    }
  }, [splittingFeatureId, isDrawing, map]);

  // ── Diff-based layer sync ────────────────────────────────────────
  useEffect(() => {
    const layerMap = layerMapRef.current;
    const currentIds = new Set(features.map((f) => f.id));

    // 1. Remove layers for features that no longer exist or are hidden
    for (const [id, layer] of layerMap) {
      if (!currentIds.has(id) || hiddenFeatureIds.has(id)) {
        layer.pm.disable();
        map.removeLayer(layer);
        layerMap.delete(id);
      }
    }

    // 2. Add or update layers for each visible feature
    features.forEach((feature) => {
      if (hiddenFeatureIds.has(feature.id)) return;

      const isSelected = feature.id === selectedFeatureId;
      const isEditing = feature.id === editingFeatureId;
      const isSplitting = feature.id === splittingFeatureId;
      const isMergeInitiator = feature.id === mergingFeatureId;
      const isMergeTarget = mergeTargetIds.includes(feature.id);
      const existingLayer = layerMap.get(feature.id);

      if (existingLayer) {
        // Only update geometry if NOT being edited — Geoman manages its own geometry
        if (!existingLayer.pm.enabled()) {
          existingLayer.setLatLngs(toLatLngs(feature.geometry));
        }
        if (isMergeInitiator) {
          existingLayer.setStyle({
            fillColor: '#3b82f6',
            fillOpacity: 0.25,
            color: '#3b82f6',
            weight: 3,
            dashArray: undefined,
          });
        } else if (isMergeTarget) {
          existingLayer.setStyle({
            fillColor: '#3b82f6',
            fillOpacity: 0.2,
            color: '#3b82f6',
            weight: 3,
            dashArray: '6,6',
          });
        } else if (isSplitting) {
          existingLayer.setStyle({
            ...featureStyle(true),
            dashArray: '8,8',
            color: '#d97706',
            weight: 3,
          });
        } else {
          existingLayer.setStyle(featureStyle(isSelected));
        }

        // Rebind tooltip when name or label mode changes
        if (
          existingLayer.getTooltip()?.getContent() !== feature.name ||
          showLabels !== prevShowLabelsRef.current
        ) {
          existingLayer.unbindTooltip();
          existingLayer.bindTooltip(
            feature.name,
            showLabels
              ? { permanent: true, direction: 'center', className: 'polygon-label', offset: [0, 0] }
              : { sticky: true }
          );
        }

        // Toggle edit mode based on editingFeatureId
        if (isEditing && !existingLayer.pm.enabled()) {
          existingLayer.pm.enable();
        } else if (!isEditing && existingLayer.pm.enabled()) {
          existingLayer.pm.disable();
        }
      } else {
        // Create new layer
        const polygon = L.polygon(toLatLngs(feature.geometry), featureStyle(isSelected)) as ExtendedPolygon;
        polygon.featureId = feature.id;
        polygon.bindTooltip(
          feature.name,
          showLabels
            ? { permanent: true, direction: 'center', className: 'polygon-label', offset: [0, 0] }
            : { sticky: true }
        );

        // Click to select (set flag so the map click handler doesn't deselect)
        polygon.on('click', () => {
          layerClickedRef.current = true;
          handleLayerClick(feature.id);
        });

        // Right-click to open context menu
        polygon.on('contextmenu', (e: L.LeafletMouseEvent) => {
          L.DomEvent.preventDefault(e.originalEvent);
          layerClickedRef.current = true;
          usePolygonStore.getState().openContextMenu(
            feature.id,
            e.originalEvent.clientX,
            e.originalEvent.clientY
          );
        });

        // Edit event — sync geometry back to store
        polygon.on('pm:edit', () => {
          const geoJson = polygon.toGeoJSON();
          usePolygonStore.getState().updateFeature(feature.id, {
            geometry: geoJson.geometry as Polygon,
          });
        });

        if (isEditing) {
          polygon.pm.enable();
        }

        polygon.addTo(map);
        layerMap.set(feature.id, polygon);
      }
    });
    prevShowLabelsRef.current = showLabels;
  }, [features, selectedFeatureId, editingFeatureId, splittingFeatureId, mergingFeatureId, mergeTargetIds, hiddenFeatureIds, showLabels, map, handleLayerClick, theme]);

  // ── Cleanup all layers on unmount ────────────────────────────────
  useEffect(() => {
    const layerMap = layerMapRef.current;
    return () => {
      for (const [, layer] of layerMap) {
        layer.pm.disable();
        map.removeLayer(layer);
      }
      layerMap.clear();
    };
  }, [map]);

  return null;
}
