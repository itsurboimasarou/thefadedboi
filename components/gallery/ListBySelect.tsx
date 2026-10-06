import { useEffect, useRef, useState } from "react";
import Icon from "../ui/Icons";
import { useLocalized } from "@/lib/i18n";
import { listBySelectUi as ui } from "@/lib/ui-strings";

export type ListBy = "album" | "device";

const OPTIONS: ListBy[] = ["album", "device"];

interface ListBySelectProps {
  value: ListBy;
  onChange: (v: ListBy) => void;
  direction?: "down" | "up";
}

export default function ListBySelect({ value, onChange, direction = "down" }: ListBySelectProps) {
  const t = useLocalized(ui);
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

  const pick = (v: ListBy) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div className="year-select-wrap" ref={ref}>
      <button
        type="button"
        className="year-select-btn"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t.listBy}: ${t[value]}`}
      >
        {t[value]}
        <Icon name="chevronDown" size={14} />
      </button>
      {open && (
        <ul className={`year-menu year-menu--${direction}`} role="listbox" aria-label={t.listBy}>
          <li className="year-menu-head" role="presentation">{t.listBy}</li>
          {OPTIONS.map((o) => (
            <li key={o}>
              <button
                type="button"
                role="option"
                aria-selected={o === value}
                className={`year-option${o === value ? " year-option--on" : ""}`}
                onClick={() => pick(o)}
              >
                {t[o]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
