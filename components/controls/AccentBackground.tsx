import { useEffect, useState } from "react";
import Icon from "../ui/Icons";
import SliderRow from "../ui/SliderRow";
import SetSelect, { type SelectOption } from "./SetSelect";
import { useLiteMode } from "./LiteMode";
import { THEME_EVT, type Theme } from "./ThemeToggle";
import { useLocalized } from "@/lib/i18n";
import { accentBgUi as ui } from "@/lib/ui-strings";
import { createSetting } from "@/lib/setting";

export type AccentBgMix = "theme" | "strong";
export type GradientStyle = "hulight" | "linear";
export type GradientDir = "right" | "left";
export type GradientChoice = "none" | GradientStyle;

const root = () => document.documentElement;

const onSetting = createSetting<boolean>({
  key: "accent-bg",
  event: "accent-bg-change",
  fallback: false,
  parse: (raw) => raw === "1",
  serialize: (v) => (v ? "1" : "0"),
  apply: (v) => root().classList.toggle("accent-bg", v),
});

const mixSetting = createSetting<AccentBgMix>({
  key: "accent-bg-mix",
  event: "accent-bg-mix-change",
  fallback: "theme",
  parse: (raw) => (raw === null || raw === "theme" ? "theme" : "strong"),
  apply: (v) => root().setAttribute("data-accent-bg-mix", v),
});

const motionSetting = createSetting<boolean>({
  key: "accent-bg-motion",
  event: "accent-bg-motion-change",
  fallback: true,
  parse: (raw) => raw !== "0",
  serialize: (v) => (v ? "1" : "0"),
  apply: (v) => root().classList.toggle("accent-bg-motion", v),
});

const styleSetting = createSetting<GradientStyle>({
  key: "accent-bg-style",
  event: "accent-bg-style-change",
  fallback: "hulight",
  parse: (raw) => (raw === "linear" ? "linear" : "hulight"),
  apply: (v) => root().setAttribute("data-accent-bg-style", v),
});

export const DEFAULT_ANGLE = 45;

const clampAngle = (n: number) =>
  Number.isFinite(n) ? Math.min(90, Math.max(0, Math.round(n))) : DEFAULT_ANGLE;

function syncAngle() {
  const tilt = angleSetting.get();
  const left = dirSetting.get() === "left";
  root().style.setProperty("--grad-angle", `${left ? 180 + tilt : 180 - tilt}deg`);
}

const BASE_DRIFT = 48;
export const DEFAULT_SPEED = 1;
export const SPEED_MIN = 0.25;
export const SPEED_MAX = 3;

const clampSpeed = (n: number) =>
  Number.isFinite(n)
    ? Math.min(SPEED_MAX, Math.max(SPEED_MIN, Math.round(n * 4) / 4))
    : DEFAULT_SPEED;

const speedSetting = createSetting<number>({
  key: "accent-bg-speed",
  event: "accent-bg-speed-change",
  fallback: DEFAULT_SPEED,
  parse: (raw) => (raw === null ? DEFAULT_SPEED : clampSpeed(parseFloat(raw))),
  serialize: (v) => String(clampSpeed(v)),
  apply: (v) =>
    root().style.setProperty("--drift-dur", `${(BASE_DRIFT / clampSpeed(v)).toFixed(1)}s`),
});

const dirSetting = createSetting<GradientDir>({
  key: "accent-bg-dir",
  event: "accent-bg-dir-change",
  fallback: "right",
  parse: (raw) => (raw === "left" ? "left" : "right"),
  apply: syncAngle,
});

const angleSetting = createSetting<number>({
  key: "accent-bg-angle",
  event: "accent-bg-angle-change",
  fallback: DEFAULT_ANGLE,
  parse: (raw) => (raw === null ? DEFAULT_ANGLE : clampAngle(parseFloat(raw))),
  serialize: (v) => String(clampAngle(v)),
  apply: syncAngle,
});

export const DEFAULT_GRAIN = 60;

const clampGrain = (n: number) =>
  Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : DEFAULT_GRAIN;

const grainSetting = createSetting<number>({
  key: "accent-bg-grain",
  event: "accent-bg-grain-change",
  fallback: DEFAULT_GRAIN,
  parse: (raw) => (raw === null ? DEFAULT_GRAIN : clampGrain(parseFloat(raw))),
  serialize: (v) => String(clampGrain(v)),
  apply: (v) =>
    root().style.setProperty("--grad-grain", (clampGrain(v) / 100).toFixed(3)),
});

export const useAccentBg = onSetting.use;
export const setAccentBg = onSetting.set;
export const useAccentBgMix = mixSetting.use;
export const setAccentBgMix = mixSetting.set;
export const useAccentBgMotion = motionSetting.use;
export const setAccentBgMotion = motionSetting.set;
export const useGradientStyle = styleSetting.use;
export const useGradientDir = dirSetting.use;
export const setGradientDir = dirSetting.set;
export const useGradientAngle = angleSetting.use;
export const setGradientAngle = angleSetting.set;
export const useDriftSpeed = speedSetting.use;
export const setDriftSpeed = speedSetting.set;
export const useGrain = grainSetting.use;
export const setGrain = grainSetting.set;

