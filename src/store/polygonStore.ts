import { create } from 'zustand';
import type { PolygonFeature } from '../types/polygon';

interface PolygonStore {
  features: PolygonFeature[];
  selectedFeatureId: string | null;
  editingFeatureId: string | null;
  hasUnsavedChanges: boolean;
  isDrawing: boolean;
  hiddenFeatureIds: Set<string>;

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
}

export const usePolygonStore = create<PolygonStore>((set) => ({
  features: [],
  selectedFeatureId: null,
  editingFeatureId: null,
  hasUnsavedChanges: false,
  isDrawing: false,
  hiddenFeatureIds: new Set(),

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
    }),

  clearAll: () =>
    set({
      features: [],
      selectedFeatureId: null,
      editingFeatureId: null,
      hasUnsavedChanges: false,
      hiddenFeatureIds: new Set(),
    }),

  setUnsavedChanges: (value) =>
    set({
      hasUnsavedChanges: value,
    }),

  startDrawing: () =>
    set({
      isDrawing: true,
      editingFeatureId: null,
    }),

  stopDrawing: () =>
    set({
      isDrawing: false,
    }),

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
}));
