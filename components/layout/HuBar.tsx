import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Icon from "../ui/Icons";
import StatusClock from "../widgets/StatusClock";
import NowPlaying from "../widgets/NowPlaying";
import LangSwitch from "../controls/LangSwitch";
import { useDock } from "../controls/HuBarDock";
import { usePinned } from "../controls/HuBarPinned";
import HuBarTrigger from "./HuBarTrigger";
import useHuBarMeasure from "./functions/useHuBarMeasure";
import useHuBarAutoHide, { useCompact } from "./functions/useHuBarAutoHide";
import { home } from "@/lib/home.config";

interface NavItem { href: string; label: string; icon: string }
const items: NavItem[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/about", label: "Details", icon: "user" },
  { href: "/contacts", label: "Contacts", icon: "contacts" },
  { href: "/portfolio", label: "Portfolio", icon: "portfolio" },
  { href: "/gallery", label: "Gallery", icon: "image" },
  { href: "/devices", label: "Devices & Equipment", icon: "devices" },
];

export default function HuBar() {
  const { pathname } = useRouter();
  const dock = useDock();
  const pinned = usePinned();
  const compact = useCompact();
  const effectiveDock = compact ? (dock === "bottom" ? "bottom" : "top") : dock;

  const railRef = useRef<HTMLElement>(null);
  useHuBarMeasure(railRef);
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
        <div className="hubar-group hubar-group--start">
          <HuBarTrigger open={panelOpen} />
          <span className="hubar-divider" aria-hidden="true" />
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hubar-item"
              aria-current={pathname === item.href ? "page" : undefined}
              aria-label={item.label}
            >
              <Icon name={item.icon} size={22} />
              <span className="tip">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="hubar-group hubar-group--end">
          <NowPlaying />
          <StatusClock config={home.status} />
          <LangSwitch />
        </div>
      </nav>
    </>
  );
}
