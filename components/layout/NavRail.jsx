import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const icons = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" />
    </svg>
  ),
  person: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.6" /><path d="M4.5 20.5c1.4-3.6 4.1-5.4 7.5-5.4s6.1 1.8 7.5 5.4" />
    </svg>
  ),
  contacts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" />
    </svg>
  ),
  portfolio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="3" /><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7" /><path d="M3 12.5h18" />
    </svg>
  ),
  gallery: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="1.8" /><path d="m5 19 5.2-5.2a1.5 1.5 0 0 1 2.1 0L19 20" />
    </svg>
  ),
  devices: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8" /><path d="M12 16v4" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 4h6l-1 6 3 3v2H7v-2l3-3-1-6Z" /><path d="M12 15v6" />
    </svg>
  ),
  dockBottom: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 15h18" /><rect x="7" y="17" width="10" height="2" rx="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  dockLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 3v18" /><rect x="5" y="7" width="2" height="10" rx="1" fill="currentColor" stroke="none" />
    </svg>
  ),
};

const items = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/about", label: "Details", icon: "person" },
  { href: "/contacts", label: "Contacts", icon: "contacts" },
  { href: "/portfolio", label: "Portfolio", icon: "portfolio" },
  { href: "/gallery", label: "Gallery", icon: "gallery" },
  { href: "/devices", label: "Devices & Equipment", icon: "devices" },
];

export default function NavRail() {
  const { pathname } = useRouter();
  const [dock, setDock] = useState("left");
  const [hidden, setHidden] = useState(false);
  const [pinned, setPinned] = useState(true);
  const [touchMode, setTouchMode] = useState(false);
  const timer = useRef(null);
  const hiddenRef = useRef(hidden);
  const pinnedRef = useRef(false);

  const isCompact = () => window.matchMedia("(max-width: 720px), (max-height: 600px)").matches;

  const togglePin = () => {
    const next = !pinned;
    setPinned(next);
    try { localStorage.setItem("nav-pinned", next ? "1" : "0"); } catch { }
    if (next) { clearTimeout(timer.current); setHidden(false); }
    else arm();
  };

  const arm = (delay = 600) => {
    clearTimeout(timer.current);
    if (pinnedRef.current || isCompact()) return;
    timer.current = setTimeout(() => setHidden(true), delay);
  };

  const summon = () => {
    clearTimeout(timer.current);
    setHidden(false);
  };

  const pin = () => {
    summon();
  };

  const reveal = () => {
    setHidden(false);
    arm();
  };

  const setDockAndSave = (d) => {
    setDock(d);
    try { localStorage.setItem("nav-dock", d); } catch { }
  };

  useEffect(() => { pinnedRef.current = pinned; }, [pinned]);

  useEffect(() => { hiddenRef.current = hidden; }, [hidden]);

  useEffect(() => {
    try { setDock(localStorage.getItem("nav-dock") || "left"); } catch { }
  }, []);

  useEffect(() => {
    try {
      setDock(localStorage.getItem("nav-dock") || "left");
      setPinned(localStorage.getItem("nav-pinned") === "0");
    } catch { }
  }, []);

  useEffect(() => {
    setTouchMode(window.matchMedia("(pointer: coarse)").matches);
  }, []);


  useEffect(() => {
    if (!touchMode) return;
    let start = null;

    const onStart = (e) => {
      const t = e.touches[0];
      const nearEdge = dock === "left" ? t.clientX < 24
        : t.clientY > window.innerHeight - 24;
      start = nearEdge ? { x: t.clientX, y: t.clientY } : null;
    };
    const onMove = (e) => {
      if (!start) return;
      const t = e.touches[0];
      const inward = dock === "left" ? t.clientX - start.x : start.y - t.clientY;
      if (inward > 30) {
        summon();
        start = null;
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
    };
  }, [touchMode, dock]);

  useEffect(() => {
    if (!touchMode) return;
    const onTap = (e) => {
      if (e.target.closest(".nav-rail")) return;
      if (hiddenRef.current) return;
      arm(600);
    };
    document.addEventListener("touchstart", onTap, { passive: true });
    return () => document.removeEventListener("touchstart", onTap);
  }, [touchMode]);

  useEffect(() => { if (!touchMode) arm(3000); }, [touchMode]);

  return (
    <>
      {!touchMode && <div
        className={`nav-hotzone nav-hotzone--${dock}`}
        onMouseEnter={reveal}
        aria-hidden="true"
      />}
      <nav
        className={`nav-rail nav-rail--${dock}${hidden ? " nav-rail--hidden" : ""}${pinned ? " nav-rail--pinned" : ""}`}
        aria-label="Primary"
        onMouseEnter={pin}
        onMouseLeave={() => arm()}
        onFocus={pin}
        onBlur={() => arm()}
        onTouchStart={(e) => {
          if (hidden) {
            e.preventDefault();
            summon();
          }
        }}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="nav-item"
            aria-current={pathname === item.href ? "page" : undefined}
            aria-label={item.label}
          >
            {icons[item.icon]}
            <span className="tip">{item.label}</span>
          </Link>
        ))}
        <span className="nav-divider" aria-hidden="true" />
        <button
          type="button"
          className="nav-item nav-dock-btn"
          onClick={() => setDockAndSave(dock === "left" ? "bottom" : "left")}
          aria-label={dock === "left" ? "Move navigation to bottom" : "Move navigation to left"}
        >
          {dock === "left" ? icons.dockBottom : icons.dockLeft}
          <span className="tip">{dock === "left" ? "Dock to bottom" : "Dock to left"}</span>
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={pinned}
          className={`nav-item nav-pin-btn${pinned ? " nav-pin-btn--on" : ""}`}
          onClick={togglePin}
          aria-label={pinned ? "Unpin navigation (enable auto-hide)" : "Pin navigation (disable auto-hide)"}
        >
          {icons.pin}
          <span className="tip">{pinned ? "Unpin — auto-hide" : "Pin — always show"}</span>
        </button>
      </nav>
    </>
  );
}
