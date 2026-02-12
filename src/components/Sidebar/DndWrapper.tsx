import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { usePolygonStore } from '../../store/polygonStore';
import type { PolygonFeature } from '../../types/polygon';

interface DndWrapperProps {
  children: React.ReactNode;
}

export function DndWrapper({ children }: DndWrapperProps) {
  const reorderFeature = usePolygonStore((s) => s.reorderFeature);
  const addToGroup = usePolygonStore((s) => s.addToGroup);
  const removeFromGroup = usePolygonStore((s) => s.removeFromGroup);

  const [activeFeature, setActiveFeature] = useState<PolygonFeature | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(pointerSensor, keyboardSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === 'feature') {
      setActiveFeature(data.feature as PolygonFeature);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveFeature(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

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
  }, [addToGroup, removeFromGroup, reorderFeature]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeFeature && (
          <div className="px-3 py-2 rounded-xl bg-bg-elevated shadow-lg border border-accent/30 text-[0.8125rem] font-medium text-text-primary opacity-80 max-w-[280px] truncate">
            {activeFeature.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
