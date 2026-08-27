import { useEffect, useState } from "react";
import Icon from "../ui/Icons";
import { accents } from "@/lib/accents.config";

const EVT = "accent-change";
const KEY = "accent-element";
export const DEFAULT_ACCENT = "cryo";

function apply(def: typeof accents[number] | undefined) {
  const root = document.documentElement.style;
  if (!def) {
    root.removeProperty("--accent-custom");
    root.removeProperty("--accent-soft-custom");
    root.removeProperty("--accent-contrast-custom");
  } else {
    root.setProperty("--accent-custom", def.accent);
    root.setProperty("--accent-soft-custom", def.soft);
    root.setProperty("--accent-contrast-custom", def.contrast);
  }
}

export function getAccent(): string {
  if (typeof window === "undefined") return DEFAULT_ACCENT;
  try {
    const v = localStorage.getItem(KEY);
    return v && accents.some((a) => a.key === v) ? v : DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

export function setAccent(key: string) {
  const isDefault = key === DEFAULT_ACCENT;
  apply(isDefault ? undefined : accents.find((a) => a.key === key));
  try {
    if (isDefault) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, key);
  } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
}

export function useAccent() {
  const [accent, setAccentState] = useState<string>(DEFAULT_ACCENT);
  useEffect(() => {
    setAccentState(getAccent());
    const h = (e: Event) => setAccentState((e as CustomEvent<string>).detail);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);
  return accent;
}

export default function AccentSwitch() {
  const active = useAccent();

  return (
    <div className="accent-grid" role="group" aria-label="Accent color">
      {accents.map((a) => (
        <button
          key={a.key}
          type="button"
          className={`accent-swatch${active === a.key ? " accent-swatch--on" : ""}`}
          style={{ background: `linear-gradient(135deg, ${a.accent}, ${a.soft})` }}
          aria-pressed={active === a.key}
          aria-label={a.label}
          title={a.label}
          onClick={() => setAccent(a.key)}
        />
      ))}
      <button
        type="button"
        className="accent-swatch accent-swatch--reset"
        disabled={active === DEFAULT_ACCENT}
        aria-label="Reset to default"
        title="Reset to default"
        onClick={() => setAccent(DEFAULT_ACCENT)}
      >
        <Icon name="undo" size={13} />
      </button>
    </div>
  );
}
