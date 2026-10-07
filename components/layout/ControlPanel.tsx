import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "../ui/Icons";
import ThemeToggle, { AutoThemeToggle } from "../controls/ThemeToggle";
import LiteModeToggle, { useLiteMode } from "../controls/LiteMode";
import StarToggle, { StarRateControl, useStars } from "../controls/StarMode";
import GlassToggle, { GlassTintControl, useGlass } from "../controls/GlassMode";
import AutoHideToggle from "../controls/HuBarPinned";
import DockControl, { useDock } from "../controls/HuBarDock";
import BarModeControl, { useBarMode } from "../controls/BarMode";
import ShapeControl from "../controls/HuBarShape";
import {
  useBackdropAvailability,
  useBackdropChoice,
  setBackdropChoice,
  mediaAvailable,
  type BackdropChoice,
} from "@/lib/backdrop";
import {
  AccentBgMixControl,
  AccentBgMotionToggle,
  GradientAngleControl,
  GradientDirControl,
  GradientGrainControl,
  GradientSpeedControl,
  GradientPreview,
  GradientStyleSelect,
  useGradientChoice,
  useAccentBgMotion,
} from "../controls/AccentBackground";
import SetSelect, { type SelectOption } from "../controls/SetSelect";
import LangSwitch from "../controls/LangSwitch";
import AccentSwitch from "../controls/AccentSwitch";
import AccentSetSwitch from "../controls/AccentSetSwitch";
import LogoSwitch from "../controls/LogoSwitch";
import StatusClock from "../widgets/StatusClock";
import ChangelogDialog from "../content/ChangelogDialog";
import ConfirmDialog from "../content/ConfirmDialog";
import MusicPlayer from "../widgets/MusicPlayer";
import { home as homeConfig, homeStatus } from "@/lib/configs/home.config";
import { accentSets } from "@/lib/configs/accents.config";
import { isCompact, useCompact } from "@/lib/functions/useHuBarFit";
import { useInert } from "@/lib/functions/useInert";
import { useIsoLayoutEffect } from "@/lib/functions/useIsoLayoutEffect";
import { usePanelSwipe } from "@/lib/functions/usePanelSwipe";
import { useLocalized } from "@/lib/i18n";
import { controlPanelUi as ui, accentBgUi, glassUi, barModeUi, starsUi } from "@/lib/ui-strings";

const BACKDROPS: BackdropChoice[] = ["none", "gradient", "media"];

const backdropIcons: Record<BackdropChoice, string> = {
  none: "slash",
  gradient: "gradient",
  media: "media",
};

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
    "theme", "glass-fx", "lite-mode", "hubar-pinned", "hubar-dock",
    "lang", "logo-custom", "accent-set", "hubar-shape",
    "accent-bg", "accent-bg-mix", "accent-bg-motion", "bg-backdrop", "bg-media",
    "accent-bg-style", "accent-bg-dir", "accent-bg-angle", "accent-bg-speed",
    "accent-bg-grain", "glass-tint", "bar-mode", "stars", "stars-rate",
    ...accentSets.map((s) => `accent-element-${s.key}`),
  ];
  try {
    for (const k of keys) localStorage.removeItem(k);
  } catch {}
  window.location.reload();
}

type PanelView = "none" | "controls" | "player";

