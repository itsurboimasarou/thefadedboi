import { useEffect, useState } from "react";

const EVT = "glass-mode-change";

export const glassOn = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("glass-fx");

export function setGlass(on: boolean) {
  document.documentElement.classList.toggle("glass-fx", on);
  try { localStorage.setItem("glass-fx", on ? "1" : "0"); } catch { }
  window.dispatchEvent(new CustomEvent(EVT, { detail: on }));
}

export default function GlassToggle() {
  const [on, setOn] = useState(false);

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
      aria-checked={on}
      aria-label="Glass effect"
      className="theme-switch lite-switch"
      onClick={() => setGlass(!on)}
    >
      <span className="knob" aria-hidden="true" />
    </button>
  );
}
