import { useEffect, useState } from "react";
import Icon from "../ui/Icons";
import { useCompact } from "../layout/functions/useHuBarAutoHide";

const EVT = "hubar-dock-change";

export type Dock = "top" | "bottom" | "left" | "right";

const DOCKS: Dock[] = ["top", "bottom", "left", "right"];

export function getDock(): Dock {
  if (typeof window === "undefined") return "top";
  try {
    const v = localStorage.getItem("hubar-dock");
    return v === "top" || v === "bottom" || v === "left" || v === "right" ? v : "top";
  } catch {
    return "top";
  }
}

export function setDock(d: Dock) {
  try { localStorage.setItem("hubar-dock", d); } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: d }));
}

export function useDock() {
  const [dock, setDockState] = useState<Dock>("top");
  useEffect(() => {
    setDockState(getDock());
    const h = (e: Event) => setDockState((e as CustomEvent<Dock>).detail);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);
  return dock;
}

const labels: Record<Dock, string> = {
  top: "Top",
  bottom: "Bottom",
  left: "Left",
  right: "Right",
};

const icons: Record<Dock, string> = {
  top: "dockTop",
  bottom: "dockBottom",
  left: "dockLeft",
  right: "dockRight",
};

export default function DockControl() {
  const dock = useDock();
  const compact = useCompact();
  const visible = compact ? DOCKS.filter((d) => d !== "left" && d !== "right") : DOCKS;

  return (
    <div className="dock-control" role="group" aria-label="HuBar position">
      {visible.map((d) => (
        <span key={d} className="dock-control-item">
          <button
            type="button"
            role="radio"
            aria-checked={dock === d}
            aria-label={labels[d]}
            title={labels[d]}
            className={`shape-toggle${dock === d ? " shape-toggle--on" : ""}`}
            onClick={() => setDock(d)}
          >
            <Icon name={icons[d]} size={16} />
          </button>
        </span>
      ))}
    </div>
  );
}
