import { useEffect, useRef, useState } from "react";
import Icon from "../ui/Icons";
import ThemeToggle, { AutoThemeToggle } from "../controls/ThemeToggle";
import LiteModeToggle, { useLiteMode } from "../controls/LiteMode";
import GlassToggle from "../controls/GlassMode";
import AutoHideToggle from "../controls/HuBarPinned";
import DockControl, { useDock } from "../controls/HuBarDock";
import ShapeControl from "../controls/HuBarShape";
import { useBackdropAvailability, useBackdropKind, setBackdropKind, type BackdropKind } from "@/lib/backdrop";
import { AccentBgToggle, AccentBgMixControl, AccentBgMotionToggle, useAccentBg, accentBgUi } from "../controls/AccentBackground";
import LangSwitch from "../controls/LangSwitch";
import AccentSwitch from "../controls/AccentSwitch";
import AccentSetSwitch from "../controls/AccentSetSwitch";
import LogoSwitch from "../controls/LogoSwitch";
import StatusClock from "../widgets/StatusClock";
import ChangelogDialog from "../content/ChangelogDialog";
import MusicPlayer from "../widgets/MusicPlayer";
import { home as homeConfig, homeStatus } from "@/lib/configs/home.config";
import { accentSets } from "@/lib/configs/accents.config";
import { isCompact } from "@/lib/functions/useHuBarFit";
import { useInert } from "@/lib/functions/useInert";
import { useIsoLayoutEffect } from "@/lib/functions/useIsoLayoutEffect";
import { usePanelSwipe } from "@/lib/functions/usePanelSwipe";
import { useLocalized, type Localized } from "@/lib/i18n";

