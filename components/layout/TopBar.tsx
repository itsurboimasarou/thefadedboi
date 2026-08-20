import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import StatusClock from "../widgets/StatusClock";
import { openChangelog } from "./ControlPanel";
import { site } from "@/lib/site.config"
import { home } from "@/lib/home.config";

export default function TopBar() {
  const [solid, setSolid] = useState(false);
  const { pathname } = useRouter();

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
  }, [pathname]);

  return (
    <header className={`topbar${solid ? " topbar--solid" : ""}`}>
      <Link href="/" className="logo-corner" aria-label="Home">
        <span className="logo-mark" role="img" aria-label={site.name} />
      </Link>
      <div className="topbar-actions">
        <StatusClock config={home.status} onClick={openChangelog} />
      </div>
    </header>
  );
}
