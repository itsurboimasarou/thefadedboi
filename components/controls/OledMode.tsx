import { useEffect, useState } from "react";

const EVT = "oled-mode-change";

export const oledMode = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("oled");

export function setOledMode(on: boolean) {
  document.documentElement.classList.toggle("oled", on);
  try { localStorage.setItem("oled-mode", on ? "1" : "0"); } catch { }
  window.dispatchEvent(new CustomEvent(EVT, { detail: on }));
}

export default function OledModeToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(document.documentElement.classList.contains("oled"));
    const onChange = (e: Event) => setOn((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVT, onChange);
    return () => window.removeEventListener(EVT, onChange);
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="OLED mode"
      className="theme-switch lite-switch"
      onClick={() => setOledMode(!on)}
    >
      <span className="knob" aria-hidden="true" />
    </button>
  );
}
