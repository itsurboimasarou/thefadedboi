import { useEffect, useState } from "react";

const EVT = "lang-change";

export type Lang = "en" | "vi";

export function getLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    return localStorage.getItem("lang") === "vi" ? "vi" : "en";
  } catch {
    return "en";
  }
}

export function setLang(lang: Lang) {
  try { localStorage.setItem("lang", lang); } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: lang }));
}

export function useLang() {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    setLangState(getLang());
    const h = (e: Event) => setLangState((e as CustomEvent<Lang>).detail);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);
  return lang;
}

export default function LangSwitch() {
  const lang = useLang();
  const checked = lang === "vi";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Language"
      className="theme-switch lang-switch"
      onClick={() => setLang(checked ? "en" : "vi")}
    >
      <span className="knob" aria-hidden="true" />
      <span className="track-icon track-icon--left" aria-hidden="true">EN</span>
      <span className="track-icon track-icon--right" aria-hidden="true">VI</span>
    </button>
  );
}
