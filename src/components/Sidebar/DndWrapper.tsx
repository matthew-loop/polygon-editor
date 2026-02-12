import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { usePolygonStore } from '../../store/polygonStore';
import type { PolygonFeature } from '../../types/polygon';

interface DndWrapperProps {
  children: React.ReactNode;
}

type ActiveItem =
  | { type: 'feature'; feature: PolygonFeature }
  | { type: 'group'; groupId: string; groupName: string };

export function DndWrapper({ children }: DndWrapperProps) {
  const reorderFeature = usePolygonStore((s) => s.reorderFeature);
  const reorderGroup = usePolygonStore((s) => s.reorderGroup);
  const addToGroup = usePolygonStore((s) => s.addToGroup);
  const removeFromGroup = usePolygonStore((s) => s.removeFromGroup);
  const groups = usePolygonStore((s) => s.groups);

  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(pointerSensor, keyboardSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === 'feature') {
      setActiveItem({ type: 'feature', feature: data.feature as PolygonFeature });
    } else if (data?.type === 'group') {
      setActiveItem({ type: 'group', groupId: data.groupId as string, groupName: '' });
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // ── Group dragged onto another group → reorder groups ──
    if (activeData?.type === 'group' && overData?.type === 'group') {
      const activeGroupId = activeData.groupId as string;
      const overGroupId = overData.groupId as string;
      // Find the over group's position to determine insert-before
      const overIdx = groups.findIndex((g) => g.id === overGroupId);
      const activeIdx = groups.findIndex((g) => g.id === activeGroupId);
      if (overIdx === -1 || activeIdx === -1) return;

      // If dragging down, insert before the next group; if dragging up, insert before the over group
      if (activeIdx < overIdx) {
        // Dragging down: place after overGroup
        const nextGroup = groups[overIdx + 1];
        reorderGroup(activeGroupId, nextGroup?.id ?? null);
      } else {
        // Dragging up: place before overGroup
        reorderGroup(activeGroupId, overGroupId);
      }
      return;
    }

    // ── Feature drag handling ──
    if (activeData?.type !== 'feature') return;
    const featureId = active.id as string;

    if (overData?.type === 'group') {
      // Dropped onto a group header
      addToGroup([featureId], overData.groupId as string);
    } else if (overData?.type === 'ungrouped-zone') {
      // Dropped onto ungrouped zone
      removeFromGroup([featureId]);
    } else if (over.id) {
      // Dropped onto another feature — reorder to that position
      const overFeature = overData?.feature as PolygonFeature | undefined;
      if (overFeature) {
        reorderFeature(featureId, overFeature.groupId ?? null, overFeature.id);
      }
    }
  }, [addToGroup, removeFromGroup, reorderFeature, reorderGroup, groups]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeItem?.type === 'feature' && (
          <div className="px-3 py-2 rounded-xl bg-bg-elevated shadow-lg border border-accent/30 text-[0.8125rem] font-medium text-text-primary opacity-80 max-w-[280px] truncate">
            {activeItem.feature.name}
          </div>
        )}
        {activeItem?.type === 'group' && (
          <div className="px-3 py-2 rounded-xl bg-bg-elevated shadow-lg border border-accent/30 text-[0.75rem] font-semibold text-text-primary opacity-80 max-w-[280px] truncate">
            {groups.find((g) => g.id === activeItem.groupId)?.name ?? 'Group'}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
