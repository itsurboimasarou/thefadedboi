import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Icon from "../ui/Icons";
import ThemeToggle from "../controls/ThemeToggle";
import LiteModeToggle, { useLiteMode } from "../controls/LiteMode";
import SnowToggle from "../controls/SnowMode";
import GlassToggle from "../controls/GlassMode";
import AutoHideToggle from "../controls/HuBarPinned";
import DockControl from "../controls/HuBarDock";
import LangSwitch from "../controls/LangSwitch";
import AccentSwitch from "../controls/AccentSwitch";
import AccentSetSwitch from "../controls/AccentSetSwitch";
import LogoSwitch from "../controls/LogoSwitch";
import StatusClock from "../widgets/StatusClock";
import ChangelogDialog from "../content/ChangelogDialog";
import { home } from "@/lib/home.config";
import { accentSets } from "@/lib/accents.config";

export const PANEL_EVT = "control-panel-toggle";
export const CHANGELOG_EVT = "changelog-open";

export function openChangelog() {
  window.dispatchEvent(new CustomEvent(CHANGELOG_EVT));
}

export function toggleControlPanel() {
  window.dispatchEvent(new CustomEvent(PANEL_EVT));
}

function resetAllToDefault() {
  const keys = [
    "theme", "glass-fx", "lite-mode", "snow", "hubar-pinned", "hubar-dock",
    "lang", "logo-custom", "accent-set",
    ...accentSets.map((s) => `accent-element-${s.key}`),
  ];
  try {
    for (const k of keys) localStorage.removeItem(k);
  } catch {}
  window.location.reload();
}

