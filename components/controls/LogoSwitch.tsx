import { useEffect, useState } from "react";
import { useLocalized } from "@/lib/i18n";
import { logoUi as ui } from "@/lib/ui-strings";
import { createSetting } from "@/lib/setting";

const EVT = "logo-change";
const KEY = "logo-custom";

const logoSetting = createSetting<string | null>({
  key: KEY,
  event: EVT,
  fallback: null,
  parse: (raw) => raw,
  serialize: (file) => file,
  apply: (file) => {
    const s = document.documentElement.style;
    if (file) s.setProperty("--logo-custom", `url(/logos/${file})`);
    else s.removeProperty("--logo-custom");
  },
});

export const getLogo = logoSetting.get;
export const setLogo = logoSetting.set;
export const useLogo = logoSetting.use;

function nameOf(file: string) {
  return file.replace(/\.[^.]+$/, "");
}

export default function LogoSwitch() {
  const t = useLocalized(ui);
  const active = useLogo();
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/logos")
      .then((r) => r.json())
      .then((list: string[]) => setFiles(list))
      .catch(() => setFiles([]));
  }, []);

  return (
    <div className="logo-grid" role="group" aria-label={t.logo}>
      <button
        type="button"
        className={`logo-option${!active ? " logo-option--on" : ""}`}
        aria-pressed={!active}
        onClick={() => setLogo(null)}
      >
        <span className="logo-option-swatch logo-option-swatch--default" aria-hidden="true" />
        <span>{t.default}</span>
      </button>
      {files.map((f) => (
        <button
          key={f}
          type="button"
          className={`logo-option${active === f ? " logo-option--on" : ""}`}
          aria-pressed={active === f}
          onClick={() => setLogo(f)}
        >
          <img src={`/logos/${f}`} alt="" className="logo-option-swatch" />
          <span>{nameOf(f)}</span>
        </button>
      ))}
      {files.length === 0 && (
        <p className="logo-grid-empty">{t.noLogos}</p>
      )}
    </div>
  );
}
