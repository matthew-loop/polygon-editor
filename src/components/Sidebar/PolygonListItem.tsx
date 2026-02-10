import { useState, useRef, useEffect } from 'react';
import type { PolygonFeature } from '../../types/polygon';

interface PolygonListItemProps {
  feature: PolygonFeature;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onNameChange: (newName: string) => void;
}

export function PolygonListItem({
  feature,
  isSelected,
  onSelect,
  onDelete,
  onNameChange,
}: PolygonListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(feature.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditedName(feature.name);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editedName.trim() && editedName !== feature.name) {
      onNameChange(editedName.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedName(feature.name);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${feature.name}"?`)) {
      onDelete();
    }
  };

  return (
    <div
      className={`polygon-list-item ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className="color-indicator"
        style={{ backgroundColor: feature.properties.style.fillColor }}
      />
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="name-input"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="name">{feature.name}</span>
      )}
      <button
        className="delete-btn"
        onClick={handleDeleteClick}
        title="Delete polygon"
      >
        ×
      </button>
    </div>
  );
}
