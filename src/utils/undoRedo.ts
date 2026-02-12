import { usePolygonStore } from '../store/polygonStore';

function resetActiveMode() {
  const state = usePolygonStore.getState();
  const updates: Record<string, unknown> = {};

  if (state.editingFeatureId) updates.editingFeatureId = null;
  if (state.isDrawing) updates.isDrawing = false;
  if (state.splittingFeatureId) {
    updates.splittingFeatureId = null;
    updates.splitError = null;
  }
  if (state.mergingFeatureId) {
    updates.mergingFeatureId = null;
    updates.mergeTargetIds = [];
    updates.mergeError = null;
  }
  if (state.simplifyPreview) updates.simplifyPreview = null;
  if (state.contextMenu) updates.contextMenu = null;

  if (Object.keys(updates).length > 0) {
    usePolygonStore.setState(updates);
  }
}

function fixStaleSelection() {
  const { selectedFeatureId, features } = usePolygonStore.getState();
  if (selectedFeatureId && !features.some((f) => f.id === selectedFeatureId)) {
    usePolygonStore.setState({ selectedFeatureId: null });
  }
}

export function performUndo() {
  const { pastStates } = usePolygonStore.temporal.getState();
  if (pastStates.length === 0) return;

  resetActiveMode();
  usePolygonStore.temporal.getState().undo();
  fixStaleSelection();
  usePolygonStore.setState({ hasUnsavedChanges: true });
}

export function performRedo() {
  const { futureStates } = usePolygonStore.temporal.getState();
  if (futureStates.length === 0) return;

  resetActiveMode();
  usePolygonStore.temporal.getState().redo();
  fixStaleSelection();
  usePolygonStore.setState({ hasUnsavedChanges: true });
}
