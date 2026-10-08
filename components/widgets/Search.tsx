import { useRef, useState } from "react";
import Icon from "../ui/Icons";
import { useCompact } from "@/lib/functions/useHuBarFit";
import { useLocalized } from "@/lib/i18n";
import { searchUi as ui } from "@/lib/ui-strings";

interface SearchProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
  collapsed?: boolean;
  className?: string;
}

export default function Search({ value, onChange, label, placeholder, collapsed, className = "" }: SearchProps) {
  const t = useLocalized(ui);
  const compact = useCompact();
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const open = !(collapsed ?? compact) || focused || value !== "";

  return (
    <div className={`search-pill${open ? " search-pill--open" : ""}${className ? ` ${className}` : ""}`}>
      <button
        type="button"
        className="search-pill-btn"
        onClick={() => input.current?.focus()}
        aria-label={label ?? t.search}
        tabIndex={open ? -1 : 0}
      >
        <Icon name="search" size={16} />
      </button>
      <input
        ref={input}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        className="search-pill-input"
        value={value}
        placeholder={placeholder ?? t.placeholder}
        aria-label={label ?? t.search}
        tabIndex={open ? 0 : -1}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape" && value) {
            e.stopPropagation();
            onChange("");
          }
        }}
      />
      {value && (
        <button
          type="button"
          className="search-pill-clear"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onChange("")}
          aria-label={t.clear}
        >
          <Icon name="close" size={12} />
        </button>
      )}
    </div>
  );
}
