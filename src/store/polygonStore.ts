import { create } from 'zustand';
import type { PolygonFeature } from '../types/polygon';

interface PolygonStore {
  features: PolygonFeature[];
  selectedFeatureId: string | null;
  editingFeatureId: string | null;
  hasUnsavedChanges: boolean;
  isDrawing: boolean;
  hiddenFeatureIds: Set<string>;
  splittingFeatureId: string | null;
  splitError: string | null;

  // Actions
  loadFeatures: (features: PolygonFeature[]) => void;
  addFeature: (feature: PolygonFeature) => void;
  updateFeature: (id: string, updates: Partial<PolygonFeature>) => void;
  deleteFeature: (id: string) => void;
  selectFeature: (id: string | null) => void;
  editFeature: (id: string | null) => void;
  appendFeatures: (newFeatures: PolygonFeature[]) => void;
  clearAll: () => void;
  setUnsavedChanges: (value: boolean) => void;
  startDrawing: () => void;
  stopDrawing: () => void;
  toggleFeatureVisibility: (id: string) => void;
  showLabels: boolean;
  toggleLabels: () => void;
  startSplitting: (id: string) => void;
  stopSplitting: () => void;
  splitFeature: (id: string, resultPolygons: import('geojson').Polygon[]) => void;
  setSplitError: (error: string | null) => void;
}

export const usePolygonStore = create<PolygonStore>((set) => ({
  features: [],
  selectedFeatureId: null,
  editingFeatureId: null,
  hasUnsavedChanges: false,
  isDrawing: false,
  hiddenFeatureIds: new Set(),
  showLabels: false,
  splittingFeatureId: null,
  splitError: null,

  loadFeatures: (features) =>
    set({
      features,
      selectedFeatureId: null,
      editingFeatureId: null,
      hasUnsavedChanges: false,
    }),

  appendFeatures: (newFeatures) =>
    set((state) => ({
      features: [...state.features, ...newFeatures],
      hasUnsavedChanges: true,
    })),

  addFeature: (feature) =>
    set((state) => ({
      features: [...state.features, feature],
      hasUnsavedChanges: true,
    })),

  updateFeature: (id, updates) =>
    set((state) => ({
      features: state.features.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
      hasUnsavedChanges: true,
    })),

  deleteFeature: (id) =>
    set((state) => ({
      features: state.features.filter((f) => f.id !== id),
      selectedFeatureId:
        state.selectedFeatureId === id ? null : state.selectedFeatureId,
      editingFeatureId:
        state.editingFeatureId === id ? null : state.editingFeatureId,
      splittingFeatureId:
        state.splittingFeatureId === id ? null : state.splittingFeatureId,
      splitError: state.splittingFeatureId === id ? null : state.splitError,
      hasUnsavedChanges: true,
    })),

  selectFeature: (id) =>
    set((state) => ({
      selectedFeatureId: id,
      // Stop editing if selecting a different polygon
      editingFeatureId:
        state.editingFeatureId !== id ? null : state.editingFeatureId,
    })),

  editFeature: (id) =>
    set({
      editingFeatureId: id,
      // Editing implies selection
      selectedFeatureId: id,
      splittingFeatureId: null,
      splitError: null,
    }),

  clearAll: () =>
    set({
      features: [],
      selectedFeatureId: null,
      editingFeatureId: null,
      hasUnsavedChanges: false,
      hiddenFeatureIds: new Set(),
      splittingFeatureId: null,
      splitError: null,
    }),

  setUnsavedChanges: (value) =>
    set({
      hasUnsavedChanges: value,
    }),

  startDrawing: () =>
    set({
      isDrawing: true,
      editingFeatureId: null,
      splittingFeatureId: null,
      splitError: null,
    }),

  stopDrawing: () =>
    set({
      isDrawing: false,
    }),

  toggleLabels: () =>
    set((state) => ({ showLabels: !state.showLabels })),

  toggleFeatureVisibility: (id) =>
    set((state) => {
      const next = new Set(state.hiddenFeatureIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { hiddenFeatureIds: next };
    }),

  startSplitting: (id) =>
    set({
      splittingFeatureId: id,
      selectedFeatureId: id,
      editingFeatureId: null,
      isDrawing: false,
      splitError: null,
    }),

  stopSplitting: () =>
    set({
      splittingFeatureId: null,
      splitError: null,
    }),

  splitFeature: (id, resultPolygons) =>
    set((state) => {
      const idx = state.features.findIndex((f) => f.id === id);
      if (idx === -1) return state;

      const original = state.features[idx];
      const newFeatures = resultPolygons.map((geometry, i) => ({
        id: crypto.randomUUID(),
        name: `${original.name} (${i + 1})`,
        geometry,
        properties: {
          ...original.properties,
          name: `${original.name} (${i + 1})`,
        },
      }));

      const features = [...state.features];
      features.splice(idx, 1, ...newFeatures);

      return {
        features,
        selectedFeatureId: newFeatures[0].id,
        splittingFeatureId: null,
        splitError: null,
        hasUnsavedChanges: true,
      };
    }),

  setSplitError: (error) =>
    set({ splitError: error }),
}));
