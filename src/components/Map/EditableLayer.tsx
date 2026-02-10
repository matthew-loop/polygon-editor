import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { v4 as uuidv4 } from 'uuid';
import L from 'leaflet';

// Fix for leaflet-draw deprecation warning: _flat is deprecated, use L.LineUtil.isFlat
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(L.Polyline as any)._flat = L.LineUtil.isFlat;

import 'leaflet-draw';
import { usePolygonStore } from '../../store/polygonStore';
import { DEFAULT_STYLE } from '../../types/polygon';
import type { PolygonFeature } from '../../types/polygon';
import type { Polygon } from 'geojson';

type ExtendedPolygon = L.Polygon & { featureId?: string };

// Configure tooltips for leaflet-draw
L.drawLocal.draw.toolbar.buttons.polygon = 'Draw a polygon';
L.drawLocal.draw.toolbar.actions.title = 'Cancel drawing';
L.drawLocal.draw.toolbar.actions.text = 'Cancel';
L.drawLocal.draw.toolbar.finish.title = 'Finish drawing';
L.drawLocal.draw.toolbar.finish.text = 'Finish';
L.drawLocal.draw.toolbar.undo.title = 'Delete last point drawn';
L.drawLocal.draw.toolbar.undo.text = 'Delete last point';
L.drawLocal.draw.handlers.polygon.tooltip.start = 'Click to start drawing a polygon';
L.drawLocal.draw.handlers.polygon.tooltip.cont = 'Click to continue drawing the polygon';
L.drawLocal.draw.handlers.polygon.tooltip.end = 'Click the first point to close this polygon';
L.drawLocal.edit.toolbar.buttons.edit = 'Edit selected polygon';
L.drawLocal.edit.toolbar.buttons.editDisabled = 'Select a polygon to edit';
L.drawLocal.edit.toolbar.buttons.remove = 'Delete selected polygon';
L.drawLocal.edit.toolbar.buttons.removeDisabled = 'Select a polygon to delete';
L.drawLocal.edit.toolbar.actions.save.title = 'Save changes';
L.drawLocal.edit.toolbar.actions.save.text = 'Save';
L.drawLocal.edit.toolbar.actions.cancel.title = 'Cancel editing, discard all changes';
L.drawLocal.edit.toolbar.actions.cancel.text = 'Cancel';
L.drawLocal.edit.handlers.edit.tooltip.text = 'Drag handles to edit polygon vertices';
L.drawLocal.edit.handlers.edit.tooltip.subtext = 'Click cancel to undo changes';
L.drawLocal.edit.handlers.remove.tooltip.text = 'Click on a polygon to remove it';

