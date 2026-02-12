import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerPopoverProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
  anchorRect?: { top: number; left: number };
}

export function ColorPickerPopover({ color, onChange, onClose, anchorRect }: ColorPickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Callback ref to clamp position on mount
  const callbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      popoverRef.current = node;
      if (!node || !anchorRect) return;

      const rect = node.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let left = anchorRect.left;
      let top = anchorRect.top;

      if (left + rect.width > vw - 8) left = vw - rect.width - 8;
      if (top + rect.height > vh - 8) top = vh - rect.height - 8;
      if (left < 8) left = 8;
      if (top < 8) top = 8;

      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
    },
    [anchorRect],
  );

  return createPortal(
    <div
      ref={callbackRef}
      className="fixed rounded-xl glass-panel shadow-lg border border-panel-border p-2.5 animate-[modalIn_0.15s_var(--ease-spring)]"
      style={{ left: anchorRect?.left, top: anchorRect?.top, zIndex: 10001 }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <HexColorPicker color={color} onChange={onChange} />
    </div>,
    document.body,
  );
}
