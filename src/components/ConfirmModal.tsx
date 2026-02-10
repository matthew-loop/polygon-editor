import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center animate-[modalOverlayIn_0.2s_ease-out]"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Dialog */}
      <div
        className="relative glass-panel rounded-2xl w-[340px] p-6 animate-[modalIn_0.25s_var(--ease-spring)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-[1rem] font-[700] text-text-primary mb-2 leading-tight">
          {title}
        </h2>
        <p className="text-[0.8125rem] text-text-secondary leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex gap-2.5 justify-end">
          <button
            className="glossy-btn-secondary px-4 py-2 rounded-xl text-[0.8125rem] font-medium font-body bg-bg-surface border border-panel-border text-text-secondary cursor-pointer hover:text-text-primary"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            className={`glossy-btn px-4 py-2 rounded-xl text-[0.8125rem] font-semibold font-body border-none cursor-pointer ${
              danger
                ? 'bg-danger text-white'
                : 'bg-accent text-on-accent'
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
