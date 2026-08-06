import { useEffect, useRef, useState } from "react";

interface YearSelectProps {
  years: number[];
  value: number | undefined;
  onChange: (y: number | undefined) => void;
  allowAll?: boolean;
}

export default function YearSelect({
  years,
  value,
  onChange,
  allowAll = false,
}: YearSelectProps) {
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
        aria-label="Filter by year"
      >
        {value ?? "All"}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          width="14"
          height="14"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="year-menu" role="listbox">
          {allowAll && (
            <li>
              <button
                type="button"
                role="option"
                aria-selected={value === undefined}
                className={`year-option${value === undefined ? " year-option--on" : ""}`}
                onClick={() => pick(undefined)}
              >
                All
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
