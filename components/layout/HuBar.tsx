import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Icon from "../ui/Icons";
import StatusClock from "../widgets/StatusClock";
import NowPlaying from "../widgets/NowPlaying";
import LangSwitch from "../controls/LangSwitch";
import { useDock } from "../controls/HuBarDock";
import { usePinned } from "../controls/HuBarPinned";
import { useShape } from "../controls/HuBarShape";
import HuBarTrigger from "./HuBarTrigger";
import useHuBarMeasure from "./functions/useHuBarMeasure";
import useHuBarAutoHide from "./functions/useHuBarAutoHide";
import { useCompact, useHuBarFit } from "./functions/useHuBarFit";
import useHuBarIndicator from "./functions/useHuBarIndicator";
import { home as homeConfig, homeStatus } from "@/lib/configs/home.config";
import { navItems } from "@/lib/configs/nav.config";
import { useStackNavigate } from "./PageStackTransition";
import { useLocalized } from "@/lib/i18n";
import { useLang } from "../controls/LangSwitch";

const items = navItems;

export default function HuBar() {
  const home = useLocalized(homeConfig);
  const lang = useLang();
  const { pathname } = useRouter();
  const dock = useDock();
  const pinned = usePinned();
  const shape = useShape();
  const compact = useCompact();
  const stackNavigate = useStackNavigate();
  const effectiveDock = compact ? (dock === "bottom" ? "bottom" : "top") : dock;

  const vertical = effectiveDock === "left" || effectiveDock === "right";

  const railRef = useRef<HTMLElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const indicator = useHuBarIndicator(startRef, pathname, vertical);
  useHuBarMeasure(railRef);
  useHuBarFit(railRef);
  const { hidden, touchMode, railHandlers, hotzoneHandlers } = useHuBarAutoHide(railRef, effectiveDock, pinned);

  const [panelOpen, setPanelOpen] = useState(false);
  useEffect(() => {
    const h = (e: Event) => setPanelOpen((e as CustomEvent<boolean>).detail);
    window.addEventListener("control-panel-state", h);
    return () => window.removeEventListener("control-panel-state", h);
  }, []);

  const className = [
    "hubar",
    `hubar--${effectiveDock}`,
    `hubar--${shape}`,
    hidden && "hubar--hidden",
    pinned && "hubar--pinned",
  ].filter(Boolean).join(" ");

  return (
    <>
      {!touchMode && (
        <div
          className={`hubar-hotzone hubar-hotzone--${effectiveDock}`}
          aria-hidden="true"
          {...hotzoneHandlers}
        />
      )}
      <nav ref={railRef} className={className} aria-label="Primary" {...railHandlers}>
        <div className="hubar-group hubar-group--start" ref={startRef}>
          <HuBarTrigger open={panelOpen} />
          <span className="hubar-divider" aria-hidden="true" />
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hubar-item"
              aria-current={pathname === item.href ? "page" : undefined}
              aria-label={item.label[lang]}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                stackNavigate(item.href);
              }}
            >
              <Icon name={item.icon} size={22} />
              <span className="tip">{item.label[lang]}</span>
            </Link>
          ))}
          <span
            className={[
              "hubar-indicator",
              indicator && "hubar-indicator--on",
              indicator?.jump && "hubar-indicator--instant",
            ].filter(Boolean).join(" ")}
            aria-hidden="true"
            style={indicator ? ({
              "--ind-center": `${indicator.center}px`,
              "--ind-size": `${indicator.size}px`,
            } as CSSProperties) : undefined}
          />
        </div>
        <div className="hubar-group hubar-group--end">
          <NowPlaying />
          <StatusClock config={{ ...homeStatus, labels: home.statusLabels }} />
          <LangSwitch />
        </div>
      </nav>
    </>
  );
}
