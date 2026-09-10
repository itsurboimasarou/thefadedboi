import Icon from "../ui/Icons";
import SliderRow from "../ui/SliderRow";
import { useLiteMode } from "./LiteMode";
import { useLocalized } from "@/lib/i18n";
import { glassUi as ui } from "@/lib/ui-strings";
import { createSetting } from "@/lib/setting";

export type GlassLevel = "off" | "hubar" | "all";

const LEVELS: GlassLevel[] = ["off", "hubar", "all"];

const icons: Record<GlassLevel, string> = {
  off: "slash",
  hubar: "star4Filled",
  all: "layers",
};

const glassSetting = createSetting<GlassLevel>({
  key: "glass-fx",
  event: "glass-mode-change",
  fallback: "off",
  parse: (raw) => (raw === "2" ? "all" : raw === "1" ? "hubar" : "off"),
  serialize: (v) => (v === "all" ? "2" : v === "hubar" ? "1" : "0"),
  apply: (v) => {
    const c = document.documentElement.classList;
    c.toggle("glass-fx", v !== "off");
    c.toggle("glass-fx--all", v === "all");
  },
});

export const DEFAULT_TINT = 50;
export const TINT_LIGHT_INK = 40;

const clampTint = (n: number) =>
  Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : DEFAULT_TINT;

const tintSetting = createSetting<number>({
  key: "glass-tint",
  event: "glass-tint-change",
  fallback: DEFAULT_TINT,
  parse: (raw) => (raw === null ? DEFAULT_TINT : clampTint(parseFloat(raw))),
  serialize: (v) => String(clampTint(v)),
  apply: (v) => {
    const n = clampTint(v);
    const root = document.documentElement;
    root.style.setProperty("--surface-tint", `${n}%`);
    if (n < TINT_LIGHT_INK) root.dataset.tintLow = "true";
    else delete root.dataset.tintLow;
  },
});

export const useTint = tintSetting.use;
export const setTint = tintSetting.set;

export function GlassTintControl({ disabled = false }: { disabled?: boolean }) {
  const t = useLocalized(ui);
  const tint = useTint();
  return (
    <SliderRow
      id="glass-tint-input"
      label={t.tint}
      readout={`${tint}%`}
      value={tint}
      min={0}
      max={100}
      step={5}
      disabled={disabled}
      onChange={setTint}
    />
  );
}

export const getGlass = glassSetting.get;
export const setGlass = glassSetting.set;
export const useGlass = glassSetting.use;

export default function GlassToggle() {
  const t = useLocalized(ui);
  const level = useGlass();
  const locked = useLiteMode();
  const labels: Record<GlassLevel, string> = { off: t.off, hubar: t.hubar, all: t.all };

  return (
    <div
      className="tri-switch"
      role="radiogroup"
      aria-label={t.glass}
      data-pos={LEVELS.indexOf(level)}
      aria-disabled={locked || undefined}
    >
      <span className="knob" aria-hidden="true" />
      {LEVELS.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={level === l}
          aria-label={labels[l]}
          data-tip={labels[l]}
          className="tri-switch-slot"
          disabled={locked}
          onClick={() => setGlass(l)}
        >
          <Icon name={icons[l]} size={15} />
        </button>
      ))}
    </div>
  );
}
