import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { usePolygonStore } from '../../store/polygonStore';
import { useThemeStore } from '../../store/themeStore';
import { PolygonListItem } from './PolygonListItem';
import { SimplifyPanel } from './SimplifyPanel';
import { FileUpload } from '../FileUpload';
import { ExportPanel } from '../ExportPanel';
import { ConfirmModal } from '../ConfirmModal';

export function Sidebar() {
  const features = usePolygonStore((state) => state.features);
  const selectedFeatureId = usePolygonStore((state) => state.selectedFeatureId);
  const editingFeatureId = usePolygonStore((state) => state.editingFeatureId);
  const hasUnsavedChanges = usePolygonStore((state) => state.hasUnsavedChanges);
  const selectFeature = usePolygonStore((state) => state.selectFeature);
  const editFeature = usePolygonStore((state) => state.editFeature);
  const deleteFeature = usePolygonStore((state) => state.deleteFeature);
  const updateFeature = usePolygonStore((state) => state.updateFeature);
  const clearAll = usePolygonStore((state) => state.clearAll);
  const isDrawing = usePolygonStore((state) => state.isDrawing);
  const startDrawing = usePolygonStore((state) => state.startDrawing);
  const stopDrawing = usePolygonStore((state) => state.stopDrawing);
  const hiddenFeatureIds = usePolygonStore((state) => state.hiddenFeatureIds);
  const toggleFeatureVisibility = usePolygonStore((state) => state.toggleFeatureVisibility);
  const setAllFeaturesVisibility = usePolygonStore((state) => state.setAllFeaturesVisibility);
  const splittingFeatureId = usePolygonStore((state) => state.splittingFeatureId);
  const splitError = usePolygonStore((state) => state.splitError);
  const startSplitting = usePolygonStore((state) => state.startSplitting);
  const stopSplitting = usePolygonStore((state) => state.stopSplitting);
  const mergingFeatureId = usePolygonStore((state) => state.mergingFeatureId);
  const mergeTargetIds = usePolygonStore((state) => state.mergeTargetIds);
  const mergeError = usePolygonStore((state) => state.mergeError);
  const startMerging = usePolygonStore((state) => state.startMerging);
  const stopMerging = usePolygonStore((state) => state.stopMerging);
  const toggleMergeTarget = usePolygonStore((state) => state.toggleMergeTarget);
  const mergeFeatures = usePolygonStore((state) => state.mergeFeatures);
  const focusedFeatureId = usePolygonStore((state) => state.focusedFeatureId);
  const focusFeature = usePolygonStore((state) => state.focusFeature);
  const unfocusAll = usePolygonStore((state) => state.unfocusAll);

  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleNameChange = (id: string, newName: string) => {
    updateFeature(id, { name: newName });
  };

  const handleColorChange = (id: string, color: string) => {
    const feature = features.find((f) => f.id === id);
    if (!feature) return;
    updateFeature(id, {
      properties: {
        ...feature.properties,
        style: { ...feature.properties.style, fillColor: color, strokeColor: color },
      },
    });
  };

  const handleClear = () => {
    if (hasUnsavedChanges) {
      setShowClearConfirm(true);
      return;
    }
    clearAll();
  };

  return (
    <aside className="absolute top-4 left-4 bottom-4 w-[340px] z-[1000] flex flex-col glass-panel rounded-[18px] overflow-hidden animate-panel-slide-in">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <svg className="w-[18px] h-[18px] shrink-0 text-accent" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3L21 7.5V16.5L12 21L3 16.5V7.5L12 3Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.15"
            />
            <circle cx="12" cy="3" r="1.5" fill="currentColor" />
            <circle cx="21" cy="7.5" r="1.5" fill="currentColor" />
            <circle cx="21" cy="16.5" r="1.5" fill="currentColor" />
            <circle cx="12" cy="21" r="1.5" fill="currentColor" />
            <circle cx="3" cy="16.5" r="1.5" fill="currentColor" />
            <circle cx="3" cy="7.5" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <h1 className="flex-1 min-w-0 font-display text-[1.125rem] font-[700] tracking-tight text-text-primary leading-tight">
          Polygon Editor
        </h1>
        {hasUnsavedChanges && (
          <div
            className="w-2 h-2 rounded-full bg-accent shrink-0 animate-pulse-dot"
            title="Unsaved changes"
          />
        )}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-transparent border border-transparent text-text-secondary cursor-pointer transition-all duration-200 hover:bg-bg-hover hover:text-text-primary hover:border-panel-border"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <svg className="w-[15px] h-[15px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="8" cy="8" r="3" />
              <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.4 3.4L4.5 4.5M11.5 11.5L12.6 12.6M3.4 12.6L4.5 11.5M11.5 4.5L12.6 3.4" />
            </svg>
          ) : (
            <svg className="w-[15px] h-[15px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M13.5 10.07A6 6 0 015.93 2.5 6 6 0 1013.5 10.07z" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Upload ── */}
      <div className="px-4 pb-3 shrink-0">
        <FileUpload />
      </div>

      <div className="h-px bg-divider mx-5 shrink-0" />

      {/* ── Layers Header ── */}
      <div className="flex items-center justify-between px-5 pt-3.5 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-text-tertiary font-display">
            Layers
          </span>
          {features.length > 0 && (
            <span className="text-[0.625rem] font-bold text-accent bg-accent-dim px-2.5 py-0.5 rounded-full tabular-nums tracking-wide">
              {features.length}
            </span>
          )}
          {features.length > 0 && (
            <button
              onClick={() => {
                const anyVisible = hiddenFeatureIds.size < features.length;
                setAllFeaturesVisibility(!anyVisible);
              }}
              className="w-6 h-6 flex items-center justify-center rounded-md text-text-tertiary cursor-pointer transition-all duration-200 hover:text-text-secondary hover:bg-bg-hover"
              title={hiddenFeatureIds.size < features.length ? 'Hide all layers' : 'Show all layers'}
            >
              <FontAwesomeIcon
                icon={hiddenFeatureIds.size < features.length ? faEye : faEyeSlash}
                className="w-3 h-3"
              />
            </button>
          )}
        </div>
        <button
          onClick={isDrawing ? stopDrawing : startDrawing}
          disabled={!!splittingFeatureId || !!mergingFeatureId}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.6875rem] font-semibold cursor-pointer transition-all duration-200 border ${
            isDrawing
              ? 'bg-accent text-white border-accent'
              : splittingFeatureId || mergingFeatureId
                ? 'bg-accent-dim text-accent/40 border-transparent cursor-not-allowed'
                : 'bg-accent-dim text-accent border-transparent hover:bg-accent/20'
          }`}
          title={isDrawing ? 'Cancel drawing' : 'Draw new polygon'}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {isDrawing ? (
              <path d="M4 4L12 12M12 4L4 12" />
            ) : (
              <path d="M8 3V13M3 8H13" />
            )}
          </svg>
          {isDrawing ? 'Cancel' : 'Draw'}
        </button>
      </div>

      {/* ── Split Mode Banner ── */}
      {splittingFeatureId && (
        <div className="mx-3 mb-1 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 shrink-0">
          <div className="flex items-center gap-2 text-[0.8125rem] font-medium text-amber-600 dark:text-amber-400">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 512 512" fill="currentColor">
              <path d="M256 0c17.7 0 32 14.3 32 32l0 10.4c93.7 13.9 167.7 88 181.6 181.6l10.4 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-10.4 0c-1.3 8.8-3.1 17.3-5.5 25.7L493 285l19.8-9.9c15.8-7.9 35-1.5 42.9 14.3s1.5 35-14.3 42.9l-28.5 14.2L477.8 360l35 35c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-35-35-13.5 35.1-14.2 28.5c-7.9 15.8-27.1 22.2-42.9 14.3s-22.2-27.1-14.3-42.9L357.5 421l-25.7 5.5c-8.4 2.4-16.9 4.2-25.7 5.5l0 10.4c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-10.4c-8.8-1.3-17.3-3.1-25.7-5.5L190.7 421l9.9 19.8c7.9 15.8 1.5 35-14.3 42.9s-35 1.5-42.9-14.3l-14.2-28.5L116 476l-35 35c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l35-35L57.2 395.6l-28.5-14.2c-15.8-7.9-22.2-27.1-14.3-42.9s27.1-22.2 42.9-14.3l19.8 9.9-5.5-25.7C67.2 299.7 65.4 291.3 64.1 282.5L32 256c-17.7 0-32-14.3-32-32s14.3-32 32-32l32.1-26.5c1.3-8.8 3.1-17.3 5.5-25.7L57.2 116.5 28.7 102.3c-15.8-7.9-22.2-27.1-14.3-42.9s27.1-22.2 42.9-14.3L86 59.3l30-13.5 35.1 35 35c12.5-12.5 32.8-12.5 45.3 0z" />
            </svg>
            Draw a line across the polygon to split it
          </div>
          {splitError && (
            <p className="mt-1.5 text-[0.75rem] text-red-500">{splitError}</p>
          )}
          <button
            onClick={stopSplitting}
            className="mt-2 w-full px-2.5 py-1 rounded-lg text-[0.6875rem] font-semibold cursor-pointer transition-all duration-200 border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Merge Mode Banner ── */}
      {mergingFeatureId && (
        <div className="mx-3 mb-1 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 shrink-0">
          <div className="flex items-center gap-2 text-[0.8125rem] font-medium text-blue-600 dark:text-blue-400">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 512 512" fill="currentColor">
              <path d="M32 32C14.3 32 0 46.3 0 64v64c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32H32zm192 0c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32H224zM0 256c0-17.7 14.3-32 32-32h64c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V256zm224-32c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V256c0-17.7-14.3-32-32-32H224z" />
            </svg>
            Click polygons to merge with "{features.find((f) => f.id === mergingFeatureId)?.name}"
          </div>
          {mergeTargetIds.length > 0 && (
            <p className="mt-1 text-[0.75rem] text-blue-500/70">
              {mergeTargetIds.length} polygon{mergeTargetIds.length !== 1 ? 's' : ''} selected
            </p>
          )}
          {mergeError && (
            <p className="mt-1.5 text-[0.75rem] text-red-500">{mergeError}</p>
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={mergeFeatures}
              disabled={mergeTargetIds.length === 0}
              className={`flex-1 px-2.5 py-1 rounded-lg text-[0.6875rem] font-semibold cursor-pointer transition-all duration-200 border ${
                mergeTargetIds.length > 0
                  ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                  : 'bg-blue-500/10 text-blue-400/40 border-blue-500/20 cursor-not-allowed'
              }`}
            >
              Merge ({mergeTargetIds.length})
            </button>
            <button
              onClick={stopMerging}
              className="flex-1 px-2.5 py-1 rounded-lg text-[0.6875rem] font-semibold cursor-pointer transition-all duration-200 border bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Polygon List ── */}
      <div
        className="flex-1 overflow-y-auto px-3 py-1 min-h-[80px]"
        onClick={() => { if (!editingFeatureId && !splittingFeatureId && !mergingFeatureId && selectedFeatureId) selectFeature(null); }}
      >
        {features.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center gap-3">
            <svg className="w-12 h-12 text-text-tertiary opacity-20" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 6L42 15V33L24 42L6 33V15L24 6Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeLinejoin="round"
              />
              <circle cx="24" cy="6" r="2" fill="currentColor" opacity="0.4" />
              <circle cx="42" cy="15" r="2" fill="currentColor" opacity="0.4" />
              <circle cx="42" cy="33" r="2" fill="currentColor" opacity="0.4" />
              <circle cx="24" cy="42" r="2" fill="currentColor" opacity="0.4" />
              <circle cx="6" cy="33" r="2" fill="currentColor" opacity="0.4" />
              <circle cx="6" cy="15" r="2" fill="currentColor" opacity="0.4" />
            </svg>
            <p className="text-[0.8125rem] text-text-tertiary leading-relaxed">
              Upload a KML file or draw
              <br />
              polygons on the map
            </p>
          </div>
        ) : (
          features.map((feature, index) => (
            <PolygonListItem
              key={feature.id}
              feature={feature}
              isSelected={feature.id === selectedFeatureId}
              isEditing={feature.id === editingFeatureId}
              isHidden={hiddenFeatureIds.has(feature.id)}
              isMergeTarget={mergingFeatureId === feature.id || mergeTargetIds.includes(feature.id)}
              onSelect={() => {
                if (mergingFeatureId) {
                  if (feature.id !== mergingFeatureId) toggleMergeTarget(feature.id);
                  return;
                }
                if (splittingFeatureId) return;
                if (editingFeatureId && editingFeatureId !== feature.id) return;
                selectFeature(
                  !editingFeatureId && feature.id === selectedFeatureId ? null : feature.id
                );
              }}
              onEdit={() =>
                editFeature(editingFeatureId === feature.id ? null : feature.id)
              }
              onDelete={() => deleteFeature(feature.id)}
              onSplit={() => startSplitting(feature.id)}
              onMerge={() => startMerging(feature.id)}
              isFocused={focusedFeatureId === feature.id}
              onFocus={() => focusedFeatureId === feature.id ? unfocusAll() : focusFeature(feature.id)}
              onColorChange={(color) => handleColorChange(feature.id, color)}
              onNameChange={(newName) => handleNameChange(feature.id, newName)}
              onToggleVisibility={() => toggleFeatureVisibility(feature.id)}
              index={index}
            />
          ))
        )}
      </div>

      {/* ── Simplify ── */}
      <SimplifyPanel />

      <div className="h-px bg-divider mx-5 shrink-0" />

      {/* ── Export ── */}
      <ExportPanel />

      {/* ── Clear All ── */}
      {features.length > 0 && (
        <button
          className="px-5 py-3 bg-transparent border-0 border-t border-divider text-text-tertiary text-xs font-body cursor-pointer transition-all duration-200 text-center shrink-0 hover:text-danger hover:bg-danger-dim"
          onClick={handleClear}
        >
          Clear all layers
        </button>
      )}
      {showClearConfirm && (
        <ConfirmModal
          title="Clear all layers"
          message="You have unsaved changes. Are you sure you want to clear all polygons?"
          confirmLabel="Clear all"
          danger
          onConfirm={() => {
            setShowClearConfirm(false);
            clearAll();
          }}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </aside>
  );
}