export default function ControlPanel({ changelog }: { changelog: string }) {
  const [open, setOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const liteOn = useLiteMode();
  const [sliding, setSliding] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const viewsRef = useRef<HTMLDivElement>(null);
  const mainViewRef = useRef<HTMLDivElement>(null);
  const themeViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onToggle = () => setOpen((v) => !v);
    const onLog = () => setLogOpen(true);
    window.addEventListener(PANEL_EVT, onToggle);
    window.addEventListener(CHANGELOG_EVT, onLog);
    return () => {
      window.removeEventListener(PANEL_EVT, onToggle);
      window.removeEventListener(CHANGELOG_EVT, onLog);
    };
  }, []);

  useEffect(() => {
    if (!open) setThemeMenuOpen(false);
  }, [open]);

  useLayoutEffect(() => {
    setSliding(true);
    const t = setTimeout(() => setSliding(false), 340);
    return () => clearTimeout(t);
  }, [themeMenuOpen]);

  useLayoutEffect(() => {
    const wrap = viewsRef.current;
    const main = mainViewRef.current;
    const theme = themeViewRef.current;
    if (!wrap || !main || !theme) return;
    const sync = () => {
      const active = themeMenuOpen ? theme : main;
      let height = active.scrollHeight;
      const openMenu = active.querySelector<HTMLElement>(".set-menu");
      if (openMenu) {
        const extent = openMenu.getBoundingClientRect().bottom - active.getBoundingClientRect().top;
        height = Math.max(height, extent);
      }
      wrap.style.height = `${height}px`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(main);
    ro.observe(theme);
    const mo = new MutationObserver(sync);
    mo.observe(theme, { childList: true, subtree: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [themeMenuOpen]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("control-panel-state", { detail: open }));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if ((t as Element).closest?.(".hubar-trigger")) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <>
      <div
        id="control-panel"
        ref={panelRef}
        className={`control-panel${open ? " control-panel--open" : ""}`}
        role="dialog"
        aria-label="Site controls"
        aria-hidden={!open}
      >
        <div className="panel-head">
          <h2 className="h-with-icon panel-title">
            <Icon name="spark" size={18} />
            At a glance
          </h2>
          <div className="glance-row--mobile-only">
            <StatusClock config={home.status} onClick={openChangelog} />
          </div>
          <div className="panel-head-actions">
            {themeMenuOpen && (
              <button
                type="button"
                className="panel-back-btn"
                onClick={() => setThemeMenuOpen(false)}
                aria-label="Back"
              >
                <Icon name="arrowLeft" size={14} />
                Back
              </button>
            )}
            <button
              type="button"
              className="panel-icon-btn"
              onClick={resetAllToDefault}
              aria-label="Reset all to default"
              title="Reset all to default"
            >
              <Icon name="circleArrow" size={16} />
            </button>
            <button
              type="button"
              className="panel-icon-btn"
              onClick={() => setOpen(false)}
              aria-label="Close"
              title="Close"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>

        <div className={`panel-views${sliding ? " panel-views--sliding" : ""}`} ref={viewsRef}>
        <div
          className={`panel-view-slide panel-view-slide--main${themeMenuOpen ? " panel-view-slide--behind" : ""}`}
          ref={mainViewRef}
          aria-hidden={themeMenuOpen}
        >
        <dl className="fact-grid glance-grid">
          <div>
            <dt>
              <Icon name="moon" size={15} />
              Appearance
            </dt>
            <dd className="dd-row">
              <ThemeToggle />
            </dd>
          </div>

          <div className={liteOn ? "row--disabled" : undefined}>
            <dt>
              <Icon name="display" size={15} />
              Glass effect
            </dt>
            <dd className="dd-row">
              <GlassToggle />
              <span className="info-tip" tabIndex={liteOn ? -1 : 0} aria-hidden={liteOn || undefined} aria-label="About glass effect">
                <Icon name="info" size={17} />
                <span className="info-tip-bubble" role="tooltip">
                  Frosted blur behind HuBar. Costs GPU when anything animates
                  behind it.
                </span>
              </span>
            </dd>
          </div>

          <div>
            <dt>
              <Icon name="gear" size={15} />
              Lite mode
            </dt>
            <dd className="dd-row">
              <LiteModeToggle />
              <span className="info-tip" tabIndex={0} aria-label="About Lite mode">
                <Icon name="info" size={17} />
                <span className="info-tip-bubble" role="tooltip">
                  Turns off animations and transparency effects — recommended for
                  older devices or weak hardware.
                </span>
              </span>
            </dd>
          </div>

          <div className={liteOn ? "row--disabled" : undefined}>
            <dt>
              <Icon name="snow" size={15} />
              Snow
            </dt>
            <dd className="dd-row">
              <SnowToggle />
              <span className="info-tip" tabIndex={0} aria-label="About snow">
                <Icon name="info" size={17} />
                <span className="info-tip-bubble" role="tooltip">
                  Falling snow in the background. Turning it off ends flake
                  generation — the last few finish their descent.
                </span>
              </span>
            </dd>
          </div>

          <div>
            <dt>
              <Icon name="thumbtack" size={15} />
              Auto-hide
            </dt>
            <dd className="dd-row">
              <AutoHideToggle />
              <span className="info-tip" tabIndex={0} aria-label="About auto-hide">
                <Icon name="info" size={17} />
                <span className="info-tip-bubble" role="tooltip">
                  HuBar hides itself after a moment and reappears on hover,
                  edge-swipe, or focus. Turn this off to keep it always shown.
                </span>
              </span>
            </dd>
          </div>

          <div>
            <dt>
              <Icon name="target" size={15} />
              HuBar position
            </dt>
            <dd className="dd-row">
              <DockControl />
            </dd>
          </div>

          <div className="glance-row--mobile-only">
            <dt>
              <Icon name="globe" size={15} />
              Language
            </dt>
            <dd className="dd-row">
              <LangSwitch />
            </dd>
          </div>

        </dl>

        <button
          type="button"
          className="text-btn text-btn--center"
          onClick={() => setThemeMenuOpen(true)}
        >
          <Icon name="paintbrush" size={14} />
          Customize theme
        </button>
        </div>

        <div
          className={`theme-menu panel-view-slide panel-view-slide--theme${themeMenuOpen ? " panel-view-slide--front" : ""}`}
          ref={themeViewRef}
          aria-hidden={!themeMenuOpen}
        >
          <div className="theme-menu-section">
            <h3 className="h-with-icon theme-menu-heading">
              <Icon name="layers" size={15} />
              Sets
            </h3>
            <AccentSetSwitch />
          </div>

          <div className="theme-menu-section">
            <h3 className="h-with-icon theme-menu-heading">
              <Icon name="paintbrush" size={15} />
              Accent color
            </h3>
            <AccentSwitch />
          </div>

          <div className="theme-menu-section theme-menu-section--logo">
            <h3 className="h-with-icon theme-menu-heading">
              <Icon name="image" size={15} />
              Logo
            </h3>
            <LogoSwitch />
          </div>

          <button
            type="button"
            className="text-btn text-btn--center theme-menu-back-mobile"
            onClick={() => setThemeMenuOpen(false)}
          >
            <Icon name="arrowLeft" size={14} />
            Back
          </button>
        </div>
        </div>
      </div>

      <ChangelogDialog
        open={logOpen}
        onClose={() => setLogOpen(false)}
        changelog={changelog}
      />
    </>
  );
}
