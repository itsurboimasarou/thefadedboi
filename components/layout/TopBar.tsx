import Link from "next/link";
import { useEffect, useState } from "react";
import BerlinClock from "../widgets/BerlinClock";
import { useLiveStatus, StatusPill } from "../widgets/LiveStatus";
import Icon from "../ui/Icons";
import { openChangelog } from "./ControlPanel";
import { site } from "@/lib/site.config"
import { home } from "@/lib/home.config";

export default function TopBar() {
  const [solid, setSolid] = useState(false);
  const status = useLiveStatus(home.status);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setSolid(window.scrollY > 12);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`topbar${solid ? " topbar--solid" : ""}`}>
      <Link href="/" className="logo-corner" aria-label="Home">
        <span className="logo-mark" role="img" aria-label={site.name} />
      </Link>
      <div className="topbar-actions">
        <StatusPill
          state={status}
          labels={home.status.labels}
          onClick={openChangelog}
        />
        <span className="status-pill time-pill">
          <Icon name="clock" size={14} />
          <BerlinClock />
        </span>
      </div>
    </header>
  );
}
