import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, onConfirm, onClose }: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="notice-backdrop" onClick={onClose}>
      <div className="glass changelog-dialog confirm-dialog" role="alertdialog" aria-modal="true"
        aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="confirm-message">{message}</p>
        <div className="notice-actions">
          <button type="button" className="btn btn--small btn--ghost" onClick={onClose} autoFocus>{cancelLabel}</button>
          <button type="button" className="btn btn--small" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
