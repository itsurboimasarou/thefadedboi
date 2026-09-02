import Icon from "../ui/Icons";
import { useCompact } from "@/lib/functions/useHuBarFit";
import { createSetting } from "@/lib/setting";

export type Dock = "top" | "bottom" | "left" | "right";

const DOCKS: Dock[] = ["top", "bottom", "left", "right"];

const dockSetting = createSetting<Dock>({
  key: "hubar-dock",
  event: "hubar-dock-change",
  fallback: "top",
  parse: (raw) => (DOCKS.includes(raw as Dock) ? (raw as Dock) : "top"),
});

export const getDock = dockSetting.get;
export const setDock = dockSetting.set;
export const useDock = dockSetting.use;

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
            data-tip={labels[d]}
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
