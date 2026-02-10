import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faFloppyDisk, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { PolygonFeature } from '../../types/polygon';

interface PolygonListItemProps {
  feature: PolygonFeature;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNameChange: (newName: string) => void;
  index: number;
}

export function PolygonListItem({
  feature,
  isSelected,
  isEditing,
  onSelect,
  onEdit,
  onDelete,
  onNameChange,
  index,
}: PolygonListItemProps) {
  const [isRenamingName, setIsRenamingName] = useState(false);
  const [editedName, setEditedName] = useState(feature.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenamingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenamingName]);

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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${feature.name}"?`)) {
      onDelete();
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  return (
    <div
      className={`group flex items-center gap-2.5 px-3 py-2.5 mb-1 bg-black/[0.02] rounded-sm cursor-pointer transition-all duration-200 ease-in-out border-[1.5px] border-transparent animate-item-fade-in hover:bg-black/[0.04] ${
        isEditing
          ? 'border-editing bg-editing-dim'
          : isSelected
            ? 'border-accent-muted bg-accent-dim shadow-accent-glow'
            : ''
      }`}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div
        className={`w-[3px] h-7 rounded-[2px] shrink-0 transition-opacity duration-200 ${
          isSelected || isEditing ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
        }`}
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
          className="flex-1 px-2 py-[3px] bg-bg-surface border border-accent-muted rounded text-text-primary text-[0.8125rem] font-body outline-none focus:border-accent focus:shadow-[0_0_0_2px_var(--color-accent-dim)]"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 text-[0.8125rem] font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
          {feature.name}
        </span>
      )}
      <div
        className={`flex items-center gap-0.5 shrink-0 transition-opacity duration-150 ${
          isSelected || isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button
          className={`w-[26px] h-[26px] flex items-center justify-center bg-transparent border-none cursor-pointer rounded transition-all duration-150 text-[0.8125rem] ${
            isEditing
              ? 'bg-editing-dim text-editing'
              : 'text-text-tertiary hover:bg-editing-dim hover:text-editing'
          }`}
          onClick={handleEditClick}
          title={isEditing ? 'Save changes' : 'Edit vertices'}
        >
          <FontAwesomeIcon icon={isEditing ? faFloppyDisk : faPen} size="sm" />
        </button>
        {!isEditing && (
          <button
            className="w-[26px] h-[26px] flex items-center justify-center bg-transparent border-none text-text-tertiary cursor-pointer rounded transition-all duration-150 text-[0.8125rem] hover:bg-danger-dim hover:text-danger"
            onClick={handleDeleteClick}
            title="Delete polygon"
          >
            <FontAwesomeIcon icon={faTrash} size="sm" />
          </button>
        )}
      </div>
    </div>
  );
}
