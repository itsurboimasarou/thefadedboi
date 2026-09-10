import { useRouter } from "next/router";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Icon from "../ui/Icons";
import { useDock } from "../controls/HuBarDock";
import { usePinned } from "../controls/HuBarPinned";
import { useShape } from "../controls/HuBarShape";
import HuBarTrigger from "./HuBarTrigger";
import useHuBarMeasure from "@/lib/functions/useHuBarMeasure";
import useHuBarAutoHide from "@/lib/functions/useHuBarAutoHide";
import { isCompact, useCompact, useHuBarFit } from "@/lib/functions/useHuBarFit";
import useHuBarIndicator from "@/lib/functions/useHuBarIndicator";
import { navItems as items } from "@/lib/configs/nav.config";
import StackLink from "./StackLink";
import { useLang } from "../controls/LangSwitch";

export default function NavPill() {
  const lang = useLang();
  const { pathname } = useRouter();
  const dock = useDock();
  const pinned = usePinned();
  const shape = useShape();
  const compact = useCompact();
  const effectiveDock = compact ? "bottom" : dock === "top" ? "bottom" : dock;
  const vertical = effectiveDock === "left" || effectiveDock === "right";

  const railRef = useRef<HTMLElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const indicator = useHuBarIndicator(startRef, pathname, vertical);
  useHuBarMeasure(railRef);
  useHuBarFit(railRef);
  const { hidden, touchMode, railHandlers, hotzoneHandlers } = useHuBarAutoHide(
    railRef,
    effectiveDock,
    pinned
  );

  const [panelOpen, setPanelOpen] = useState(false);
  useEffect(() => {

    const h = (e: Event) => {
      const view = (e as CustomEvent<string>).detail;
      setPanelOpen(isCompact() ? view !== "none" : view === "controls");
    };
    window.addEventListener("control-panel-state", h);
    return () => window.removeEventListener("control-panel-state", h);
  }, []);

  const className = [
    "hubar",
    "hubar--navpill",
    `hubar--${effectiveDock}`,
    `hubar--${shape}`,
    hidden && "hubar--hidden",
    pinned && "hubar--pinned",
  ]
    .filter(Boolean)
    .join(" ");

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
          {items.map((item) => (
            <StackLink
              key={item.href}
              href={item.href}
              className="hubar-item"
              aria-current={pathname === item.href ? "page" : undefined}
              aria-label={item.label[lang]}
            >
              <Icon name={item.icon} size={22} />
              <span className="tip">{item.label[lang]}</span>
            </StackLink>
          ))}
          <span className="hubar-divider" aria-hidden="true" />
          <HuBarTrigger open={panelOpen} icon="chevron" />
          <span
            className={[
              "hubar-indicator",
              indicator && "hubar-indicator--on",
              indicator?.jump && "hubar-indicator--instant",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden="true"
            style={
              indicator
                ? ({
                    "--ind-center": `${indicator.center}px`,
                    "--ind-size": `${indicator.size}px`,
                  } as CSSProperties)
                : undefined
            }
          />
        </div>
      </nav>
    </>
  );
}
