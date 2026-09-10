import Icon from "../ui/Icons";
import { useLocalized } from "@/lib/i18n";
import { shapeUi as ui } from "@/lib/ui-strings";
import { createSetting } from "@/lib/setting";

export type Shape = "rounded" | "pill";

const SHAPES: Shape[] = ["rounded", "pill"];

const shapeSetting = createSetting<Shape>({
  key: "hubar-shape",
  event: "hubar-shape-change",
  fallback: "rounded",
  parse: (raw) => (raw === "pill" ? "pill" : "rounded"),
});

export const getShape = shapeSetting.get;
export const setShape = shapeSetting.set;
export const useShape = shapeSetting.use;

const icons: Record<Shape, string> = {
  rounded: "shapeRounded",
  pill: "shapePill",
};

export default function ShapeControl() {
  const t = useLocalized(ui);
  const shape = useShape();
  const labels: Record<Shape, string> = { rounded: t.rounded, pill: t.pill };

  return (
    <div className="shape-control" role="radiogroup" aria-label={t.shape}>
      {SHAPES.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={shape === s}
          aria-label={labels[s]}
          data-tip={labels[s]}
          className={`shape-toggle${shape === s ? " shape-toggle--on" : ""}`}
          onClick={() => setShape(s)}
        >
          <Icon name={icons[s]} size={16} />
        </button>
      ))}
    </div>
  );
}