export function EditableLayer() {
  const map = useMap();

  // Refs for layers
  const displayLayerRef = useRef<L.LayerGroup | null>(null);
  const editableGroupRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  // Refs for state tracking
  const isDrawingRef = useRef(false);
  const isEditingRef = useRef(false);

  // Get store state
  const features = usePolygonStore((state) => state.features);
  const selectedFeatureId = usePolygonStore((state) => state.selectedFeatureId);
  const selectFeature = usePolygonStore((state) => state.selectFeature);

  // Initialize layers and draw control
  useEffect(() => {
    // Always clean up existing layers first to handle HMR and strict mode
    if (displayLayerRef.current) {
      map.removeLayer(displayLayerRef.current);
      displayLayerRef.current = null;
    }
    if (editableGroupRef.current) {
      map.removeLayer(editableGroupRef.current);
      editableGroupRef.current = null;
    }
    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }

    // Display layer for non-selected polygons (not editable)
    const displayLayer = L.layerGroup();
    displayLayerRef.current = displayLayer;
    map.addLayer(displayLayer);

    // Editable group for selected polygon only
    const editableGroup = new L.FeatureGroup();
    editableGroupRef.current = editableGroup;
    map.addLayer(editableGroup);

    // Create draw control
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: {
            color: DEFAULT_STYLE.strokeColor,
            fillColor: DEFAULT_STYLE.fillColor,
            fillOpacity: DEFAULT_STYLE.fillOpacity,
            weight: DEFAULT_STYLE.strokeWidth,
          },
        },
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: editableGroup,
        remove: true,
      },
    });

    drawControlRef.current = drawControl;
    map.addControl(drawControl);

    // Event handlers
    map.on('draw:drawstart', () => {
      isDrawingRef.current = true;
    });

    map.on('draw:drawstop', () => {
      isDrawingRef.current = false;
    });

    map.on('draw:editstart', () => {
      isEditingRef.current = true;
    });

    map.on('draw:editstop', () => {
      isEditingRef.current = false;
    });

    map.on('draw:created', (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Created;
      const layer = event.layer as ExtendedPolygon;
      const geoJson = layer.toGeoJSON();
      const id = uuidv4();

      const newFeature: PolygonFeature = {
        id,
        name: 'New Polygon',
        geometry: geoJson.geometry as Polygon,
        properties: {
          name: 'New Polygon',
          style: { ...DEFAULT_STYLE },
        },
      };

      usePolygonStore.getState().addFeature(newFeature);
      usePolygonStore.getState().selectFeature(id);
      isDrawingRef.current = false;
    });

    map.on('draw:edited', (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Edited;
      event.layers.eachLayer((layer) => {
        const polygon = layer as ExtendedPolygon;
        const featureId = polygon.featureId;
        if (!featureId) return;

        const geoJson = polygon.toGeoJSON();
        usePolygonStore.getState().updateFeature(featureId, {
          geometry: geoJson.geometry as Polygon,
        });
      });
    });

    map.on('draw:deleted', (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Deleted;
      event.layers.eachLayer((layer) => {
        const polygon = layer as ExtendedPolygon;
        const featureId = polygon.featureId;
        if (featureId) {
          usePolygonStore.getState().deleteFeature(featureId);
        }
      });
    });

    return () => {
      map.off('draw:drawstart');
      map.off('draw:drawstop');
      map.off('draw:editstart');
      map.off('draw:editstop');
      map.off('draw:created');
      map.off('draw:edited');
      map.off('draw:deleted');

      if (drawControl) {
        map.removeControl(drawControl);
      }
      if (displayLayer) {
        map.removeLayer(displayLayer);
      }
      if (editableGroup) {
        map.removeLayer(editableGroup);
      }
    };
  }, [map]);

  // Sync features to layers - selected goes to editableGroup, others to displayLayer
  useEffect(() => {
    const displayLayer = displayLayerRef.current;
    const editableGroup = editableGroupRef.current;

    if (!displayLayer || !editableGroup) return;
    if (isDrawingRef.current || isEditingRef.current) return;

    // Clear both layers
    displayLayer.clearLayers();
    editableGroup.clearLayers();

    // Add features to appropriate layer
    features.forEach((feature) => {
      const latLngs = convertToLatLngs(feature);
      const isSelected = feature.id === selectedFeatureId;

      const polygon = L.polygon(latLngs, {
        fillColor: feature.properties.style.fillColor,
        fillOpacity: isSelected ? 0.5 : feature.properties.style.fillOpacity,
        color: isSelected ? '#ff7800' : feature.properties.style.strokeColor,
        weight: isSelected ? 4 : feature.properties.style.strokeWidth,
      }) as ExtendedPolygon;

      polygon.featureId = feature.id;
      polygon.bindTooltip(feature.name, { sticky: true });

      polygon.on('click', () => {
        if (!isDrawingRef.current && !isEditingRef.current) {
          selectFeature(feature.id);
        }
      });

      if (isSelected) {
        // Selected polygon goes to editable group
        editableGroup.addLayer(polygon);
      } else {
        // Non-selected polygons go to display layer
        displayLayer.addLayer(polygon);
      }
    });
  }, [features, selectedFeatureId, selectFeature]);

  return null;
}

// Helper function to convert GeoJSON coordinates to Leaflet LatLng
function convertToLatLngs(feature: PolygonFeature): L.LatLng[][] {
  if (feature.geometry.type === 'Polygon') {
    return feature.geometry.coordinates.map((ring) =>
      ring.map(([lng, lat]) => L.latLng(lat, lng))
    );
  } else {
    // MultiPolygon - use the first polygon
    return feature.geometry.coordinates[0].map((ring) =>
      ring.map(([lng, lat]) => L.latLng(lat, lng))
    );
  }
}
