import { useEffect, useState } from "react";
import Icon from "../ui/Icons";
import { accentSets, DEFAULT_SET, type AccentSetDef } from "@/lib/configs/accents.config";
import { THEME_EVT } from "./ThemeToggle";

export const SET_EVT = "accent-set-change";
const ACCENT_EVT = "accent-change";
const SET_KEY = "accent-set";
const elementKeyFor = (setKey: string) => `accent-element-${setKey}`;

function currentTheme(): "light" | "dark" {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function findSet(key: string | null): AccentSetDef {
  return accentSets.find((s) => s.key === key) ?? accentSets.find((s) => s.key === DEFAULT_SET)!;
}

function isCssFallback(setKey: string, colorKey: string) {
  return setKey === DEFAULT_SET && colorKey === findSet(DEFAULT_SET).defaultKey;
}

function apply(setKey: string, colorKey: string) {
  const root = document.documentElement.style;
  if (isCssFallback(setKey, colorKey)) {
    root.removeProperty("--accent-custom");
    root.removeProperty("--accent-soft-custom");
    root.removeProperty("--accent-contrast-custom");
    return;
  }
  const set = findSet(setKey);
  const def = set.colors.find((c) => c.key === colorKey) ?? set.colors.find((c) => c.key === set.defaultKey)!;
  const v = currentTheme() === "light" ? def.light : def.dark;
  root.setProperty("--accent-custom", v.accent);
  root.setProperty("--accent-soft-custom", v.soft);
  root.setProperty("--accent-contrast-custom", v.contrast);
}

export function getAccentSet(): AccentSetDef {
  if (typeof window === "undefined") return findSet(DEFAULT_SET);
  try {
    return findSet(localStorage.getItem(SET_KEY));
  } catch {
    return findSet(DEFAULT_SET);
  }
}

export function getAccent(): string {
  const set = getAccentSet();
  if (typeof window === "undefined") return set.defaultKey;
  try {
    const v = localStorage.getItem(elementKeyFor(set.key));
    return v && set.colors.some((c) => c.key === v) ? v : set.defaultKey;
  } catch {
    return set.defaultKey;
  }
}

export function setAccent(key: string) {
  const set = getAccentSet();
  apply(set.key, key);
  try { localStorage.setItem(elementKeyFor(set.key), key); } catch {}
  window.dispatchEvent(new CustomEvent(ACCENT_EVT, { detail: key }));
}

export function setAccentSetKey(key: string) {
  const set = findSet(key);
  try { localStorage.setItem(SET_KEY, set.key); } catch {}
  const remembered = getAccent();
  apply(set.key, remembered);
  window.dispatchEvent(new CustomEvent(SET_EVT, { detail: set.key }));
  window.dispatchEvent(new CustomEvent(ACCENT_EVT, { detail: remembered }));
}

export function useAccentSet() {
  const [set, setSetState] = useState<AccentSetDef>(() => findSet(DEFAULT_SET));
  useEffect(() => {
    setSetState(getAccentSet());
    const h = (e: Event) => setSetState(findSet((e as CustomEvent<string>).detail));
    window.addEventListener(SET_EVT, h);
    return () => window.removeEventListener(SET_EVT, h);
  }, []);
  return set;
}

export function useAccent() {
  const [accent, setAccentState] = useState<string>(() => findSet(DEFAULT_SET).defaultKey);
  useEffect(() => {
    setAccentState(getAccent());
    const h = (e: Event) => setAccentState((e as CustomEvent<string>).detail);
    window.addEventListener(ACCENT_EVT, h);
    return () => window.removeEventListener(ACCENT_EVT, h);
  }, []);
  return accent;
}

export function reapplyAccentForTheme() {
  const set = getAccentSet();
  apply(set.key, getAccent());
}

export default function AccentSwitch() {
  const set = useAccentSet();
  const active = useAccent();
  const [theme, setThemeState] = useState<"light" | "dark">("dark");

  useEffect(() => {
    setThemeState(currentTheme());
    const h = (e: Event) => setThemeState((e as CustomEvent<"light" | "dark">).detail);
    window.addEventListener(THEME_EVT, h);
    return () => window.removeEventListener(THEME_EVT, h);
  }, []);

  const mix = theme === "light" ? "white" : "black";

  return (
    <div className="accent-grid" role="group" aria-label="Accent color">
      {set.colors.map((a) => {
        const v = theme === "light" ? a.light : a.dark;
        return (
          <button
            key={a.key}
            type="button"
            className={`accent-swatch${active === a.key ? " accent-swatch--on" : ""}`}
            style={{ background: `linear-gradient(135deg, ${v.accent}, color-mix(in srgb, ${v.accent} 65%, ${mix}))` }}
            aria-pressed={active === a.key}
            aria-label={a.label}
            data-tip={a.label}
            data-tip-pos="up"
            onClick={() => setAccent(a.key)}
          />
        );
      })}
      <button
        type="button"
        className="accent-swatch accent-swatch--reset"
        disabled={active === set.defaultKey}
        aria-label="Reset to default"
        data-tip="Reset to default"
        data-tip-pos="up"
        onClick={() => setAccent(set.defaultKey)}
      >
        <Icon name="circleArrow" size={16} />
      </button>
    </div>
  );
}
