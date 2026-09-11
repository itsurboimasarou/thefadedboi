import SliderRow from "../ui/SliderRow";
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

export const STAR_RATE_MAX = 3;
export const DEFAULT_STAR_RATE = 2;

const clampRate = (n: number) =>
  Number.isFinite(n) ? Math.min(STAR_RATE_MAX, Math.max(0, Math.round(n))) : DEFAULT_STAR_RATE;

const rateSetting = createSetting<number>({
  key: "stars-rate",
  event: "stars-rate-change",
  fallback: DEFAULT_STAR_RATE,
  parse: (raw) => (raw === null ? DEFAULT_STAR_RATE : clampRate(parseFloat(raw))),
  serialize: (v) => String(clampRate(v)),
});

export const useStarRate = rateSetting.use;
export const setStarRate = rateSetting.set;

export function StarRateControl({ disabled = false }: { disabled?: boolean }) {
  const t = useLocalized(ui);
  const rate = useStarRate();
  return (
    <SliderRow
      id="star-rate-input"
      label={t.rate}
      readout={t.rates[rate]}
      value={rate}
      min={0}
      max={STAR_RATE_MAX}
      step={1}
      disabled={disabled}
      onChange={setStarRate}
    />
  );
}

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
