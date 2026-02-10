import { usePolygonStore } from '../../store/polygonStore';
import { PolygonListItem } from './PolygonListItem';
import { SimplifyPanel } from './SimplifyPanel';
import { FileUpload } from '../FileUpload';
import { ExportPanel } from '../ExportPanel';

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
      if (
        !confirm(
          'You have unsaved changes. Are you sure you want to clear all polygons?'
        )
      ) {
        return;
      }
    }
    clearAll();
  };

  return (
    <aside className="panel-texture absolute top-4 left-4 bottom-4 w-[340px] z-[1000] flex flex-col bg-panel-bg backdrop-blur-[24px] border border-panel-border rounded-2xl shadow-panel overflow-hidden animate-panel-slide-in">
      <div className="relative z-1 flex items-center gap-3 px-5 pt-5 pb-4 shrink-0">
        <svg className="w-7 h-7 shrink-0 text-accent" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 2L26 8V20L14 26L2 20V8L14 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="rgba(34, 211, 238, 0.08)"
          />
          <path
            d="M14 2L26 8L14 14L2 8L14 2Z"
            fill="rgba(34, 211, 238, 0.12)"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="14" cy="14" r="2.5" fill="currentColor" opacity="0.8" />
        </svg>
        <h1 className="font-display text-xl font-bold tracking-tight text-text-primary leading-tight">Polygon Editor</h1>
        {hasUnsavedChanges && (
          <div
            className="w-2 h-2 rounded-full bg-accent shrink-0 ml-auto animate-pulse-dot"
            title="Unsaved changes"
          />
        )}
      </div>

      <div className="relative z-1">
        <FileUpload />
      </div>

      <div className="relative z-1 h-px bg-divider mx-5 my-1 shrink-0" />

      <div className="relative z-1 flex items-center justify-between px-5 pt-3.5 pb-2 shrink-0">
        <span className="text-[0.6875rem] font-semibold tracking-widest uppercase text-text-secondary">Layers</span>
        {features.length > 0 && (
          <span className="text-[0.625rem] font-semibold text-accent bg-accent-dim px-2 py-0.5 rounded-[10px]">
            {features.length}
          </span>
        )}
      </div>

      <div className="relative z-1 flex-1 overflow-y-auto px-3 py-1 min-h-[80px]">
        {features.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center gap-3">
            <svg className="w-10 h-10 text-text-tertiary opacity-50" viewBox="0 0 40 40" fill="none">
              <path
                d="M20 4L36 12V28L20 36L4 28V12L20 4Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <path
                d="M20 4L36 12M20 4L4 12M20 4V20M36 12V28L20 36M36 12L20 20M4 12V28L20 36M4 12L20 20M20 36V20"
                stroke="currentColor"
                strokeWidth="0.75"
                opacity="0.3"
              />
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
              onSelect={() => selectFeature(feature.id)}
              onEdit={() =>
                editFeature(editingFeatureId === feature.id ? null : feature.id)
              }
              onDelete={() => deleteFeature(feature.id)}
              onNameChange={(newName) => handleNameChange(feature.id, newName)}
              index={index}
            />
          ))
        )}
      </div>

      <div className="relative z-1">
        <SimplifyPanel />
      </div>

      <div className="relative z-1 h-px bg-divider mx-5 my-1 shrink-0" />

      <div className="relative z-1">
        <ExportPanel />
      </div>

      {features.length > 0 && (
        <button
          className="relative z-1 px-5 py-3 bg-transparent border-0 border-t border-divider text-text-tertiary text-xs font-body cursor-pointer transition-all duration-200 text-center shrink-0 hover:text-danger hover:bg-danger-dim"
          onClick={handleClear}
        >
          Clear all layers
        </button>
      )}
    </aside>
  );
}
