import { create } from 'zustand';
import type { PolygonFeature, PolygonGroup } from '../types/polygon';
import type { Polygon } from 'geojson';
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
  simplifyPreview: { featureId: string; geometry: Polygon } | null;

  // Group state
  groups: PolygonGroup[];
  hiddenGroupIds: Set<string>;
  collapsedGroupIds: Set<string>;

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
  setSimplifyPreview: (featureId: string, geometry: Polygon | null) => void;

  // Group actions
  createGroup: (name: string, featureIds?: string[]) => void;
  renameGroup: (groupId: string, name: string) => void;
  deleteGroup: (groupId: string) => void;
  addToGroup: (featureIds: string[], groupId: string) => void;
  removeFromGroup: (featureIds: string[]) => void;
  toggleGroupVisibility: (groupId: string) => void;
  toggleGroupCollapsed: (groupId: string) => void;
  setGroupColor: (groupId: string, color: string) => void;
  focusGroup: (groupId: string) => void;
  reorderFeature: (featureId: string, targetGroupId: string | null, insertBeforeId?: string) => void;
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
  simplifyPreview: null,

  // Group state
  groups: [],
  hiddenGroupIds: new Set(),
  collapsedGroupIds: new Set(),

  loadFeatures: (features) =>
    set({
      features,
      selectedFeatureId: null,
      editingFeatureId: null,
      hasUnsavedChanges: false,
      simplifyPreview: null,
      groups: [],
      hiddenGroupIds: new Set(),
      collapsedGroupIds: new Set(),
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
      simplifyPreview: state.simplifyPreview?.featureId === id ? null : state.simplifyPreview,
      hasUnsavedChanges: true,
    })),

  selectFeature: (id) =>
    set((state) => ({
      selectedFeatureId: id,
      editingFeatureId:
        state.editingFeatureId !== id ? null : state.editingFeatureId,
      simplifyPreview:
        state.simplifyPreview && state.simplifyPreview.featureId !== id
          ? null
          : state.simplifyPreview,
    })),

  editFeature: (id) =>
    set({
      editingFeatureId: id,
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
      simplifyPreview: null,
      groups: [],
      hiddenGroupIds: new Set(),
      collapsedGroupIds: new Set(),
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
      hiddenGroupIds: visible
        ? new Set<string>()
        : new Set(state.groups.map((g) => g.id)),
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
        groupId: original.groupId,
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

      const initiatorIdx = state.features.findIndex((f) => f.id === state.mergingFeatureId);
      const mergedFeature: PolygonFeature = {
        id: crypto.randomUUID(),
        name: initiator.name,
        geometry: result.geometry,
        groupId: initiator.groupId,
        properties: { ...initiator.properties },
      };

      const sourceIds = new Set(allIds);
      const features = [...state.features];
      const filtered = features.filter((f) => !sourceIds.has(f.id));
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
      hiddenGroupIds: new Set(),
    }),

  setSimplifyPreview: (featureId, geometry) =>
    set({
      simplifyPreview: geometry ? { featureId, geometry } : null,
    }),

  // ── Group actions ──────────────────────────────────────────────

  createGroup: (name, featureIds) =>
    set((state) => {
      const id = crypto.randomUUID();
      const group: PolygonGroup = { id, name };
      const features = featureIds
        ? state.features.map((f) =>
            featureIds.includes(f.id) ? { ...f, groupId: id } : f
          )
        : state.features;
      return { groups: [...state.groups, group], features };
    }),

  renameGroup: (groupId, name) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, name } : g
      ),
    })),

  deleteGroup: (groupId) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
      features: state.features.map((f) =>
        f.groupId === groupId ? { ...f, groupId: undefined } : f
      ),
      hiddenGroupIds: (() => {
        const next = new Set(state.hiddenGroupIds);
        next.delete(groupId);
        return next;
      })(),
      collapsedGroupIds: (() => {
        const next = new Set(state.collapsedGroupIds);
        next.delete(groupId);
        return next;
      })(),
    })),

  addToGroup: (featureIds, groupId) =>
    set((state) => ({
      features: state.features.map((f) =>
        featureIds.includes(f.id) ? { ...f, groupId } : f
      ),
    })),

  removeFromGroup: (featureIds) =>
    set((state) => ({
      features: state.features.map((f) =>
        featureIds.includes(f.id) ? { ...f, groupId: undefined } : f
      ),
    })),

  toggleGroupVisibility: (groupId) =>
    set((state) => {
      const memberIds = state.features
        .filter((f) => f.groupId === groupId)
        .map((f) => f.id);
      const nextGroupIds = new Set(state.hiddenGroupIds);
      const nextFeatureIds = new Set(state.hiddenFeatureIds);
      const hiding = !nextGroupIds.has(groupId);

      if (hiding) {
        nextGroupIds.add(groupId);
        for (const id of memberIds) nextFeatureIds.add(id);
      } else {
        nextGroupIds.delete(groupId);
        for (const id of memberIds) nextFeatureIds.delete(id);
      }

      return { hiddenGroupIds: nextGroupIds, hiddenFeatureIds: nextFeatureIds };
    }),

  toggleGroupCollapsed: (groupId) =>
    set((state) => {
      const next = new Set(state.collapsedGroupIds);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return { collapsedGroupIds: next };
    }),

  setGroupColor: (groupId, color) =>
    set((state) => ({
      features: state.features.map((f) =>
        f.groupId === groupId
          ? {
              ...f,
              properties: {
                ...f.properties,
                style: { ...f.properties.style, fillColor: color, strokeColor: color },
              },
            }
          : f
      ),
      hasUnsavedChanges: true,
    })),

  focusGroup: (groupId) =>
    set((state) => {
      const groupFeatureIds = new Set(
        state.features.filter((f) => f.groupId === groupId).map((f) => f.id)
      );
      const hiddenFeatureIds = new Set(
        state.features.filter((f) => !groupFeatureIds.has(f.id)).map((f) => f.id)
      );
      return {
        focusedFeatureId: null,
        hiddenFeatureIds,
        hiddenGroupIds: new Set(
          state.groups.filter((g) => g.id !== groupId).map((g) => g.id)
        ),
      };
    }),

  reorderFeature: (featureId, targetGroupId, insertBeforeId) =>
    set((state) => {
      const featureIdx = state.features.findIndex((f) => f.id === featureId);
      if (featureIdx === -1) return state;

      const feature = { ...state.features[featureIdx], groupId: targetGroupId ?? undefined };
      const without = state.features.filter((f) => f.id !== featureId);

      if (insertBeforeId) {
        const beforeIdx = without.findIndex((f) => f.id === insertBeforeId);
        if (beforeIdx !== -1) {
          without.splice(beforeIdx, 0, feature);
          return { features: without };
        }
      }

      // If no insertBefore, append at the end of the target group (or end of ungrouped)
      if (targetGroupId) {
        let lastInGroup = -1;
        for (let i = without.length - 1; i >= 0; i--) {
          if (without[i].groupId === targetGroupId) { lastInGroup = i; break; }
        }
        without.splice(lastInGroup + 1, 0, feature);
      } else {
        // Insert at end of ungrouped features (before first grouped feature or at end)
        const firstGrouped = without.findIndex((f) => f.groupId);
        if (firstGrouped !== -1) {
          without.splice(firstGrouped, 0, feature);
        } else {
          without.push(feature);
        }
      }

      return { features: without };
    }),
}));

if (import.meta.env.DEV || import.meta.env.VITE_E2E) {
  (window as any).__polygonStore = usePolygonStore;
}
