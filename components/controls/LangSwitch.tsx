import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createSetting } from "@/lib/setting";

export type Lang = "en" | "vi";

const langSetting = createSetting<Lang>({
  key: "lang",
  event: "lang-change",
  fallback: "en",
  parse: (raw) => (raw === "vi" ? "vi" : "en"),
});

export const getLang = langSetting.get;
export const setLang = langSetting.set;

const LangCtx = createContext<Lang>("en");

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(getLang());
    return langSetting.subscribe(() => setLangState(getLang()));
  }, []);

  return <LangCtx.Provider value={lang}>{children}</LangCtx.Provider>;
}

export function useLang(): Lang {
  return useContext(LangCtx);
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
