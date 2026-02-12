import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { PolygonListItem } from './PolygonListItem';
import type { PolygonFeature } from '../../types/polygon';

interface SortablePolygonItemProps {
  feature: PolygonFeature;
  isSelected: boolean;
  isEditing: boolean;
  isHidden: boolean;
  isMergeTarget?: boolean;
  isFocused?: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSplit: () => void;
  onMerge: () => void;
  onFocus: () => void;
  onNameChange: (newName: string) => void;
  onColorChange: (color: string) => void;
  onToggleVisibility: () => void;
  onMoveToGroup: (groupId: string) => void;
  onRemoveFromGroup: () => void;
  onMoveToNewGroup: () => void;
  hasGroup: boolean;
  index: number;
}

export function SortablePolygonItem({ feature, hasGroup, onMoveToGroup, onRemoveFromGroup, onMoveToNewGroup, ...props }: SortablePolygonItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: feature.id,
    data: { type: 'feature', feature },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      <div
        {...attributes}
        {...listeners}
        className="w-5 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-text-tertiary opacity-0 hover:opacity-60 group-hover/sortable:opacity-30 transition-opacity shrink-0"
      >
        <FontAwesomeIcon icon={faGripVertical} className="text-[0.6rem]" />
      </div>
      <div className="flex-1 min-w-0 group/sortable">
        <PolygonListItem
          feature={feature}
          {...props}
          groupActions={{
            hasGroup,
            onMoveToGroup,
            onRemoveFromGroup,
            onMoveToNewGroup,
          }}
        />
      </div>
    </div>
  );
}
