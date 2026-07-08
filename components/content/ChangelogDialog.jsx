import { useEffect } from "react";
import { createPortal } from "react-dom";

function renderMd(md) {
  return md.replace(/\r/g, "").split("\n").map((line, i) => {
    if (line.startsWith("### ")) {
      const m = line.match(/\[([^\]]+)\]/);
      const v = m ? m[1] : line.slice(4).trim()
      return <h4 key={i} className="cl-version">✦ v{v}</h4>;
    }
    if (line.startsWith("## ")) return <h3 key={i} className="cl-release">{line.slice(3)}</h3>;
    if (line.startsWith("# ")) return null;
    if (line.startsWith("- ")) return <li key={i}>{line.slice(2)}</li>;
    if (line.trim() === "") return null;
    return <p key={i}>{line}</p>;
  });
}

export default function ChangelogDialog({ open, onClose, changelog }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="notice-backdrop" onClick={onClose}>
      <div className="glass changelog-dialog" role="dialog" aria-modal="true"
        aria-label="Changelog" onClick={(e) => e.stopPropagation()}>
        <h2>Changelog</h2>
        <div className="changelog-body">
          {changelog ? renderMd(changelog) : <p>No changelog yet.</p>}
        </div>
        <button type="button" className="btn btn--small" onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body
  );
}