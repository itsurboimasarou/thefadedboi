import { useEffect, useState } from "react";
import { setLiteMode } from "./LiteMode";
import LangSwitch from "./LangSwitch";
import { useLocalized } from "@/lib/i18n";
import { noticeUi as ui } from "@/lib/ui-strings";

const KEY = "important-notice-seen";

export default function ImportantNotice() {
  const t = useLocalized(ui);
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const osReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!localStorage.getItem(KEY) && !osReduced) setShow(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  const choose = (reduce: boolean) => {
    setLiteMode(reduce);
    try { localStorage.setItem(KEY, "1"); } catch {}
    setShow(false);
    window.dispatchEvent(new Event("lite-mode-changed"));
  };

  if (!show) return null;

  return (
    <div className="notice-backdrop">
      <div
        className="glass important-notice"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="important-notice-title"
      >
        <div className="important-notice-head">
          <h2 id="important-notice-title" className="important-notice-title">
            {t.title}
          </h2>
          <LangSwitch />
        </div>

        <section className="notice-section">
          <h3 className="notice-section-heading">{t.motionHeading}</h3>
          <p>{t.motionBody}</p>
          <div className="notice-actions">
            <button type="button" className="btn btn--small" onClick={() => choose(false)}>
              {t.keepDefault}
            </button>
            <button type="button" className="btn btn--small btn--ghost" onClick={() => choose(true)}>
              {t.useLite}
            </button>
          </div>
        </section>

        <section className="notice-section">
          <h3 className="notice-section-heading">{t.blockerHeading}</h3>
          <p>{t.blockerBody}</p>
        </section>

        <p className="notice-footnote">{t.once}</p>
      </div>
    </div>
  );
}
