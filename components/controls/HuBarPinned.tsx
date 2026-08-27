import { useEffect, useState } from "react";

const EVT = "hubar-pinned-change";

export function pinnedOn(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem("hubar-pinned") !== "0";
  } catch {
    return true;
  }
}

export function setPinned(on: boolean) {
  try { localStorage.setItem("hubar-pinned", on ? "1" : "0"); } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: on }));
}

export function usePinned() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    setOn(pinnedOn());
    const h = (e: Event) => setOn((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);
  return on;
}

export default function AutoHideToggle() {
  const pinned = usePinned();
  const on = !pinned;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Auto-hide"
      className="theme-switch lite-switch"
      onClick={() => setPinned(!pinned)}
    >
      <span className="knob" aria-hidden="true" />
    </button>
  );
}
