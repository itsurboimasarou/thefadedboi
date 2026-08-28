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
import MusicPlayer from "../widgets/MusicPlayer";
import { home } from "@/lib/home.config";
import { accentSets } from "@/lib/accents.config";
import { COMPACT_MQ } from "./functions/useHuBarAutoHide";

export const PANEL_EVT = "control-panel-toggle";
export const MUSIC_EVT = "music-player-toggle";

export function toggleMusicPlayer() {
  window.dispatchEvent(new CustomEvent(MUSIC_EVT));
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

type PanelView = "none" | "controls" | "player";

export default function ControlPanel({ changelog }: { changelog: string }) {
  const [visiblePanel, setVisiblePanel] = useState<PanelView>("none");
  const open = visiblePanel === "controls";
  const playerOpen = visiblePanel === "player";
  const lastPanelRef = useRef<"controls" | "player">("controls");
  useEffect(() => {
    if (visiblePanel !== "none") lastPanelRef.current = visiblePanel;
  }, [visiblePanel]);
  const visiblePanelRef = useRef<PanelView>("none");
  useEffect(() => { visiblePanelRef.current = visiblePanel; }, [visiblePanel]);

  const [transitionKind, setTransitionKind] = useState<"vertical" | "horizontal">("vertical");
  const navigateTo = (next: PanelView) => {
    const current = visiblePanelRef.current;
    const isSwitch =
      (current === "controls" && next === "player") ||
      (current === "player" && next === "controls");
    setTransitionKind(isSwitch ? "horizontal" : "vertical");
    setVisiblePanel(next);
  };

  const [logOpen, setLogOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const liteOn = useLiteMode();
  const [sliding, setSliding] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const viewsRef = useRef<HTMLDivElement>(null);
  const mainViewRef = useRef<HTMLDivElement>(null);
  const themeViewRef = useRef<HTMLDivElement>(null);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const dragMetaRef = useRef<{ x: number; y: number; width: number } | null>(null);

  useEffect(() => {
    const onToggle = () => {
      const mobile = window.matchMedia(COMPACT_MQ).matches;
      const current = visiblePanelRef.current;
      const next = mobile
        ? (current === "none" ? lastPanelRef.current : "none")
        : (current === "controls" ? "none" : "controls");
      navigateTo(next);
    };
    const onPlayerToggle = () => {
      navigateTo(visiblePanelRef.current === "player" ? "none" : "player");
    };
    window.addEventListener(PANEL_EVT, onToggle);
    window.addEventListener(MUSIC_EVT, onPlayerToggle);
    return () => {
      window.removeEventListener(PANEL_EVT, onToggle);
      window.removeEventListener(MUSIC_EVT, onPlayerToggle);
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
    window.dispatchEvent(new CustomEvent("control-panel-state", { detail: visiblePanel !== "none" }));
  }, [visiblePanel]);

  useEffect(() => {
    if (visiblePanel === "none") return;
    const isOutside = (t: Node) =>
      !(t as Element).closest?.(".control-panel") &&
      !(t as Element).closest?.(".hubar-trigger") &&
      !(t as Element).closest?.(".status-clock") &&
      !(t as Element).closest?.(".notice-backdrop");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !logOpen) navigateTo("none");
    };
    const onDown = (e: MouseEvent) => {
      if (isOutside(e.target as Node)) navigateTo("none");
    };
    const onTouch = (e: TouchEvent) => {
      if (isOutside(e.target as Node)) navigateTo("none");
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onTouch);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onTouch);
    };
  }, [visiblePanel, logOpen]);

  const onPanelTouchStart = (e: React.TouchEvent) => {
    if (themeMenuOpen || playerOpen || !window.matchMedia(COMPACT_MQ).matches) return;
    const t = e.touches[0];
    dragMetaRef.current = {
      x: t.clientX,
      y: t.clientY,
      width: panelRef.current?.getBoundingClientRect().width || 1,
    };
  };
  const onPanelTouchMove = (e: React.TouchEvent) => {
    const meta = dragMetaRef.current;
    if (!meta) return;
    const t = e.touches[0];
    const dx = t.clientX - meta.x;
    const dy = t.clientY - meta.y;
    if (dragProgress === null && (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy) * 1.2)) return;
    setDragProgress(Math.min(1, Math.max(0, dx / meta.width)));
  };
  const onPanelTouchEnd = () => {
    dragMetaRef.current = null;
    if (dragProgress === null) return;
    if (dragProgress > 0.35) navigateTo("player");
    setDragProgress(null);
  };

  const wheelLockRef = useRef(false);
  const wheelResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPanelWheel = (e: React.WheelEvent) => {
    if (themeMenuOpen) return;
    if (wheelResetRef.current) clearTimeout(wheelResetRef.current);
    wheelResetRef.current = setTimeout(() => { wheelLockRef.current = false; }, 400);
    if (wheelLockRef.current) return;
    if (e.deltaX < -24 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2) {
      wheelLockRef.current = true;
      navigateTo("player");
    }
  };

  return (
    <>
      <div
        id="control-panel"
        ref={panelRef}
        className={`control-panel${open ? " control-panel--open" : ""}${dragProgress !== null ? " control-panel--dragging" : ""}${transitionKind === "horizontal" ? " panel-switching" : ""}`}
        style={dragProgress !== null ? {
          transform: `translateX(calc(${dragProgress * 100}% + ${dragProgress * 16}px))`,
          opacity: 1 - dragProgress,
        } : undefined}
        role="dialog"
        aria-label="Site controls"
        aria-hidden={!open}
        onTouchStart={onPanelTouchStart}
        onTouchMove={onPanelTouchMove}
        onTouchEnd={onPanelTouchEnd}
        onWheel={onPanelWheel}
      >
        <div className="panel-head">
          <h2 className="h-with-icon panel-title">
            <Icon name="spark" size={18} />
            At a glance
          </h2>
          <div className="glance-row--mobile-only">
            <StatusClock
              config={home.status}
              onClick={() => navigateTo("player")}
            />
          </div>
          <div className="panel-head-actions">
            {themeMenuOpen ? (
              <button
                type="button"
                className="panel-back-btn"
                onClick={() => setThemeMenuOpen(false)}
                aria-label="Back"
              >
                <Icon name="arrowLeft" size={14} />
                Back
              </button>
            ) : (
              <button
                type="button"
                className="panel-back-btn"
                onClick={() => setLogOpen(true)}
                aria-label="Changelog"
              >
                <Icon name="blog" size={14} />
                Changelog
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
              onClick={() => navigateTo("none")}
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
              Glass blur
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

        <div className="panel-quick-links">
          <div className="glance-row--mobile-only">
            <button
              type="button"
              className="text-btn"
              onClick={() => setLogOpen(true)}
            >
              <Icon name="blog" size={14} />
              Changelog
            </button>
          </div>

          <button
            type="button"
            className="text-btn"
            onClick={() => setThemeMenuOpen(true)}
          >
            <Icon name="paintbrush" size={14} />
            Customize theme
          </button>
        </div>
        </div>

        <div
          className={`theme-menu panel-view-slide panel-view-slide--theme${themeMenuOpen ? " panel-view-slide--front" : ""}`}
          ref={themeViewRef}
          aria-hidden={!themeMenuOpen}
        >
          <div className="theme-menu-section">
            <h3 className="h-with-icon theme-menu-heading">
              <Icon name="layers" size={15} />
              Color sets
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

        {!themeMenuOpen && (
          <p className="panel-swipe-hint">Swipe right for music player</p>
        )}
      </div>

      <ChangelogDialog
        open={logOpen}
        onClose={() => setLogOpen(false)}
        changelog={changelog}
      />
      <MusicPlayer
        open={playerOpen}
        onClose={() => navigateTo("controls")}
        dragProgress={dragProgress}
        setDragProgress={setDragProgress}
        switching={transitionKind === "horizontal"}
      />
    </>
  );
}
