import Icon from "../ui/Icons";
import { useLiteMode } from "./LiteMode";
import { useLocalized, type Localized } from "@/lib/i18n";
import { createSetting } from "@/lib/setting";

export type GlassLevel = "off" | "hubar" | "all";

const LEVELS: GlassLevel[] = ["off", "hubar", "all"];

const ui: Localized<{ glass: string; off: string; hubar: string; all: string }> = {
  en: { glass: "Glass blur", off: "Off", hubar: "HuBar only", all: "All elements" },
  vi: { glass: "Hiệu ứng kính mờ", off: "Tắt", hubar: "Chỉ HuBar", all: "Mọi thành phần" },
};

const icons: Record<GlassLevel, string> = {
  off: "slash",
  hubar: "star4Filled",
  all: "layers",
};

function paintHuBar(level: GlassLevel) {
  const root = document.documentElement;
  const active = level !== "off" && !root.classList.contains("lite-mode");
  const overBackdrop = root.classList.contains("has-bg-video");
  const blur = active ? "blur(16px) saturate(1.3)" : "";

  const el = document.querySelector<HTMLElement>(".hubar");
  if (!el) return;
  el.style.backdropFilter = blur;
  el.style.setProperty("-webkit-backdrop-filter", blur);
  el.style.background = active
    ? `color-mix(in srgb, ${overBackdrop ? "#000000" : "var(--bg)"} 58%, transparent)`
    : "";
}

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
    paintHuBar(v);
  },
});

export const getGlass = glassSetting.get;
export const setGlass = glassSetting.set;
export const useGlass = glassSetting.use;

export const refreshGlass = () => setGlass(getGlass());

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
