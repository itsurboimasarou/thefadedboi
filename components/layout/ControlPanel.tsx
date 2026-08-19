import { useEffect, useRef, useState } from "react";
import Icon from "../ui/Icons";
import ThemeToggle from "../controls/ThemeToggle";
import LiteModeToggle, { useLiteMode } from "../controls/LiteMode";
import SnowToggle from "../controls/SnowMode";
import GlassToggle from "../controls/GlassMode";
import ChangelogDialog from "../content/ChangelogDialog";

export const PANEL_EVT = "control-panel-toggle";
export const CHANGELOG_EVT = "changelog-open";

export function openChangelog() {
  window.dispatchEvent(new CustomEvent(CHANGELOG_EVT));
}

export function toggleControlPanel() {
  window.dispatchEvent(new CustomEvent(PANEL_EVT));
}

export default function ControlPanel({ changelog }: { changelog: string }) {
  const [open, setOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const liteOn = useLiteMode();
  const panelRef = useRef<HTMLDivElement>(null);

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
      if ((t as Element).closest?.(".nav-panel-btn")) return;
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
        <h2 className="h-with-icon panel-title">
          <Icon name="spark" size={18} />
          At a glance
        </h2>

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
              <span className="info-tip" tabIndex={0} aria-label="About glass effect">
                <Icon name="info" size={17} />
                <span className="info-tip-bubble" role="tooltip">
                  Frosted blur behind the top bar and nav pill. Costs GPU when
                  anything animates behind them.
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

        </dl>
      </div>

      <ChangelogDialog
        open={logOpen}
        onClose={() => setLogOpen(false)}
        changelog={changelog}
      />
    </>
  );
}
