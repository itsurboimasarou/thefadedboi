import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function TopBar() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
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
