import { useEffect, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { usePolygonStore } from '../../store/polygonStore';
import { DEFAULT_STYLE } from '../../types/polygon';
import type { PolygonFeature } from '../../types/polygon';
import type { Polygon } from 'geojson';

type ExtendedPolygon = L.Polygon & { featureId?: string };

const SELECTED_STYLE = {
  color: '#ff7800',
  weight: 4,
  fillOpacity: 0.5,
} as const;

function featureStyle(feature: PolygonFeature, selected: boolean): L.PolylineOptions {
  const { style } = feature.properties;
  if (selected) {
    return {
      fillColor: style.fillColor,
      fillOpacity: SELECTED_STYLE.fillOpacity,
      color: SELECTED_STYLE.color,
      weight: SELECTED_STYLE.weight,
    };
  }
  return {
    fillColor: style.fillColor,
    fillOpacity: style.fillOpacity,
    color: style.strokeColor,
    weight: style.strokeWidth,
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

  const features = usePolygonStore((s) => s.features);
  const selectedFeatureId = usePolygonStore((s) => s.selectedFeatureId);
  const editingFeatureId = usePolygonStore((s) => s.editingFeatureId);
  const selectFeature = usePolygonStore((s) => s.selectFeature);

  const handleLayerClick = useCallback(
    (featureId: string) => {
      if (!isDrawingRef.current) {
        selectFeature(featureId);
      }
    },
    [selectFeature]
  );

  // ── Geoman toolbar + events (runs once per map) ──────────────────
  useEffect(() => {
    // Add Geoman controls — only polygon drawing, edit, and remove
    map.pm.addControls({
      position: 'topright',
      drawPolygon: true,
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

    map.pm.setGlobalOptions({
      pathOptions: {
        color: DEFAULT_STYLE.strokeColor,
        fillColor: DEFAULT_STYLE.fillColor,
        fillOpacity: DEFAULT_STYLE.fillOpacity,
        weight: DEFAULT_STYLE.strokeWidth,
      },
      snappable: true,
    });

    // ── Drawing events ──
    const onDrawStart = () => {
      isDrawingRef.current = true;
    };
    const onDrawEnd = () => {
      isDrawingRef.current = false;
    };

    const onCreate = (e: { layer: L.Layer }) => {
      const layer = e.layer as ExtendedPolygon;
      const geoJson = layer.toGeoJSON();
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

    map.on('pm:drawstart', onDrawStart);
    map.on('pm:drawend', onDrawEnd);
    map.on('pm:create', onCreate as L.LeafletEventHandlerFn);

    return () => {
      map.pm.removeControls();
      map.off('pm:drawstart', onDrawStart);
      map.off('pm:drawend', onDrawEnd);
      map.off('pm:create', onCreate as L.LeafletEventHandlerFn);
      isDrawingRef.current = false;
    };
  }, [map]);

  // ── Diff-based layer sync ────────────────────────────────────────
  useEffect(() => {
    const layerMap = layerMapRef.current;
    const currentIds = new Set(features.map((f) => f.id));

    // 1. Remove layers for features that no longer exist
    for (const [id, layer] of layerMap) {
      if (!currentIds.has(id)) {
        layer.pm.disable();
        map.removeLayer(layer);
        layerMap.delete(id);
      }
    }

    // 2. Add or update layers for each feature
    features.forEach((feature) => {
      const isSelected = feature.id === selectedFeatureId;
      const isEditing = feature.id === editingFeatureId;
      const existingLayer = layerMap.get(feature.id);

      if (existingLayer) {
        // Only update geometry if NOT being edited — Geoman manages its own geometry
        if (!existingLayer.pm.enabled()) {
          existingLayer.setLatLngs(toLatLngs(feature.geometry));
        }
        existingLayer.setStyle(featureStyle(feature, isSelected));

        // Update tooltip content only when name changed
        if (existingLayer.getTooltip()?.getContent() !== feature.name) {
          existingLayer.unbindTooltip();
          existingLayer.bindTooltip(feature.name, { sticky: true });
        }

        // Toggle edit mode based on editingFeatureId
        if (isEditing && !existingLayer.pm.enabled()) {
          existingLayer.pm.enable();
        } else if (!isEditing && existingLayer.pm.enabled()) {
          existingLayer.pm.disable();
        }
      } else {
        // Create new layer
        const polygon = L.polygon(toLatLngs(feature.geometry), featureStyle(feature, isSelected)) as ExtendedPolygon;
        polygon.featureId = feature.id;
        polygon.bindTooltip(feature.name, { sticky: true });

        // Click to select
        polygon.on('click', () => handleLayerClick(feature.id));

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
  }, [features, selectedFeatureId, editingFeatureId, map, handleLayerClick]);

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
