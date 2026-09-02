import { useEffect, useState } from "react";
import Icon from "../ui/Icons";
import { reapplyAccentForTheme } from "./AccentSwitch";
import { useLocalized, type Localized } from "@/lib/i18n";

export const THEME_EVT = "theme-change";
const MODE_EVT = "theme-mode-change";

export type Theme = "dark" | "light";
export type ThemeMode = Theme | "auto";

const SCHEME_MQ = "(prefers-color-scheme: light)";
const KEY = "theme";

const ui: Localized<{ toggle: string; auto: string; autoOn: string }> = {
  en: {
    toggle: "Toggle theme",
    auto: "Match browser theme",
    autoOn: "Matching browser theme",
  },
  vi: {
    toggle: "Đổi giao diện",
    auto: "Theo giao diện trình duyệt",
    autoOn: "Đang theo giao diện trình duyệt",
  },
};

const sun = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4.6" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5 5l1.6 1.6M17.4 17.4 19 19M19 5l-1.6 1.6M6.6 17.4 5 19" />
  </svg>
);

const moon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
  </svg>
);

export function getThemeMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === "light" || raw === "dark") return raw;
  } catch { }
  return "auto";
}

function browserTheme(): Theme {
  return window.matchMedia(SCHEME_MQ).matches ? "light" : "dark";
}

export function resolveTheme(mode: ThemeMode): Theme {
  return mode === "auto" ? browserTheme() : mode;
}

function applyTheme(theme: Theme) {
  if (document.documentElement.dataset.theme === theme) return;
  document.documentElement.dataset.theme = theme;
  reapplyAccentForTheme();
  window.dispatchEvent(new CustomEvent(THEME_EVT, { detail: theme }));
}

export function setThemeMode(mode: ThemeMode) {
  try {
    if (mode === "auto") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, mode);
  } catch { }
  applyTheme(resolveTheme(mode));
  window.dispatchEvent(new CustomEvent(MODE_EVT, { detail: mode }));
}

function useThemeMode(): ThemeMode {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    setMode(getThemeMode());
    const onMode = (e: Event) => setMode((e as CustomEvent<ThemeMode>).detail);
    window.addEventListener(MODE_EVT, onMode);
    return () => window.removeEventListener(MODE_EVT, onMode);
  }, []);

  useEffect(() => {
    if (mode !== "auto") return;
    const mq = window.matchMedia(SCHEME_MQ);
    const sync = () => applyTheme(browserTheme());
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [mode]);

  return mode;
}

export default function ThemeToggle() {
  const t = useLocalized(ui);
  const mode = useThemeMode();
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const read = () => setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    read();
    window.addEventListener(THEME_EVT, read);
    return () => window.removeEventListener(THEME_EVT, read);
  }, [mode]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "light"}
      className="theme-switch"
      onClick={() => setThemeMode(theme === "light" ? "dark" : "light")}
      aria-label={t.toggle}
    >
      <span className="knob" aria-hidden="true" />
      <span className="track-icon track-icon--left">{moon}</span>
      <span className="track-icon track-icon--right">{sun}</span>
    </button>
  );
}

export function AutoThemeToggle() {
  const t = useLocalized(ui);
  const mode = useThemeMode();
  const on = mode === "auto";
  const label = on ? t.autoOn : t.auto;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      data-tip={label}
      onClick={() => setThemeMode(on ? resolveTheme("auto") : "auto")}
      className={`shape-toggle${on ? " shape-toggle--on" : ""}`}
    >
      <Icon name="themeAuto" size={16} />
    </button>
  );
}