export default function ControlPanel({ changelog }: { changelog: string }) {
  const home = useLocalized(homeConfig);
  const t = useLocalized(ui);
  const tipPos = useDock() === "bottom" ? "up" : "down";
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
  const [resetOpen, setResetOpen] = useState(false);
  const closeReset = useCallback(() => setResetOpen(false), []);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const liteOn = useLiteMode();
  const gradient = useGradientChoice();
  const gradientOn = gradient !== "none";
  const driftOn = useAccentBgMotion() && !liteOn;
  const backdropAvail = useBackdropAvailability();
  const backdropKind = useBackdropChoice();
  const gradientUsable = backdropKind !== "none";
  const noMedia =
    !mediaAvailable(backdropAvail, "video") && !mediaAvailable(backdropAvail, "image");
  const backdropLabels: Record<BackdropChoice, string> = {
    none: t.backdropNone,
    gradient: t.backdropGradient,
    media: t.backdropMedia,
  };
  const backdropOptions: SelectOption<BackdropChoice>[] = BACKDROPS.map((k) => ({
    key: k,
    label: backdropLabels[k],
    icon: backdropIcons[k],
    disabled: k === "media" && noMedia,
  }));
  const bgT = useLocalized(accentBgUi);
  const glassT = useLocalized(glassUi);
  const barT = useLocalized(barModeUi);
  const starT = useLocalized(starsUi);
  const split = useBarMode() === "split";
  const compact = useCompact();
  const showDock = !(split && compact);
  const glassOn = useGlass() !== "off";
  const starsOn = useStars();
  const [sliding, setSliding] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const viewsRef = useRef<HTMLDivElement>(null);
  const mainViewRef = useRef<HTMLDivElement>(null);
  const themeViewRef = useRef<HTMLDivElement>(null);
  const [dragProgress, setDragProgress] = useState<number | null>(null);

  // Closed panel / hidden slide are inert, not aria-hidden — see useInert.
  useInert(panelRef, !open);
  useInert(mainViewRef, themeMenuOpen);
  useInert(themeViewRef, !themeMenuOpen);

  useEffect(() => {
    const onToggle = () => {
      const mobile = isCompact();
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
    else if (viewsRef.current) viewsRef.current.scrollTop = 0;
  }, [open]);

  useIsoLayoutEffect(() => {
    if (viewsRef.current) viewsRef.current.scrollTop = 0;
    setSliding(true);
    const t = setTimeout(() => setSliding(false), 340);
    return () => clearTimeout(t);
  }, [themeMenuOpen]);

  useIsoLayoutEffect(() => {
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
      if (wrap.clientHeight < height - 1) wrap.dataset.capped = "true";
      else delete wrap.dataset.capped;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(main);
    ro.observe(theme);
    const mo = new MutationObserver(sync);
    mo.observe(main, { childList: true, subtree: true });
    mo.observe(theme, { childList: true, subtree: true });
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [themeMenuOpen]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("control-panel-state", { detail: visiblePanel }));
  }, [visiblePanel]);

  useEffect(() => {
    if (visiblePanel === "none") return;
    const isOutside = (t: Node) =>
      !(t as Element).closest?.(".control-panel") &&
      !(t as Element).closest?.(".hubar-trigger") &&
      !(t as Element).closest?.(".status-clock") &&
      !(t as Element).closest?.(".lang-switch") &&
      !(t as Element).closest?.(".hubar-nowplaying-group") &&
      !(t as Element).closest?.(".panel-indicator") &&
      !(t as Element).closest?.(".notice-backdrop");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !logOpen && !resetOpen) navigateTo("none");
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
  }, [visiblePanel, logOpen, resetOpen]);

  // Swipe right to hand off to the music player.
  const swipe = usePanelSwipe({
    panelRef,
    enabled: !themeMenuOpen && !playerOpen,
    direction: "right",
    dragProgress,
    setDragProgress,
    onCommit: () => navigateTo("player"),
    wheelEnabled: !themeMenuOpen,
  });

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
        aria-label={t.siteControls}
        {...swipe}
      >
        <div className="panel-head">
          <h2 className="h-with-icon panel-title">
            <Icon name="spark" size={18} />
            <span className="panel-title-text">{t.atAGlance}</span>
          </h2>
          <div className="glance-row--mobile-only">
            <StatusClock
              config={{ ...homeStatus, labels: home.statusLabels }}
              onClick={() => navigateTo("player")}
            />
          </div>
          <div className="panel-head-actions">
            {themeMenuOpen ? (
              <button
                type="button"
                className="panel-back-btn"
                onClick={() => setThemeMenuOpen(false)}
                aria-label={t.back}
              >
                <Icon name="chevronLeft" size={14} />
                {t.back}
              </button>
            ) : (
              <button
                type="button"
                className="panel-back-btn panel-changelog-btn"
                onClick={() => setLogOpen(true)}
                aria-label={t.changelog}
              >
                <Icon name="blog" size={14} />
                {t.changelog}
              </button>
            )}
            <button
              type="button"
              className="panel-icon-btn"
              onClick={() => setResetOpen(true)}
              aria-label={t.resetAll}
              data-tip={t.resetAll}
            >
              <Icon name="circleArrow" size={16} />
            </button>
            <button
              type="button"
              className="panel-icon-btn panel-close-btn"
              onClick={() => navigateTo("none")}
              aria-label={t.close}
              data-tip={t.close}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>

        <div className={`panel-views${sliding ? " panel-views--sliding" : ""}`} ref={viewsRef}>
        <div
          className={`panel-view-slide panel-view-slide--main${themeMenuOpen ? " panel-view-slide--behind" : ""}`}
          ref={mainViewRef}
        >
        <dl className="fact-grid glance-grid">
          <div className="glance-row--backdrop">
            <dt>
              <Icon name="image" size={15} />
              {t.backdrop}
              <span className="info-tip" tabIndex={0} aria-label={t.aboutBackdrop} data-tip={t.backdropTip}>
                <Icon name="info" size={17} />
              </span>
            </dt>
            <dd>
              <SetSelect
                value={backdropKind}
                options={backdropOptions}
                onPick={setBackdropChoice}
                label={t.backdrop}
              />
            </dd>
          </div>

          <div>
            <dt>
              <Icon name="shirt" size={15} />
              {t.appearance}
            </dt>
            <dd className="dd-row">
              <ThemeToggle />
              <AutoThemeToggle />
              <span className="info-tip" tabIndex={0} aria-label={t.aboutAppearance} data-tip={t.appearanceTip}>
                <Icon name="info" size={17} />
              </span>
            </dd>
          </div>

          <div className={liteOn ? "row--disabled" : undefined}>
            <dt>
              <Icon name="display" size={15} />
              {t.glassBlur}
            </dt>
            <dd className="dd-row">
              <GlassToggle />
              <span className="info-tip" tabIndex={liteOn ? -1 : 0} aria-hidden={liteOn || undefined} aria-label={t.aboutGlass} data-tip={t.glassTip}>
                <Icon name="info" size={17} />
              </span>
            </dd>
          </div>

          <div>
            <dt>
              <Icon name="gear" size={15} />
              {t.liteMode}
            </dt>
            <dd className="dd-row">
              <LiteModeToggle />
              <span className="info-tip" tabIndex={0} aria-label={t.aboutLite} data-tip={t.liteTip}>
                <Icon name="info" size={17} />
              </span>
            </dd>
          </div>

          <div className={liteOn ? "row--disabled" : undefined}>
            <dt>
              <Icon name="startrail" size={15} />
              {starT.stars}
            </dt>
            <dd className="dd-row">
              <StarToggle />
              <span className="info-tip" tabIndex={liteOn ? -1 : 0} aria-hidden={liteOn || undefined} aria-label={starT.aboutStars} data-tip={starT.starsTip}>
                <Icon name="info" size={17} />
              </span>
            </dd>
          </div>

          <div className="glance-row--autohide">
            <dt>
              <Icon name="thumbtack" size={15} />
              {t.autoHide}
            </dt>
            <dd className="dd-row">
              <AutoHideToggle />
              <span className="info-tip" tabIndex={0} aria-label={t.aboutAutoHide} data-tip={t.autoHideTip}>
                <Icon name="info" size={17} />
              </span>
            </dd>
          </div>

          <div className="glance-row--bars">
            <dt>
              <Icon name="display" size={15} />
              {barT.bars}
              <span className="info-tip" tabIndex={0} aria-label={barT.aboutBars} data-tip={barT.barsTip}>
                <Icon name="info" size={17} />
              </span>
            </dt>
            <dd className="dd-row">
              <BarModeControl />
            </dd>
          </div>

          {showDock && (
            <div className="glance-row--dock">
              <dt>
                <Icon name="target" size={15} />
                {split ? barT.position : t.huBarPosition}
              </dt>
              <dd className="dd-row">
                <DockControl />
              </dd>
            </div>
          )}

          <div className="glance-row--shape">
            <dt>
              <Icon name="star4" size={15} />
              {split ? barT.shape : t.huBarShape}
            </dt>
            <dd className="dd-row">
              <ShapeControl />
            </dd>
          </div>

          <div className="glance-row--mobile-only glance-row--lang">
            <dt>
              <Icon name="globe" size={15} />
              {t.language}
            </dt>
            <dd className="dd-row">
              <LangSwitch />
            </dd>
          </div>

        </dl>

        {glassOn && <GlassTintControl disabled={liteOn} />}
        {starsOn && <StarRateControl disabled={liteOn} />}

        <div className="panel-quick-links">
          <div className="glance-row--mobile-only">
            <button
              type="button"
              className="text-btn"
              onClick={() => setLogOpen(true)}
            >
              <Icon name="blog" size={14} />
              {t.changelog}
            </button>
          </div>

          <button
            type="button"
            className="text-btn"
            onClick={() => setThemeMenuOpen(true)}
          >
            <Icon name="paintbrush" size={14} />
            {t.customizeTheme}
          </button>
        </div>
        </div>

        <div
          className={`theme-menu panel-view-slide panel-view-slide--theme${themeMenuOpen ? " panel-view-slide--front" : ""}`}
          ref={themeViewRef}
        >
          <div className="theme-menu-section">
            <h3 className="h-with-icon theme-menu-heading">
              <Icon name="layers" size={15} />
              {t.colorSets}
            </h3>
            <AccentSetSwitch />
          </div>

          <div className="theme-menu-section">
            <h3 className="h-with-icon theme-menu-heading">
              <Icon name="paintbrush" size={15} />
              {t.accentColor}
            </h3>
            <AccentSwitch />
          </div>

          <div
            className={`theme-menu-section${gradientUsable ? "" : " theme-menu-section--off"}`}
          >
            <h3 className="h-with-icon theme-menu-heading">
              <Icon name="spark" size={15} />
              {t.gradientBg}
              <span className="info-tip" tabIndex={0} aria-label={bgT.aboutBackground} data-tip={`${bgT.backgroundTip} ${bgT.motionTip}`}>
                <Icon name="info" size={17} />
              </span>
            </h3>
            <GradientPreview />
            {!gradientUsable && <p className="theme-menu-note">{t.gradientOffNote}</p>}
            <GradientStyleSelect />
            {gradientOn && (
              <>
                <div className="theme-menu-options theme-menu-options--stacked">
                  <div className="theme-menu-option">
                    <span className="theme-menu-option-name">{bgT.tone}</span>
                    <AccentBgMixControl disabled={!gradientUsable} />
                  </div>
                  {gradient === "linear" ? (
                    <div className="theme-menu-option">
                      <span className="theme-menu-option-name">{bgT.direction}</span>
                      <GradientDirControl disabled={!gradientUsable} />
                    </div>
                  ) : (
                    <div className="theme-menu-option">
                      <span className="theme-menu-option-name">{bgT.drifting}</span>
                      <AccentBgMotionToggle disabled={!gradientUsable} />
                    </div>
                  )}
                </div>
                {gradient === "linear" && <GradientAngleControl disabled={!gradientUsable} />}
                {gradient !== "linear" && driftOn && (
                  <GradientSpeedControl disabled={!gradientUsable} />
                )}
                <GradientGrainControl disabled={!gradientUsable} />
              </>
            )}
          </div>

          <div className="theme-menu-section theme-menu-section--logo">
            <h3 className="h-with-icon theme-menu-heading">
              <Icon name="image" size={15} />
              {t.logo}
            </h3>
            <LogoSwitch />
          </div>
        </div>
        </div>

        {!themeMenuOpen && (
          <p className="panel-swipe-hint">{t.swipeForMusic}</p>
        )}
      </div>

      <ChangelogDialog
        open={logOpen}
        onClose={() => setLogOpen(false)}
        changelog={changelog}
      />
      <ConfirmDialog
        open={resetOpen}
        title={t.resetTitle}
        message={t.resetWarning}
        confirmLabel={t.resetConfirm}
        cancelLabel={t.cancel}
        onConfirm={resetAllToDefault}
        onClose={closeReset}
      />
      <MusicPlayer
        open={playerOpen}
        onClose={() => navigateTo("controls")}
        onDismiss={() => navigateTo("none")}
        dragProgress={dragProgress}
        setDragProgress={setDragProgress}
        switching={transitionKind === "horizontal"}
      />

      <div
        className={`panel-indicator${visiblePanel !== "none" ? " panel-indicator--visible" : ""}`}
        role="tablist"
        aria-label={t.activePanel}
      >
        <span className="panel-indicator-slot" data-tip={t.musicPlayer} data-tip-pos={tipPos}>
          <button
            type="button"
            role="tab"
            className={`panel-indicator-btn${playerOpen ? " panel-indicator-btn--active" : ""}`}
            onClick={() => navigateTo("player")}
            aria-selected={playerOpen}
            aria-label={t.musicPlayer}
          >
            <Icon name="music" size={15} />
          </button>
        </span>
        <span className="panel-indicator-slot" data-tip={t.siteControls} data-tip-pos={tipPos}>
          <button
            type="button"
            role="tab"
            className={`panel-indicator-btn${open ? " panel-indicator-btn--active" : ""}`}
            onClick={() => navigateTo("controls")}
            aria-selected={open}
            aria-label={t.siteControls}
          >
            <Icon name="spark" size={15} />
          </button>
        </span>
      </div>
    </>
  );
}
