import Icon from "../ui/Icons";
import { useLocalized } from "@/lib/i18n";
import { barModeUi as ui } from "@/lib/ui-strings";
import { createSetting } from "@/lib/setting";

export type BarMode = "hubar" | "split";

const MODES: BarMode[] = ["hubar", "split"];

const modeSetting = createSetting<BarMode>({
  key: "bar-mode",
  event: "bar-mode-change",
  fallback: "hubar",
  parse: (raw) => (raw === "split" ? "split" : "hubar"),
  apply: (v) => {
    if (typeof document !== "undefined") document.documentElement.dataset.barMode = v;
  },
});

export const getBarMode = modeSetting.get;
export const setBarMode = modeSetting.set;
export const useBarMode = modeSetting.use;

const icons: Record<BarMode, string> = { hubar: "shapePill", split: "dockTop" };

export default function BarModeControl() {
  const t = useLocalized(ui);
  const mode = useBarMode();
  const labels: Record<BarMode, string> = { hubar: t.hubar, split: t.split };

  return (
    <div className="shape-control" role="radiogroup" aria-label={t.bars}>
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          aria-label={labels[m]}
          data-tip={labels[m]}
          className={`shape-toggle${mode === m ? " shape-toggle--on" : ""}`}
          onClick={() => setBarMode(m)}
        >
          <Icon name={icons[m]} size={16} />
        </button>
      ))}
    </div>
  );
}