const ui: Localized<{
  atAGlance: string;
  back: string;
  changelog: string;
  resetAll: string;
  close: string;
  appearance: string;
  aboutAppearance: string;
  appearanceTip: string;
  glassBlur: string;
  aboutGlass: string;
  glassTip: string;
  liteMode: string;
  aboutLite: string;
  liteTip: string;
  autoHide: string;
  aboutAutoHide: string;
  autoHideTip: string;
  huBarPosition: string;
  huBarShape: string;
  gradientBg: string;
  backdrop: string;
  backdropVideo: string;
  backdropImage: string;
  language: string;
  customizeTheme: string;
  colorSets: string;
  accentColor: string;
  logo: string;
  swipeForMusic: string;
  siteControls: string;
  musicPlayer: string;
  activePanel: string;
}> = {
  en: {
    atAGlance: "At a glance",
    back: "Back",
    changelog: "Changelog",
    resetAll: "Reset all to default",
    close: "Close",
    appearance: "Appearance",
    aboutAppearance: "About appearance",
    appearanceTip: "Switch between dark and light. The auto button follows your browser's theme setting instead, and changes along with it. Use the dark/light switch will turn auto theme off.",
    glassBlur: "Glass blur",
    aboutGlass: "About glass effect",
    glassTip: "Frosted blur behind HuBar. Costs GPU when anything animates behind it.",
    liteMode: "Lite mode",
    aboutLite: "About Lite mode",
    liteTip: "Turns off animations and transparency effects — recommended for older devices or weak hardware.",
    autoHide: "Auto-hide",
    aboutAutoHide: "About auto-hide",
    autoHideTip: "HuBar hides itself after a moment and reappears on hover, edge-swipe, or focus. Turn this off to keep it always shown.",
    huBarPosition: "HuBar position",
    huBarShape: "HuBar shape",
    gradientBg: "Gradient background",
    backdrop: "Home backdrop",
    backdropVideo: "Video",
    backdropImage: "Image",
    language: "Language",
    customizeTheme: "Customize theme",
    colorSets: "Color sets",
    accentColor: "Accent color",
    logo: "Logo",
    swipeForMusic: "Swipe right for music player",
    siteControls: "Site controls",
    musicPlayer: "Music player",
    activePanel: "Active panel",
  },
  vi: {
    atAGlance: "Tổng quan",
    back: "Quay lại",
    changelog: "Nhật ký cập nhật",
    resetAll: "Đặt lại về mặc định",
    close: "Đóng",
    appearance: "Giao diện",
    aboutAppearance: "Về giao diện",
    appearanceTip: "Chuyển giữa giao diện tối và sáng. Nút tự động sẽ theo cài đặt giao diện của trình duyệt và tự đổi theo, dùng công tắc sáng/tối sẽ tắt tự động chuyển giao diện theo trình duyệt",
    glassBlur: "Hiệu ứng kính mờ",
    aboutGlass: "Về hiệu ứng kính mờ",
    glassTip: "Hiệu ứng mờ sương phía sau HuBar. Tiêu tốn GPU khi có chuyển động phía sau.",
    liteMode: "Chế độ Lite",
    aboutLite: "Về chế độ Lite",
    liteTip: "Tắt hiệu ứng chuyển động và độ trong suốt — khuyên dùng cho máy cũ hoặc cấu hình yếu.",
    autoHide: "Tự động ẩn",
    aboutAutoHide: "Về tính năng tự động ẩn",
    autoHideTip: "HuBar sẽ tự động ẩn sau một lúc và hiện lại khi di chuột tới, vuốt cạnh màn hình, hoặc focus vào. Tắt để luôn hiển thị.",
    huBarPosition: "Vị trí HuBar",
    huBarShape: "Kiểu HuBar",
    gradientBg: "Nền chuyển sắc",
    backdrop: "Nền trang chủ",
    backdropVideo: "Video",
    backdropImage: "Ảnh",
    language: "Ngôn ngữ",
    customizeTheme: "Tùy chỉnh giao diện",
    colorSets: "Bộ màu",
    accentColor: "Màu sắc",
    logo: "Biểu tượng",
    swipeForMusic: "Vuốt sang phải để mở trình phát nhạc",
    siteControls: "Điều khiển trang",
    musicPlayer: "Trình phát nhạc",
    activePanel: "Bảng đang mở",
  },
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
    "accent-bg", "accent-bg-mix", "accent-bg-motion", "bg-backdrop",
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
  // The indicator is compact-only, where the bar is always top or bottom.
  // Point its tips at the panel rather than across the HuBar.
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
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const liteOn = useLiteMode();
  const accentBgOn = useAccentBg();
  const backdropAvail = useBackdropAvailability();
  const backdropKind = useBackdropKind();
  const backdropChoice = backdropAvail.video === true && backdropAvail.image === true;
  const bgT = useLocalized(accentBgUi);
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
  }, [open]);

  useIsoLayoutEffect(() => {
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
      !(t as Element).closest?.(".lang-switch") &&
      !(t as Element).closest?.(".hubar-nowplaying-group") &&
      !(t as Element).closest?.(".panel-indicator") &&
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
            {t.atAGlance}
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
                className="panel-back-btn"
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
              onClick={resetAllToDefault}
              aria-label={t.resetAll}
              data-tip={t.resetAll}
            >
              <Icon name="circleArrow" size={16} />
            </button>
            <button
              type="button"
              className="panel-icon-btn"
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
          <div>
            <dt>
              <Icon name="shirt" size={15} />
              {t.appearance}
            </dt>
            <dd className="dd-row">
              <ThemeToggle />
              <AutoThemeToggle />
              <span className="info-tip" tabIndex={0} aria-label={t.aboutAppearance}>
                <Icon name="info" size={17} />
                <span className="info-tip-bubble" role="tooltip">
                  {t.appearanceTip}
                </span>
              </span>
            </dd>
          </div>

          {backdropChoice && (
            <div>
              <dt>
                <Icon name="image" size={15} />
                {t.backdrop}
              </dt>
              <dd className="dd-row">
                <div className="shape-control" role="radiogroup" aria-label={t.backdrop}>
                  {(["video", "image"] as BackdropKind[]).map((k) => {
                    const label = k === "video" ? t.backdropVideo : t.backdropImage;
                    return (
                      <button
                        key={k}
                        type="button"
                        role="radio"
                        aria-checked={backdropKind === k}
                        aria-label={label}
                        data-tip={label}
                        className={`shape-toggle${backdropKind === k ? " shape-toggle--on" : ""}`}
                        onClick={() => setBackdropKind(k)}
                      >
                        <Icon name={k === "video" ? "film" : "image"} size={16} />
                      </button>
                    );
                  })}
                </div>
              </dd>
            </div>
          )}

          <div className={liteOn ? "row--disabled" : undefined}>
            <dt>
              <Icon name="display" size={15} />
              {t.glassBlur}
            </dt>
            <dd className="dd-row">
              <GlassToggle />
              <span className="info-tip" tabIndex={liteOn ? -1 : 0} aria-hidden={liteOn || undefined} aria-label={t.aboutGlass}>
                <Icon name="info" size={17} />
                <span className="info-tip-bubble" role="tooltip">
                  {t.glassTip}
                </span>
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
              <span className="info-tip" tabIndex={0} aria-label={t.aboutLite}>
                <Icon name="info" size={17} />
                <span className="info-tip-bubble" role="tooltip">
                  {t.liteTip}
                </span>
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
              <span className="info-tip" tabIndex={0} aria-label={t.aboutAutoHide}>
                <Icon name="info" size={17} />
                <span className="info-tip-bubble" role="tooltip">
                  {t.autoHideTip}
                </span>
              </span>
            </dd>
          </div>

          <div className="glance-row--dock">
            <dt>
              <Icon name="target" size={15} />
              {t.huBarPosition}
            </dt>
            <dd className="dd-row">
              <DockControl />
            </dd>
          </div>

          <div className="glance-row--shape">
            <dt>
              <Icon name="star4" size={15} />
              {t.huBarShape}
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

          <div className="theme-menu-section">
            <h3 className="h-with-icon theme-menu-heading">
              <Icon name="spark" size={15} />
              {t.gradientBg}
              <span className="info-tip" tabIndex={0} aria-label={bgT.aboutBackground}>
                <Icon name="info" size={17} />
                <span className="info-tip-bubble" role="tooltip">
                  {bgT.backgroundTip} {bgT.motionTip}
                </span>
              </span>
            </h3>
            <div className="theme-menu-options">
              <div className="theme-menu-option">
                <span className="theme-menu-option-name">{bgT.onOff}</span>
                <AccentBgToggle />
              </div>
              <div className="theme-menu-option">
                <span className="theme-menu-option-name">{bgT.tone}</span>
                <AccentBgMixControl disabled={!accentBgOn} />
              </div>
              <div className="theme-menu-option">
                <span className="theme-menu-option-name">{bgT.drifting}</span>
                <AccentBgMotionToggle disabled={!accentBgOn} />
              </div>
            </div>
          </div>

          <div className="theme-menu-section theme-menu-section--logo">
            <h3 className="h-with-icon theme-menu-heading">
              <Icon name="image" size={15} />
              {t.logo}
            </h3>
            <LogoSwitch />
          </div>

          <button
            type="button"
            className="text-btn text-btn--center theme-menu-back-mobile"
            onClick={() => setThemeMenuOpen(false)}
          >
            <Icon name="chevronLeft" size={14} />
            {t.back}
          </button>
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
