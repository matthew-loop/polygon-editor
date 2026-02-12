import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faFloppyDisk, faTrash, faEye, faEyeSlash, faEllipsisVertical, faScissors, faObjectGroup } from '@fortawesome/free-solid-svg-icons';
import type { PolygonFeature } from '../../types/polygon';
import { ConfirmModal } from '../ConfirmModal';

interface PolygonListItemProps {
  feature: PolygonFeature;
  isSelected: boolean;
  isEditing: boolean;
  isHidden: boolean;
  isMergeTarget?: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSplit: () => void;
  onMerge: () => void;
  onNameChange: (newName: string) => void;
  onToggleVisibility: () => void;
  index: number;
}

export function PolygonListItem({
  feature,
  isSelected,
  isEditing,
  isHidden,
  isMergeTarget,
  onSelect,
  onEdit,
  onDelete,
  onSplit,
  onMerge,
  onNameChange,
  onToggleVisibility,
  index,
}: PolygonListItemProps) {
  const [isRenamingName, setIsRenamingName] = useState(false);
  const [editedName, setEditedName] = useState(feature.name);
  const [showMenu, setShowMenu] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isRenamingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenamingName]);

  // Scroll into view when selected (e.g. from map click)
  useEffect(() => {
    if (isSelected && itemRef.current) {
      itemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSelected]);

  // Close menu when clicking outside
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

  const handleDoubleClick = () => {
    setIsRenamingName(true);
    setEditedName(feature.name);
  };

  const handleBlur = () => {
    setIsRenamingName(false);
    if (editedName.trim() && editedName !== feature.name) {
      onNameChange(editedName.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsRenamingName(false);
      setEditedName(feature.name);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleEditClick = () => {
    setShowMenu(false);
    onEdit();
  };

  const handleSplitClick = () => {
    setShowMenu(false);
    onSplit();
  };

  const handleMergeClick = () => {
    setShowMenu(false);
    onMerge();
  };

  const handleVisibilityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleVisibility();
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setShowMenu((prev) => !prev);
  };

  return (
    <div
      ref={itemRef}
      className={`group flex items-center gap-2.5 px-3 py-2 mb-0.5 rounded-xl cursor-pointer transition-all duration-200 border-[1.5px] border-transparent animate-item-fade-in ${
        showMenu ? 'relative z-[60]' : ''
      } ${
        isMergeTarget
          ? 'border-blue-500/40 bg-blue-500/10'
          : isEditing
            ? 'border-editing/40 bg-editing-dim'
            : isSelected
              ? 'border-accent/20 bg-accent-dim shadow-accent-glow'
              : 'hover:bg-bg-hover'
      }`}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={handleDoubleClick}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Visibility toggle — visible on hover or when hidden */}
      <button
        className={`w-4 h-4 flex items-center justify-center bg-transparent border-none cursor-pointer rounded transition-all duration-150 text-[0.625rem] shrink-0 ${
          isHidden
            ? 'text-text-tertiary opacity-100'
            : 'text-text-tertiary opacity-0 group-hover:opacity-40 hover:!opacity-100'
        }`}
        onClick={handleVisibilityClick}
        title={isHidden ? 'Show polygon' : 'Hide polygon'}
      >
        <FontAwesomeIcon icon={isHidden ? faEyeSlash : faEye} />
      </button>

      <div
        className={`w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-bg-elevated shadow-[0_0_4px_rgba(0,0,0,0.1)] ${isHidden ? 'opacity-40' : ''}`}
        style={{ backgroundColor: feature.properties.style.fillColor }}
      />
      {isRenamingName ? (
        <input
          ref={inputRef}
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-[3px] bg-bg-surface border border-accent/40 rounded-lg text-text-primary text-[0.8125rem] font-body outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-dim)]"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className={`flex-1 text-[0.8125rem] font-medium whitespace-nowrap overflow-hidden text-ellipsis ${isHidden ? 'text-text-tertiary' : 'text-text-primary'}`}>
          {feature.name}
        </span>
      )}

      {/* Actions area */}
      <div
        className={`flex items-center gap-0.5 shrink-0 transition-opacity duration-150 ${
          isSelected || isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {/* Edit save button — shown inline when editing */}
        {isEditing && (
          <button
            className="w-[26px] h-[26px] flex items-center justify-center bg-transparent border-none cursor-pointer rounded-lg transition-all duration-150 text-[0.75rem] bg-editing-dim text-editing"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            title="Save changes"
          >
            <FontAwesomeIcon icon={faFloppyDisk} size="sm" />
          </button>
        )}

        {/* 3-dot menu */}
        {!isEditing && (
          <div className="relative" ref={menuRef}>
            <button
              className="w-[26px] h-[26px] flex items-center justify-center bg-transparent border-none text-text-tertiary cursor-pointer rounded-lg transition-all duration-150 text-[0.75rem] hover:bg-bg-hover hover:text-text-primary"
              onClick={handleMenuClick}
              title="More actions"
            >
              <FontAwesomeIcon icon={faEllipsisVertical} size="sm" />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 w-[140px] py-1 rounded-xl glass-panel shadow-lg border border-panel-border z-50"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 bg-transparent border-none text-text-primary text-[0.8125rem] font-body cursor-pointer transition-all duration-150 hover:bg-bg-hover text-left"
                  onClick={(e) => { e.stopPropagation(); handleEditClick(); }}
                >
                  <FontAwesomeIcon icon={faPen} className="text-text-tertiary text-[0.6875rem] w-3.5" />
                  Edit vertices
                </button>
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 bg-transparent border-none text-text-primary text-[0.8125rem] font-body cursor-pointer transition-all duration-150 hover:bg-bg-hover text-left"
                  onClick={(e) => { e.stopPropagation(); handleSplitClick(); }}
                >
                  <FontAwesomeIcon icon={faScissors} className="text-text-tertiary text-[0.6875rem] w-3.5" />
                  Split
                </button>
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 bg-transparent border-none text-text-primary text-[0.8125rem] font-body cursor-pointer transition-all duration-150 hover:bg-bg-hover text-left"
                  onClick={(e) => { e.stopPropagation(); handleMergeClick(); }}
                >
                  <FontAwesomeIcon icon={faObjectGroup} className="text-text-tertiary text-[0.6875rem] w-3.5" />
                  Merge
                </button>
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 bg-transparent border-none text-danger text-[0.8125rem] font-body cursor-pointer transition-all duration-150 hover:bg-danger-dim text-left"
                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(); }}
                >
                  <FontAwesomeIcon icon={faTrash} className="text-[0.6875rem] w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete polygon"
          message={`Are you sure you want to delete "${feature.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onDelete();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
