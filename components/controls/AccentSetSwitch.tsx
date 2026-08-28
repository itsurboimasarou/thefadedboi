import { useEffect, useRef, useState } from "react";
import { accentSets } from "@/lib/accents.config";
import { useAccentSet, setAccentSetKey } from "./AccentSwitch";
import Icon from "../ui/Icons";

export default function AccentSetSwitch() {
  const set = useAccentSet();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (key: string) => {
    setAccentSetKey(key);
    setOpen(false);
  };

  return (
    <div className="set-select-wrap" ref={ref}>
      <button
        type="button"
        className="set-select-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Theme set"
      >
        {set.label}
        <Icon name="chevronDown" size={14} />
      </button>
      {open && (
        <ul className="set-menu" role="listbox">
          {accentSets.map((s) => (
            <li key={s.key}>
              <button
                type="button"
                role="option"
                aria-selected={s.key === set.key}
                className={`set-option${s.key === set.key ? " set-option--on" : ""}`}
                onClick={() => pick(s.key)}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
