import { useEffect, useRef, useState } from "react";
import Icon from "../ui/Icons";
import { useLocalized } from "@/lib/i18n";
import { sortBySelectUi as ui } from "@/lib/ui-strings";

export type SortBy = "time" | "alphabet";

export const SORT_BY: SortBy[] = ["time", "alphabet"];

interface SortBySelectProps {
  value: SortBy;
  onChange: (v: SortBy) => void;
  direction?: "down" | "up";
  disabled?: boolean;
}

export default function SortBySelect({ value, onChange, direction = "down", disabled }: SortBySelectProps) {
  const t = useLocalized(ui);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

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

  const pick = (v: SortBy) => {
    onChange(v);
    setOpen(false);
  };

  const shown = disabled ? "time" : value;

  return (
    <div className="year-select-wrap" ref={ref}>
      <button
        type="button"
        className="year-select-btn"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t.sortBy}: ${t[shown]}`}
      >
        <Icon name="sort" size={14} />
        {t[shown]}
        <Icon name="chevronDown" size={14} />
      </button>
      {open && (
        <ul className={`year-menu year-menu--${direction}`} role="listbox" aria-label={t.sortBy}>
          <li className="year-menu-head" role="presentation">{t.sortBy}</li>
          {SORT_BY.map((o) => (
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
