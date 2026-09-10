import { useLiteMode } from "./LiteMode";
import { createSetting } from "@/lib/setting";
import { useLocalized } from "@/lib/i18n";
import { starsUi as ui } from "@/lib/ui-strings";

const starsSetting = createSetting<boolean>({
  key: "stars",
  event: "stars-change",
  fallback: false,
  parse: (raw) => raw === "1",
  serialize: (v) => (v ? "1" : "0"),
  apply: (v) => document.documentElement.classList.toggle("stars", v),
});

export const useStars = starsSetting.use;
export const setStars = starsSetting.set;

export default function StarToggle() {
  const t = useLocalized(ui);
  const on = useStars();
  const lite = useLiteMode();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={lite ? false : on}
      aria-label={t.stars}
      className="theme-switch lite-switch"
      disabled={lite}
      title={lite ? t.lockedByLite : undefined}
      onClick={() => setStars(!on)}
    >
      <span className="knob" aria-hidden="true" />
    </button>
  );
}
