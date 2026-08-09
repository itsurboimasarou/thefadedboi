import { useEffect, useState } from "react";

const EVT = "snow-mode-change";

export const snowOn = () =>
  typeof document !== "undefined" &&
  !document.documentElement.classList.contains("no-snow");

export function setSnow(on: boolean) {
  document.documentElement.classList.toggle("no-snow", !on);
  try { localStorage.setItem("snow", on ? "1" : "0"); } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: on }));
}

export default function SnowToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    setOn(!document.documentElement.classList.contains("no-snow"));
    const h = (e: Event) => setOn((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);
  return (
    <button type="button" role="switch" aria-checked={on} aria-label="Snowfall"
      className="theme-switch lite-switch" onClick={() => setSnow(!on)}>
      <span className="knob" aria-hidden="true" />
    </button>
  );
}