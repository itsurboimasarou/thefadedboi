import { useEffect, useState } from "react";
import { useLiteMode } from "./LiteMode";

const EVT = "glass-mode-change";

export const glassOn = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("glass-fx");

export function setGlass(on: boolean) {
  document.documentElement.classList.toggle("glass-fx", on);
  try { localStorage.setItem("glass-fx", on ? "1" : "0"); } catch {}

  const active = on && !document.documentElement.classList.contains("lite-mode");
  const blur = active ? "blur(16px) saturate(1.3)" : "";

  for (const sel of [".topbar", ".nav-rail"]) {
    const el = document.querySelector<HTMLElement>(sel);
    if (!el) continue;
    el.style.backdropFilter = blur;
    el.style.setProperty("-webkit-backdrop-filter", blur);
    el.style.background = active
      ? "color-mix(in srgb, var(--bg) 58%, transparent)"
      : "";
  }
  window.dispatchEvent(new CustomEvent(EVT, { detail: on }));
}

export default function GlassToggle() {
  const [on, setOn] = useState(false);
  const locked = useLiteMode();

  useEffect(() => {
    setOn(document.documentElement.classList.contains("glass-fx"));
    const h = (e: Event) => setOn((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={locked ? false : on}
      aria-label="Glass effect"
      className="theme-switch lite-switch"
      disabled={locked}
      title={locked ? "Disabled by Lite mode" : undefined}
      onClick={() => setGlass(!on)}
    >
      <span className="knob" aria-hidden="true" />
    </button>
  );
}
