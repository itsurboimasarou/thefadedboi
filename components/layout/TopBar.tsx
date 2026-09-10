import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import StackLink from "./StackLink";
import StatusClock from "../widgets/StatusClock";
import NowPlaying from "../widgets/NowPlaying";
import LangSwitch from "../controls/LangSwitch";
import { siteName } from "@/lib/configs/site.config";
import { home as homeConfig, homeStatus } from "@/lib/configs/home.config";
import { useLocalized } from "@/lib/i18n";
import { useCompact } from "@/lib/functions/useHuBarFit";

export default function TopBar() {
  const home = useLocalized(homeConfig);
  const compact = useCompact();
  const { pathname } = useRouter();
  const [solid, setSolid] = useState(false);

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
      <StackLink href="/" className="logo-corner" aria-label={siteName}>
        <span className="logo-mark" role="img" aria-label={siteName} />
      </StackLink>
      
      <div className="topbar-actions">
        {!compact && <NowPlaying />}
        <StatusClock config={{ ...homeStatus, labels: home.statusLabels }} />
        {!compact && <LangSwitch />}
      </div>
    </header>
  );
}
