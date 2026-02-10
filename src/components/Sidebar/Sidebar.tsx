import { useState } from 'react';
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

  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleNameChange = (id: string, newName: string) => {
    updateFeature(id, {
      name: newName,
      properties: {
        ...features.find((f) => f.id === id)!.properties,
        name: newName,
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
        </div>
        <button
          onClick={isDrawing ? stopDrawing : startDrawing}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.6875rem] font-semibold cursor-pointer transition-all duration-200 border ${
            isDrawing
              ? 'bg-accent text-white border-accent'
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

      {/* ── Polygon List ── */}
      <div
        className="flex-1 overflow-y-auto px-3 py-1 min-h-[80px]"
        onClick={() => { if (!editingFeatureId && selectedFeatureId) selectFeature(null); }}
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
              onSelect={() => selectFeature(
                !editingFeatureId && feature.id === selectedFeatureId ? null : feature.id
              )}
              onEdit={() =>
                editFeature(editingFeatureId === feature.id ? null : feature.id)
              }
              onDelete={() => deleteFeature(feature.id)}
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
