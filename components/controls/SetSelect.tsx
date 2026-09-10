import { useEffect, useRef, useState } from "react";
import Icon from "../ui/Icons";

export interface SelectOption<T extends string> {
  key: T;
  label: string;
  icon?: string;
  disabled?: boolean;
}

interface SetSelectProps<T extends string> {
  value: T;
  options: ReadonlyArray<SelectOption<T>>;
  onPick: (key: T) => void;
  label: string;
}

export default function SetSelect<T extends string>({
  value,
  options,
  onPick,
  label,
}: SetSelectProps<T>) {
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

  const current = options.find((o) => o.key === value);

  const pick = (o: SelectOption<T>) => {
    if (o.disabled) return;
    onPick(o.key);
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
        aria-label={`${label}: ${current?.label ?? ""}`}
      >
        <span className="set-select-current">
          {current?.icon && <Icon name={current.icon} size={16} />}
          {current?.label}
        </span>
        <Icon name="chevronDown" size={14} />
      </button>
      {open && (
        <ul className="set-menu" role="listbox" aria-label={label}>
          {options.map((o) => (
            <li key={o.key}>
              <button
                type="button"
                role="option"
                aria-selected={o.key === value}
                aria-disabled={o.disabled || undefined}
                disabled={o.disabled}
                className={`set-option${o.key === value ? " set-option--on" : ""}`}
                onClick={() => pick(o)}
              >
                {o.icon && <Icon name={o.icon} size={16} />}
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
