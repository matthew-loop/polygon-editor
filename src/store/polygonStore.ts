import { create } from 'zustand';
import type { PolygonFeature } from '../types/polygon';

interface PolygonStore {
  features: PolygonFeature[];
  selectedFeatureId: string | null;
  hasUnsavedChanges: boolean;

  // Actions
  loadFeatures: (features: PolygonFeature[]) => void;
  addFeature: (feature: PolygonFeature) => void;
  updateFeature: (id: string, updates: Partial<PolygonFeature>) => void;
  deleteFeature: (id: string) => void;
  selectFeature: (id: string | null) => void;
  clearAll: () => void;
  setUnsavedChanges: (value: boolean) => void;
}

export const usePolygonStore = create<PolygonStore>((set) => ({
  features: [],
  selectedFeatureId: null,
  hasUnsavedChanges: false,

  loadFeatures: (features) =>
    set({
      features,
      selectedFeatureId: null,
      hasUnsavedChanges: false,
    }),

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
      hasUnsavedChanges: true,
    })),

  selectFeature: (id) =>
    set({
      selectedFeatureId: id,
    }),

  clearAll: () =>
    set({
      features: [],
      selectedFeatureId: null,
      hasUnsavedChanges: false,
    }),

  setUnsavedChanges: (value) =>
    set({
      hasUnsavedChanges: value,
    }),
}));
