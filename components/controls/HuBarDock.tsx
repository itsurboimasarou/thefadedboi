import Icon from "../ui/Icons";
import { useCompact } from "@/lib/functions/useHuBarFit";
import { useLocalized, type Localized } from "@/lib/i18n";
import { createSetting } from "@/lib/setting";

export type Dock = "top" | "bottom" | "left" | "right";

const DOCKS: Dock[] = ["top", "bottom", "left", "right"];

const ui: Localized<{
  position: string;
  top: string;
  bottom: string;
  left: string;
  right: string;
}> = {
  en: {
    position: "HuBar position",
    top: "Top",
    bottom: "Bottom",
    left: "Left",
    right: "Right",
  },
  vi: {
    position: "Vị trí HuBar",
    top: "Trên",
    bottom: "Dưới",
    left: "Trái",
    right: "Phải",
  },
};

const dockSetting = createSetting<Dock>({
  key: "hubar-dock",
  event: "hubar-dock-change",
  fallback: "top",
  parse: (raw) => (DOCKS.includes(raw as Dock) ? (raw as Dock) : "top"),
});

export const getDock = dockSetting.get;
export const setDock = dockSetting.set;
export const useDock = dockSetting.use;

const icons: Record<Dock, string> = {
  top: "dockTop",
  bottom: "dockBottom",
  left: "dockLeft",
  right: "dockRight",
};

export default function DockControl() {
  const t = useLocalized(ui);
  const dock = useDock();
  const compact = useCompact();
  const visible = compact ? DOCKS.filter((d) => d !== "left" && d !== "right") : DOCKS;
  const labels: Record<Dock, string> = {
    top: t.top,
    bottom: t.bottom,
    left: t.left,
    right: t.right,
  };

  return (
    <div className="dock-control" role="group" aria-label={t.position}>
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
