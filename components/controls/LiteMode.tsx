import { useEffect, useState } from "react";

const EVT = "lite-mode-change";

export const liteMode = () =>
  typeof document !== "undefined" &&
  (document.documentElement.classList.contains("lite-mode") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);

export function setLiteMode(on: boolean) {
  document.documentElement.classList.toggle("lite-mode", on);
  try { localStorage.setItem("lite-mode", on ? "1" : "0"); } catch { }
  window.dispatchEvent(new CustomEvent(EVT, { detail: on }));
}

export function useLiteMode() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(liteMode());
    const h = (e: Event) => setOn((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);
  return on;
}

export default function LiteModeToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(document.documentElement.classList.contains("lite-mode"));
    const onChange = (e: Event) => setOn((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVT, onChange);
    return () => window.removeEventListener(EVT, onChange);
  }, []);

  return (
    <button type="button" role="switch" aria-checked={on} aria-label="Lite mode"
      className="theme-switch lite-switch" onClick={() => setLiteMode(!on)}>
      <span className="knob" style={{ translate: on ? "32px 0" : "0 0" }} />
    </button>
  );
}