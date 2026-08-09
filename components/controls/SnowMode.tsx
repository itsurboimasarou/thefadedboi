import { useEffect, useState } from "react";
import { liteMode } from "./LiteMode";

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
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setOn(!document.documentElement.classList.contains("no-snow"));
    setLocked(liteMode());

    const onSnow = (e: Event) => setOn((e as CustomEvent<boolean>).detail);
    const onLite = (e: Event) => setLocked((e as CustomEvent<boolean>).detail);

    window.addEventListener(EVT, onSnow);
    window.addEventListener("lite-mode-change", onLite);
    return () => {
      window.removeEventListener(EVT, onSnow);
      window.removeEventListener("lite-mode-change", onLite);
    };
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={locked ? false : on}
      aria-label="Snowfall"
      className="theme-switch lite-switch"
      disabled={locked}
      title={locked ? "Disabled by Lite mode" : undefined}
      onClick={() => setSnow(!on)}
    >
      <span className="knob" aria-hidden="true" />
    </button>
  );
}