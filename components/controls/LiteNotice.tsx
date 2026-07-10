import { useEffect, useState } from "react";
import { setLiteMode } from "./LiteMode";

export default function LiteNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const osReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!localStorage.getItem("lite-notice-seen") && !osReduced) setShow(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  const choose = (reduce: boolean) => {
    setLiteMode(reduce);
    try { localStorage.setItem("lite-notice-seen", "1"); } catch {}
    setShow(false);
    window.dispatchEvent(new Event("lite-mode-changed"));
  };

  if (!show) return null;

  return (
    <div className="notice-backdrop">
      <div
        className="glass lite-notice"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="lite-notice-title"
      >
        <h2 id="lite-notice-title" style={{ fontSize: "1.15rem" }}>
          Important Notice
        </h2>
        <p>
          This site uses background animations & blurs. If you&apos;re on an older browser
          or a weak device, you can turn them off — you can change this anytime
          from the switch on the "At a glance" box at Home page. <br /> 
          This is a one time message, and you can always change your choice later.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button className="btn btn--small" onClick={() => choose(false)}>Keep default</button>
          <button className="btn btn--small btn--ghost" onClick={() => choose(true)}>Switch to Lite mode</button>
        </div>
      </div>
    </div>
  );
}