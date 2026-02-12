import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEyeSlash,
  faChevronDown,
  faEllipsisVertical,
  faPalette,
  faCrosshairs,
  faObjectUngroup,
  faTrash,
  faPen,
  faGripVertical,
} from '@fortawesome/free-solid-svg-icons';
import type { PolygonGroup } from '../../types/polygon';
import { usePolygonStore } from '../../store/polygonStore';
import { ColorPickerPopover } from './ColorPickerPopover';
import { ConfirmModal } from '../ConfirmModal';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface GroupContainerProps {
  group: PolygonGroup;
  featureCount: number;
  commonColor: string | null;
  children: React.ReactNode;
}

export function GroupContainer({ group, featureCount, commonColor, children }: GroupContainerProps) {
  const isCollapsed = usePolygonStore((s) => s.collapsedGroupIds.has(group.id));
  const isHidden = usePolygonStore((s) => s.hiddenGroupIds.has(group.id));
  const toggleGroupCollapsed = usePolygonStore((s) => s.toggleGroupCollapsed);
  const toggleGroupVisibility = usePolygonStore((s) => s.toggleGroupVisibility);
  const renameGroup = usePolygonStore((s) => s.renameGroup);
  const deleteGroup = usePolygonStore((s) => s.deleteGroup);
  const setGroupColor = usePolygonStore((s) => s.setGroupColor);
  const focusGroup = usePolygonStore((s) => s.focusGroup);
  const removeFromGroup = usePolygonStore((s) => s.removeFromGroup);
  const features = usePolygonStore((s) => s.features);

  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [editedName, setEditedName] = useState(group.name);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<{ top: number; left: number } | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: `group-${group.id}`,
    data: { type: 'group', groupId: group.id },
  });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleRenameBlur = () => {
    setIsRenaming(false);
    if (editedName.trim() && editedName !== group.name) {
      renameGroup(group.id, editedName.trim());
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameBlur();
    else if (e.key === 'Escape') {
      setIsRenaming(false);
      setEditedName(group.name);
    }
  };

  const handleUngroupAll = () => {
    setShowMenu(false);
    const ids = features.filter((f) => f.groupId === group.id).map((f) => f.id);
    removeFromGroup(ids);
    deleteGroup(group.id);
  };

  const accentColor = commonColor || '#6b7280';

  return (
    <div
      ref={setNodeRef}
      style={{ ...sortableStyle, borderLeftColor: accentColor, borderLeftWidth: 3 }}
      className={`mb-1 rounded-xl border-[1.5px] transition-all duration-200 ${
        isOver
          ? 'border-accent/50 bg-accent/5'
          : 'border-panel-border/50 bg-bg-surface/30'
      }`}
    >
      {/* Group header */}
      <div
        className="group flex items-center gap-1.5 px-1.5 py-2 cursor-pointer select-none"
        onClick={() => toggleGroupCollapsed(group.id)}
      >
        <div
          {...attributes}
          {...listeners}
          className="w-5 h-6 flex items-center justify-center cursor-grab active:cursor-grabbing text-text-tertiary opacity-0 hover:opacity-60 group-hover:opacity-30 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <FontAwesomeIcon icon={faGripVertical} className="text-[0.55rem]" />
        </div>
        <button
          className={`w-4 h-4 flex items-center justify-center bg-transparent border-none cursor-pointer rounded transition-all duration-150 text-[0.625rem] shrink-0 ${
            isHidden
              ? 'text-text-tertiary opacity-100'
              : 'text-text-tertiary opacity-0 group-hover:opacity-40 hover:!opacity-100'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            toggleGroupVisibility(group.id);
          }}
          title={isHidden ? 'Show group' : 'Hide group'}
        >
          <FontAwesomeIcon icon={isHidden ? faEyeSlash : faEye} />
        </button>

        <button
          ref={swatchRef}
          className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-bg-elevated shadow-[0_0_4px_rgba(0,0,0,0.1)] cursor-pointer hover:ring-accent/40 transition-all duration-150"
          style={{ backgroundColor: accentColor }}
          onClick={(e) => {
            e.stopPropagation();
            const rect = swatchRef.current?.getBoundingClientRect();
            setColorPickerAnchor(rect ? { top: rect.bottom + 4, left: rect.left } : undefined);
            setShowColorPicker(true);
          }}
          title="Change group color"
        />

        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleRenameBlur}
            onKeyDown={handleRenameKeyDown}
            className="flex-1 px-2 py-[2px] bg-bg-surface border border-accent/40 rounded-lg text-text-primary text-[0.75rem] font-semibold font-body outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-dim)]"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className={`flex-1 text-[0.75rem] font-semibold whitespace-nowrap overflow-hidden text-ellipsis ${isHidden ? 'text-text-tertiary' : 'text-text-primary'}`}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsRenaming(true);
              setEditedName(group.name);
            }}
          >
            {group.name}
          </span>
        )}

        <span className="text-[0.625rem] font-bold text-text-tertiary bg-bg-hover px-1.5 py-0.5 rounded-full tabular-nums shrink-0">
          {featureCount}
        </span>

        {/* 3-dot menu */}
        <div className="relative" ref={menuRef}>
          <button
            className="w-[22px] h-[22px] flex items-center justify-center bg-transparent border-none text-text-tertiary cursor-pointer rounded-lg transition-all duration-150 text-[0.6875rem] opacity-0 group-hover:opacity-100 hover:bg-bg-hover hover:text-text-primary"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            title="Group actions"
          >
            <FontAwesomeIcon icon={faEllipsisVertical} size="sm" />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-[150px] py-1 rounded-xl glass-panel shadow-lg border border-panel-border z-50"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 bg-transparent border-none text-text-primary text-[0.8125rem] font-body cursor-pointer transition-all duration-150 hover:bg-bg-hover text-left"
                onClick={() => {
                  setShowMenu(false);
                  setIsRenaming(true);
                  setEditedName(group.name);
                }}
              >
                <FontAwesomeIcon icon={faPen} className="text-text-tertiary text-[0.6875rem] w-3.5" />
                Rename
              </button>
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 bg-transparent border-none text-text-primary text-[0.8125rem] font-body cursor-pointer transition-all duration-150 hover:bg-bg-hover text-left"
                onClick={() => {
                  setShowMenu(false);
                  const rect = swatchRef.current?.getBoundingClientRect();
                  setColorPickerAnchor(rect ? { top: rect.bottom + 4, left: rect.left } : undefined);
                  setShowColorPicker(true);
                }}
              >
                <FontAwesomeIcon icon={faPalette} className="text-text-tertiary text-[0.6875rem] w-3.5" />
                Change color
              </button>
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 bg-transparent border-none text-text-primary text-[0.8125rem] font-body cursor-pointer transition-all duration-150 hover:bg-bg-hover text-left"
                onClick={() => {
                  setShowMenu(false);
                  focusGroup(group.id);
                }}
              >
                <FontAwesomeIcon icon={faCrosshairs} className="text-text-tertiary text-[0.6875rem] w-3.5" />
                Focus group
              </button>
              <div className="h-px bg-divider mx-2.5 my-1" />
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 bg-transparent border-none text-text-primary text-[0.8125rem] font-body cursor-pointer transition-all duration-150 hover:bg-bg-hover text-left"
                onClick={handleUngroupAll}
              >
                <FontAwesomeIcon icon={faObjectUngroup} className="text-text-tertiary text-[0.6875rem] w-3.5" />
                Ungroup all
              </button>
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 bg-transparent border-none text-danger text-[0.8125rem] font-body cursor-pointer transition-all duration-150 hover:bg-danger-dim text-left"
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteConfirm(true);
                }}
              >
                <FontAwesomeIcon icon={faTrash} className="text-[0.6875rem] w-3.5" />
                Delete group
              </button>
            </div>
          )}
        </div>

        {/* Collapse chevron */}
        <button
          className="w-[22px] h-[22px] flex items-center justify-center bg-transparent border-none text-text-tertiary cursor-pointer rounded-lg transition-all duration-150 text-[0.625rem] hover:bg-bg-hover hover:text-text-primary"
          onClick={(e) => {
            e.stopPropagation();
            toggleGroupCollapsed(group.id);
          }}
        >
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
          />
        </button>
      </div>

      {/* Children (polygon items) */}
      {!isCollapsed && (
        <div className="px-1 pb-1">
          {children}
        </div>
      )}

      {showColorPicker && (
        <ColorPickerPopover
          color={accentColor}
          onChange={(color) => setGroupColor(group.id, color)}
          onClose={() => setShowColorPicker(false)}
          anchorRect={colorPickerAnchor}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete group"
          message={`Delete "${group.name}" and its ${featureCount} polygon${featureCount !== 1 ? 's' : ''}? You can undo with Ctrl+Z.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            setShowDeleteConfirm(false);
            deleteGroup(group.id);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
