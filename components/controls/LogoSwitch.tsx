import { useEffect, useState } from "react";

const EVT = "logo-change";
const KEY = "logo-custom";

export function getLogo(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setLogo(file: string | null) {
  if (!file) {
    document.documentElement.style.removeProperty("--logo-custom");
    try { localStorage.removeItem(KEY); } catch {}
  } else {
    document.documentElement.style.setProperty("--logo-custom", `url(/logo/${file})`);
    try { localStorage.setItem(KEY, file); } catch {}
  }
  window.dispatchEvent(new CustomEvent(EVT, { detail: file }));
}

export function useLogo() {
  const [logo, setLogoState] = useState<string | null>(null);
  useEffect(() => {
    setLogoState(getLogo());
    const h = (e: Event) => setLogoState((e as CustomEvent<string | null>).detail);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);
  return logo;
}

function nameOf(file: string) {
  return file.replace(/\.[^.]+$/, "");
}

export default function LogoSwitch() {
  const active = useLogo();
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/logos")
      .then((r) => r.json())
      .then((list: string[]) => setFiles(list))
      .catch(() => setFiles([]));
  }, []);

  return (
    <div className="logo-grid" role="group" aria-label="Logo">
      <button
        type="button"
        className={`logo-option${!active ? " logo-option--on" : ""}`}
        aria-pressed={!active}
        onClick={() => setLogo(null)}
      >
        <span className="logo-option-swatch logo-option-swatch--default" aria-hidden="true" />
        <span>Default</span>
      </button>
      {files.map((f) => (
        <button
          key={f}
          type="button"
          className={`logo-option${active === f ? " logo-option--on" : ""}`}
          aria-pressed={active === f}
          onClick={() => setLogo(f)}
        >
          <img src={`/logo/${f}`} alt="" className="logo-option-swatch" />
          <span>{nameOf(f)}</span>
        </button>
      ))}
      {files.length === 0 && (
        <p className="logo-grid-empty">Drop images into /public/logo to see them here.</p>
      )}
    </div>
  );
}
