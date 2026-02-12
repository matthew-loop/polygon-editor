import { create } from 'zustand';
import type { PolygonFeature } from '../types/polygon';
import { mergePolygons } from '../utils/mergePolygons';

interface PolygonStore {
  features: PolygonFeature[];
  selectedFeatureId: string | null;
  editingFeatureId: string | null;
  hasUnsavedChanges: boolean;
  isDrawing: boolean;
  hiddenFeatureIds: Set<string>;
  splittingFeatureId: string | null;
  splitError: string | null;
  mergingFeatureId: string | null;
  mergeTargetIds: string[];
  mergeError: string | null;
  contextMenu: { featureId: string; x: number; y: number } | null;
  focusedFeatureId: string | null;

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
  setAllFeaturesVisibility: (visible: boolean) => void;
  showLabels: boolean;
  toggleLabels: () => void;
  startSplitting: (id: string) => void;
  stopSplitting: () => void;
  splitFeature: (id: string, resultPolygons: import('geojson').Polygon[]) => void;
  setSplitError: (error: string | null) => void;
  startMerging: (id: string) => void;
  stopMerging: () => void;
  toggleMergeTarget: (id: string) => void;
  mergeFeatures: () => void;
  setMergeError: (error: string | null) => void;
  openContextMenu: (featureId: string, x: number, y: number) => void;
  closeContextMenu: () => void;
  focusFeature: (id: string) => void;
  unfocusAll: () => void;
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
  mergingFeatureId: null,
  mergeTargetIds: [],
  mergeError: null,
  contextMenu: null,
  focusedFeatureId: null,

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
      mergingFeatureId:
        state.mergingFeatureId === id ? null : state.mergingFeatureId,
      mergeTargetIds: state.mergingFeatureId === id
        ? []
        : state.mergeTargetIds.filter((t) => t !== id),
      mergeError: state.mergingFeatureId === id ? null : state.mergeError,
      contextMenu: null,
      focusedFeatureId: state.focusedFeatureId === id ? null : state.focusedFeatureId,
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
      mergingFeatureId: null,
      mergeTargetIds: [],
      mergeError: null,
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
      mergingFeatureId: null,
      mergeTargetIds: [],
      mergeError: null,
      contextMenu: null,
      focusedFeatureId: null,
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
      mergingFeatureId: null,
      mergeTargetIds: [],
      mergeError: null,
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

  setAllFeaturesVisibility: (visible) =>
    set((state) => ({
      hiddenFeatureIds: visible
        ? new Set<string>()
        : new Set(state.features.map((f) => f.id)),
    })),

  startSplitting: (id) =>
    set({
      splittingFeatureId: id,
      selectedFeatureId: id,
      editingFeatureId: null,
      isDrawing: false,
      splitError: null,
      mergingFeatureId: null,
      mergeTargetIds: [],
      mergeError: null,
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
        properties: { ...original.properties },
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

  startMerging: (id) =>
    set({
      mergingFeatureId: id,
      mergeTargetIds: [],
      mergeError: null,
      selectedFeatureId: id,
      editingFeatureId: null,
      isDrawing: false,
      splittingFeatureId: null,
      splitError: null,
    }),

  stopMerging: () =>
    set({
      mergingFeatureId: null,
      mergeTargetIds: [],
      mergeError: null,
    }),

  toggleMergeTarget: (id) =>
    set((state) => {
      if (id === state.mergingFeatureId) return state;
      const targets = state.mergeTargetIds.includes(id)
        ? state.mergeTargetIds.filter((t) => t !== id)
        : [...state.mergeTargetIds, id];
      return { mergeTargetIds: targets, mergeError: null };
    }),

  mergeFeatures: () =>
    set((state) => {
      if (!state.mergingFeatureId || state.mergeTargetIds.length === 0) return state;

      const initiator = state.features.find((f) => f.id === state.mergingFeatureId);
      if (!initiator) return state;

      const allIds = [state.mergingFeatureId, ...state.mergeTargetIds];
      const polygons = allIds
        .map((id) => state.features.find((f) => f.id === id))
        .filter((f): f is PolygonFeature => !!f)
        .map((f) => f.geometry);

      const result = mergePolygons(polygons);
      if (!result.success) {
        return { mergeError: result.error };
      }

      // Insert merged polygon at initiator's position, remove all source polygons
      const initiatorIdx = state.features.findIndex((f) => f.id === state.mergingFeatureId);
      const mergedFeature: PolygonFeature = {
        id: crypto.randomUUID(),
        name: initiator.name,
        geometry: result.geometry,
        properties: { ...initiator.properties },
      };

      const sourceIds = new Set(allIds);
      const features = [...state.features];
      // Remove all source features
      const filtered = features.filter((f) => !sourceIds.has(f.id));
      // Insert merged at the initiator's original position
      const insertIdx = Math.min(initiatorIdx, filtered.length);
      filtered.splice(insertIdx, 0, mergedFeature);

      return {
        features: filtered,
        selectedFeatureId: mergedFeature.id,
        mergingFeatureId: null,
        mergeTargetIds: [],
        mergeError: null,
        hasUnsavedChanges: true,
      };
    }),

  setMergeError: (error) =>
    set({ mergeError: error }),

  openContextMenu: (featureId, x, y) =>
    set({ contextMenu: { featureId, x, y }, selectedFeatureId: featureId }),

  closeContextMenu: () =>
    set({ contextMenu: null }),

  focusFeature: (id) =>
    set((state) => {
      const hiddenFeatureIds = new Set(
        state.features.filter((f) => f.id !== id).map((f) => f.id)
      );
      return {
        focusedFeatureId: id,
        hiddenFeatureIds,
        selectedFeatureId: id,
      };
    }),

  unfocusAll: () =>
    set({
      focusedFeatureId: null,
      hiddenFeatureIds: new Set(),
    }),
}));
