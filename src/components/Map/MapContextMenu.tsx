import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrosshairs, faExpand, faPen, faScissors, faObjectGroup, faTrash } from '@fortawesome/free-solid-svg-icons';
import { usePolygonStore } from '../../store/polygonStore';
import { ConfirmModal } from '../ConfirmModal';

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
  const focusedFeatureId = usePolygonStore((s) => s.focusedFeatureId);
  const features = usePolygonStore((s) => s.features);
  const closeContextMenu = usePolygonStore((s) => s.closeContextMenu);
  const editFeature = usePolygonStore((s) => s.editFeature);
  const startSplitting = usePolygonStore((s) => s.startSplitting);
  const startMerging = usePolygonStore((s) => s.startMerging);
  const deleteFeature = usePolygonStore((s) => s.deleteFeature);
  const focusFeature = usePolygonStore((s) => s.focusFeature);
  const unfocusAll = usePolygonStore((s) => s.unfocusAll);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const feature = contextMenu
    ? features.find((f) => f.id === contextMenu.featureId)
    : null;
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

  if (!contextMenu || !feature) return null;

  const handleFocus = () => {
    if (isFocused) {
      unfocusAll();
    } else {
      focusFeature(contextMenu.featureId);
    }
    closeContextMenu();
  };

  const handleEdit = () => {
    editFeature(contextMenu.featureId);
    closeContextMenu();
  };

  const handleSplit = () => {
    startSplitting(contextMenu.featureId);
    closeContextMenu();
  };

  const handleMerge = () => {
    startMerging(contextMenu.featureId);
    closeContextMenu();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const btnClass =
    'w-full flex items-center gap-2.5 px-3 py-2 bg-transparent border-none text-text-primary text-[0.8125rem] font-body cursor-pointer transition-all duration-150 hover:bg-bg-hover text-left';

  const iconClass = 'text-text-tertiary text-[0.6875rem] w-3.5';

  return createPortal(
    <>
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

        {/* Divider */}
        <div className="h-px bg-divider mx-2.5 my-1" />

        {/* Edit vertices */}
        <button className={btnClass} onClick={handleEdit}>
          <FontAwesomeIcon icon={faPen} className={iconClass} />
          Edit vertices
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

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete polygon"
          message={`Are you sure you want to delete "${feature.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            setShowDeleteConfirm(false);
            deleteFeature(contextMenu.featureId);
            closeContextMenu();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>,
    document.body
  );
}