export function useGradientChoice(): GradientChoice {
  const on = onSetting.use();
  const style = styleSetting.use();
  return on ? style : "none";
}

export function setGradientChoice(choice: GradientChoice) {
  if (choice === "none") {
    setAccentBg(false);
    return;
  }
  styleSetting.set(choice);
  setAccentBg(true);
}

function useAppearance(): Theme {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const read = () => setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    read();
    window.addEventListener(THEME_EVT, read);
    return () => window.removeEventListener(THEME_EVT, read);
  }, []);
  return theme;
}

export function GradientStyleSelect() {
  const t = useLocalized(ui);
  const choice = useGradientChoice();
  const options: SelectOption<GradientChoice>[] = [
    { key: "none", label: t.styleNone, icon: "slash" },
    { key: "linear", label: t.styleLinear, icon: "gradient" },
    { key: "hulight", label: t.styleHuLight, icon: "spark" },
  ];
  return (
    <SetSelect
      value={choice}
      options={options}
      onPick={setGradientChoice}
      label={t.style}
    />
  );
}

export function GradientDirControl({ disabled = false }: { disabled?: boolean }) {
  const t = useLocalized(ui);
  const dir = useGradientDir();
  const left = dir === "left";
  const current = left ? t.toBottomLeft : t.toBottomRight;
  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={left}
        aria-label={`${t.direction}: ${current}`}
        className="theme-switch"
        disabled={disabled}
        onClick={() => setGradientDir(left ? "right" : "left")}
      >
        <span className="knob" aria-hidden="true" />
        <span className="track-icon track-icon--left"><Icon name="arrowDownRight" size={16} /></span>
        <span className="track-icon track-icon--right"><Icon name="arrowDownLeft" size={16} /></span>
      </button>
      <span className="theme-menu-option-value" aria-hidden="true">{current}</span>
    </>
  );
}

export function GradientAngleControl({ disabled = false }: { disabled?: boolean }) {
  const t = useLocalized(ui);
  const angle = useGradientAngle();
  return (
    <SliderRow
      id="grad-angle-input"
      label={t.angle}
      readout={`${angle}°`}
      value={angle}
      min={0}
      max={90}
      step={1}
      disabled={disabled}
      onChange={setGradientAngle}
    />
  );
}

export function GradientSpeedControl({ disabled = false }: { disabled?: boolean }) {
  const t = useLocalized(ui);
  const speed = useDriftSpeed();
  return (
    <SliderRow
      id="grad-speed-input"
      label={t.speed}
      readout={`${speed}×`}
      value={speed}
      min={SPEED_MIN}
      max={SPEED_MAX}
      step={0.25}
      disabled={disabled}
      onChange={setDriftSpeed}
    />
  );
}

export function GradientGrainControl({ disabled = false }: { disabled?: boolean }) {
  const t = useLocalized(ui);
  const grain = useGrain();
  return (
    <SliderRow
      id="grad-grain-input"
      label={t.grain}
      readout={`${grain}%`}
      value={grain}
      min={0}
      max={100}
      step={5}
      disabled={disabled}
      onChange={setGrain}
    />
  );
}

export function GradientPreview() {
  return <div className="grad-preview" aria-hidden="true" />;
}

export function AccentBgMixControl({ disabled = false }: { disabled?: boolean }) {
  const t = useLocalized(ui);
  const mix = useAccentBgMix();
  const style = useGradientStyle();
  const appearance = useAppearance();
  const offer = appearance === "dark" ? t.black : t.white;
  const soft = style === "linear" ? t.average : t.theme;
  const on = mix === "strong";
  const current = on ? offer : soft;
  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={`${t.mix}: ${current}`}
        className="theme-switch"
        disabled={disabled}
        onClick={() => setAccentBgMix(on ? "theme" : "strong")}
      >
        <span className="knob" aria-hidden="true" />
        <span className="track-icon track-icon--left"><Icon name="themeAuto" size={16} /></span>
        <span className="track-icon track-icon--right"><Icon name={appearance === "dark" ? "moon" : "sun"} size={16} /></span>
      </button>
      <span className="theme-menu-option-value" aria-hidden="true">{current}</span>
    </>
  );
}

export function AccentBgMotionToggle({ disabled = false }: { disabled?: boolean }) {
  const t = useLocalized(ui);
  const on = useAccentBgMotion();
  const lite = useLiteMode();
  const off = disabled || lite;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={off ? false : on}
      aria-label={t.motion}
      className="theme-switch lite-switch"
      disabled={off}
      onClick={() => setAccentBgMotion(!on)}
    >
      <span className="knob" aria-hidden="true" />
    </button>
  );
}
