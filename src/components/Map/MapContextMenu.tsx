import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrosshairs, faExpand, faFloppyDisk, faPen, faScissors, faObjectGroup, faTrash, faPalette } from '@fortawesome/free-solid-svg-icons';
import { usePolygonStore } from '../../store/polygonStore';
import { ConfirmModal } from '../ConfirmModal';
import { ColorPickerPopover } from '../Sidebar/ColorPickerPopover';

function clampPosition(x: number, y: number, menuEl: HTMLDivElement) {
  const menuW = menuEl.offsetWidth;
  const menuH = menuEl.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = x;
  let top = y;

  if (left + menuW > vw - 8) left = vw - menuW - 8;
  if (top + menuH > vh - 8) top = vh - menuH - 8;
  if (left < 8) left = 8;
  if (top < 8) top = 8;

  return { left, top };
}

export function MapContextMenu() {
  const contextMenu = usePolygonStore((s) => s.contextMenu);
  const editingFeatureId = usePolygonStore((s) => s.editingFeatureId);
  const focusedFeatureId = usePolygonStore((s) => s.focusedFeatureId);
  const features = usePolygonStore((s) => s.features);
  const closeContextMenu = usePolygonStore((s) => s.closeContextMenu);
  const editFeature = usePolygonStore((s) => s.editFeature);
  const startSplitting = usePolygonStore((s) => s.startSplitting);
  const startMerging = usePolygonStore((s) => s.startMerging);
  const deleteFeature = usePolygonStore((s) => s.deleteFeature);
  const focusFeature = usePolygonStore((s) => s.focusFeature);
  const unfocusAll = usePolygonStore((s) => s.unfocusAll);

  const updateFeature = usePolygonStore((s) => s.updateFeature);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [colorPicker, setColorPicker] = useState<{ x: number; y: number; featureId: string } | null>(null);

  const activeFeatureId = contextMenu?.featureId ?? colorPicker?.featureId;
  const feature = activeFeatureId
    ? features.find((f) => f.id === activeFeatureId)
    : null;
  const isEditing = contextMenu?.featureId === editingFeatureId;
  const isFocused = contextMenu?.featureId === focusedFeatureId;

  // Use callback ref for edge-detection positioning (avoids setState in effect)
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuCallbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      menuRef.current = node;
      if (node && contextMenu) {
        const { left, top } = clampPosition(contextMenu.x, contextMenu.y, node);
        node.style.left = `${left}px`;
        node.style.top = `${top}px`;
      }
    },
    [contextMenu]
  );

  // Close on click outside
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    },
    [closeContextMenu]
  );

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeContextMenu();
    },
    [closeContextMenu]
  );

  useEffect(() => {
    if (!contextMenu) return;
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu, handleMouseDown, handleKeyDown]);

  if (!contextMenu && !colorPicker) return null;
  if (!feature) return null;

  const handleFocus = () => {
    if (!contextMenu) return;
    if (isFocused) {
      unfocusAll();
    } else {
      focusFeature(contextMenu.featureId);
    }
    closeContextMenu();
  };

  const handleEdit = () => {
    if (!contextMenu) return;
    editFeature(isEditing ? null : contextMenu.featureId);
    closeContextMenu();
  };

  const handleSplit = () => {
    if (!contextMenu) return;
    startSplitting(contextMenu.featureId);
    closeContextMenu();
  };

  const handleMerge = () => {
    if (!contextMenu) return;
    startMerging(contextMenu.featureId);
    closeContextMenu();
  };

  const handleColor = () => {
    setColorPicker({ x: contextMenu!.x, y: contextMenu!.y, featureId: contextMenu!.featureId });
    closeContextMenu();
  };

  const handleColorChange = (color: string) => {
    if (!feature) return;
    updateFeature(feature.id, {
      properties: {
        ...feature.properties,
        style: { ...feature.properties.style, fillColor: color, strokeColor: color },
      },
    });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const btnClass =
    'w-full flex items-center gap-2.5 px-3 py-2 bg-transparent border-none text-text-primary text-[0.8125rem] font-body cursor-pointer transition-all duration-150 hover:bg-bg-hover text-left';

  const iconClass = 'text-text-tertiary text-[0.6875rem] w-3.5';

  return createPortal(
    <>
      {contextMenu && (
        <div
          ref={menuCallbackRef}
          className="fixed z-[10000] w-[160px] py-1 rounded-xl glass-panel shadow-lg border border-panel-border animate-[modalIn_0.15s_var(--ease-spring)]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Focus / Show All */}
          <button className={btnClass} onClick={handleFocus}>
            <FontAwesomeIcon
              icon={isFocused ? faExpand : faCrosshairs}
              className={iconClass}
            />
            {isFocused ? 'Show All' : 'Focus'}
          </button>

          {/* Change color */}
          <button className={btnClass} onClick={handleColor}>
            <FontAwesomeIcon icon={faPalette} className={iconClass} />
            Change color
          </button>

          {/* Divider */}
          <div className="h-px bg-divider mx-2.5 my-1" />

          {/* Edit vertices / Save changes */}
          <button className={btnClass} onClick={handleEdit}>
            <FontAwesomeIcon icon={isEditing ? faFloppyDisk : faPen} className={iconClass} />
            {isEditing ? 'Save changes' : 'Edit vertices'}
          </button>

          {/* Split */}
          <button className={btnClass} onClick={handleSplit}>
            <FontAwesomeIcon icon={faScissors} className={iconClass} />
            Split
          </button>

          {/* Merge */}
          <button className={btnClass} onClick={handleMerge}>
            <FontAwesomeIcon icon={faObjectGroup} className={iconClass} />
            Merge
          </button>

          {/* Delete */}
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 bg-transparent border-none text-danger text-[0.8125rem] font-body cursor-pointer transition-all duration-150 hover:bg-danger-dim text-left"
            onClick={handleDelete}
          >
            <FontAwesomeIcon icon={faTrash} className="text-[0.6875rem] w-3.5" />
            Delete
          </button>
        </div>
      )}

      {showDeleteConfirm && feature && (
        <ConfirmModal
          title="Delete polygon"
          message={`Are you sure you want to delete "${feature.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            setShowDeleteConfirm(false);
            deleteFeature(feature.id);
            closeContextMenu();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {colorPicker && feature && (
        <ColorPickerPopover
          color={feature.properties.style.fillColor}
          onChange={handleColorChange}
          onClose={() => setColorPicker(null)}
          anchorRect={{ top: colorPicker.y, left: colorPicker.x }}
        />
      )}
    </>,
    document.body
  );
}
