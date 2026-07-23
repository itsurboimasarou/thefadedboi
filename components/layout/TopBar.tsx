import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "../controls/ThemeToggle";

export default function TopBar() {
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
  }, []);

  return (
    <header className={`topbar${solid ? " topbar--solid" : ""}`}>
      <Link href="/" className="logo-corner" aria-label="Home">
        <img src="/logo.png" alt="Logo" />
      </Link>
      <ThemeToggle />
    </header>
  );
}
