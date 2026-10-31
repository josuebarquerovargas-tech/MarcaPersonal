"use client";

import { useEffect, useRef, type ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

export function Dialog({ open, onClose, title, children, className = "" }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-label={title}
      className={`m-auto w-[min(92vw,480px)] rounded-[16px] border border-line bg-surface p-0 text-ink shadow-soft backdrop:bg-black/50 backdrop:backdrop-blur-sm ${className}`}
    >
      <div className="p-6">
        <h2 className="font-display text-2xl">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  );
}
