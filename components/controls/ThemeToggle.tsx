import { useEffect, useState } from "react";
import Icon from "../ui/Icons";
import { reapplyAccentForTheme } from "./AccentSwitch";
import { useLocalized } from "@/lib/i18n";
import { themeUi as ui } from "@/lib/ui-strings";

export const THEME_EVT = "theme-change";
const MODE_EVT = "theme-mode-change";

export type Theme = "dark" | "light";
export type ThemeMode = Theme | "auto";

const SCHEME_MQ = "(prefers-color-scheme: light)";
const KEY = "theme";

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
      <span className="track-icon track-icon--left"><Icon name="moon" size={16} /></span>
      <span className="track-icon track-icon--right"><Icon name="sun" size={16} /></span>
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
