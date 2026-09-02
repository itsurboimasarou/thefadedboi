import { useEffect } from "react";

const MARGIN = 8;
const CENTRED = ["up", "down", ""];

function edges(el: HTMLElement): [number, number] | null {
  const tip = el.querySelector<HTMLElement>(":scope > .tip, :scope > .tip--up");
  if (tip) {
    if (getComputedStyle(tip).display === "none") return null;
    const r = tip.getBoundingClientRect();
    return r.width ? [r.left, r.right] : null;
  }
  if (!el.hasAttribute("data-tip")) return null;
  if (!CENTRED.includes(el.getAttribute("data-tip-pos") ?? "")) return null;
  const cs = getComputedStyle(el, "::after");
  if (cs.display === "none") return null;
  const w = parseFloat(cs.width);
  if (!w) return null;
  const b = el.getBoundingClientRect();
  const centre = b.left + b.width / 2;
  return [centre - w / 2, centre + w / 2];
}

function fit(el: HTMLElement) {
  el.style.removeProperty("--tip-shift");
  const box = edges(el);
  if (!box) return;
  const [left, right] = box;
  const shift = right > window.innerWidth - MARGIN
    ? window.innerWidth - MARGIN - right
    : left < MARGIN ? MARGIN - left : 0;
  if (shift) el.style.setProperty("--tip-shift", `${Math.round(shift)}px`);
}

export default function useTipFit() {
  useEffect(() => {
    const target = (e: Event) => (e.target as Element | null)?.closest?.<HTMLElement>("[data-tip], :has(> .tip), :has(> .tip--up)");
    const enter = (e: Event) => { const el = target(e); if (el) fit(el); };
    const leave = (e: Event) => { const el = target(e); if (el) el.style.removeProperty("--tip-shift"); };

    document.addEventListener("pointerover", enter);
    document.addEventListener("pointerout", leave);
    document.addEventListener("focusin", enter);
    document.addEventListener("focusout", leave);
    return () => {
      document.removeEventListener("pointerover", enter);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("focusin", enter);
      document.removeEventListener("focusout", leave);
    };
  }, []);
}
