import { useEffect, useState } from "react";
import Icon from "../ui/Icons";
import { useLiteMode } from "./LiteMode";
import { THEME_EVT, type Theme } from "./ThemeToggle";
import { useLocalized, type Localized } from "@/lib/i18n";
import { createSetting } from "@/lib/setting";

export type AccentBgMix = "theme" | "strong";

const ui: Localized<{
  background: string;
  aboutBackground: string;
  backgroundTip: string;
  mix: string;
  white: string;
  theme: string;
  black: string;
  motion: string;
  aboutMotion: string;
  motionTip: string;
  onOff: string;
  tone: string;
  drifting: string;
}> = {
  en: {
    background: "Accent background",
    aboutBackground: "About accent background",
    backgroundTip: "A soft wash of your accent colour behind each page. Home keeps its video.",
    mix: "Background tone",
    white: "Pastel",
    theme: "Follow theme",
    black: "Deep",
    motion: "Drifting background",
    aboutMotion: "About drifting background",
    motionTip: "Slowly moves the wash. Off in Lite mode and when your system prefers reduced motion.",
    onOff: "On/Off",
    tone: "Tone",
    drifting: "Drifting",
  },
  vi: {
    background: "Nền màu nhấn",
    aboutBackground: "Về nền màu nhấn",
    backgroundTip: "Lớp màu nhấn loang nhẹ phía sau mỗi trang. Trang chủ vẫn giữ video nền.",
    mix: "Tông nền",
    white: "Pastel",
    theme: "Theo giao diện",
    black: "Đậm",
    motion: "Nền chuyển động",
    aboutMotion: "Về nền chuyển động",
    motionTip: "Cho lớp màu trôi chậm. Tắt ở chế độ Lite và khi hệ thống yêu cầu giảm chuyển động.",
    onOff: "Bật/Tắt",
    tone: "Tông",
    drifting: "Chuyển động",
  },
};

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

export const useAccentBg = onSetting.use;
export const setAccentBg = onSetting.set;
export const useAccentBgMix = mixSetting.use;
export const setAccentBgMix = mixSetting.set;
export const useAccentBgMotion = motionSetting.use;
export const setAccentBgMotion = motionSetting.set;

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

export function AccentBgToggle() {
  const t = useLocalized(ui);
  const on = useAccentBg();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={t.background}
      className="theme-switch lite-switch"
      onClick={() => setAccentBg(!on)}
    >
      <span className="knob" aria-hidden="true" />
    </button>
  );
}

export function AccentBgMixControl({ disabled = false }: { disabled?: boolean }) {
  const t = useLocalized(ui);
  const mix = useAccentBgMix();
  const appearance = useAppearance();
  const offer = appearance === "dark" ? t.black : t.white;
  const on = mix === "strong";
  const current = on ? offer : t.theme;
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

export const accentBgUi = ui;
