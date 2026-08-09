import { useEffect, useState } from "react";

const EVT = "snow-shape-change";

export const fancySnow = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("snow-fancy");

export function setFancySnow(on: boolean) {
  document.documentElement.classList.toggle("snow-fancy", on);
  try { localStorage.setItem("snow-fancy", on ? "1" : "0"); } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: on }));
}

export default function SnowShapeToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(document.documentElement.classList.contains("snow-fancy"));
    const h = (e: Event) => setOn((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={`shape-toggle${on ? " shape-toggle--on" : ""}`}
      onClick={() => setFancySnow(!on)}
      aria-label={on ? "Use simple snow" : "Use detailed snowflakes"}
      title={on ? "Simple snow" : "Detailed snowflakes"}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <use href="#flake-glyph" />
      </svg>
    </button>
  );
}