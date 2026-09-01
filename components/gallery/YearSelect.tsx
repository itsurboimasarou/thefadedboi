import { useEffect, useRef, useState } from "react";
import Icon from "../ui/Icons";
import { useLocalized, type Localized } from "@/lib/i18n";

const ui: Localized<{ filterByYear: string; all: string }> = {
  en: { filterByYear: "Filter by year", all: "All" },
  vi: { filterByYear: "Lọc theo năm", all: "Tất cả" },
};

interface YearSelectProps {
  years: number[];
  value: number | undefined;
  onChange: (y: number | undefined) => void;
  allowAll?: boolean;
  direction?: "down" | "up";
}

export default function YearSelect({
  years,
  value,
  onChange,
  allowAll = false,
  direction = "down",
}: YearSelectProps) {
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

  const pick = (y: number | undefined) => {
    onChange(y);
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
        aria-label={t.filterByYear}
      >
        {value ?? t.all}
        <Icon name="chevronDown" size={14} />
      </button>
      {open && (
        <ul className={`year-menu year-menu--${direction}`} role="listbox">
          {allowAll && (
            <li>
              <button
                type="button"
                role="option"
                aria-selected={value === undefined}
                className={`year-option${value === undefined ? " year-option--on" : ""}`}
                onClick={() => pick(undefined)}
              >
                {t.all}
              </button>
            </li>
          )}
          {years.map((y) => (
            <li key={y}>
              <button
                type="button"
                role="option"
                aria-selected={y === value}
                className={`year-option${y === value ? " year-option--on" : ""}`}
                onClick={() => pick(y)}
              >
                {y}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
