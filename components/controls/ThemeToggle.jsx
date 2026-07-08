import { useEffect, useState } from "react";

const sun = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4.6" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5 5l1.6 1.6M17.4 17.4 19 19M19 5l-1.6 1.6M6.6 17.4 5 19" />
  </svg>
);

const moon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
  </svg>
);

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || "dark");
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "light"}
      aria-label="Toggle light mode"
      className="theme-switch"
      onClick={toggle}
    >
      <span className="track-icon track-icon--moon">{moon}</span>
      <span className="track-icon track-icon--sun">{sun}</span>
      <span className="knob">{theme === "light" ? sun : moon}</span>
    </button>
  );
}
