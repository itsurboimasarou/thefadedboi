import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../ui/Icons";
import YearSelect from "./YearSelect";
import { useLocalized, type Localized } from "@/lib/i18n";
import { createSetting } from "@/lib/setting";

export type BarPos = "top" | "bottom";

const barPos = createSetting<BarPos>({
  key: "gallery-bar-pos",
  event: "gallery-bar-pos-change",
  fallback: "top",
  parse: (raw) => (raw === "bottom" ? "bottom" : "top"),
});

export const getBarPos = barPos.get;
export const setBarPos = barPos.set;
export const useBarPos = barPos.use;

function useHideOnScrollDown() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < 80) setHidden(false);
      else if (delta > 8) setHidden(true);
      else if (delta < -8) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

function useChipOverflow(deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ left: false, right: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 1) {
        setOverflow({ left: false, right: false });
        return;
      }
      setOverflow({
        left: el.scrollLeft > 1,
        right: max - el.scrollLeft > 1,
      });
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, deps);

  return { ref, overflow };
}

const ui: Localized<{ togglePosition: string }> = {
  en: { togglePosition: "Move bar" },
  vi: { togglePosition: "Chuyển vị trí thanh" },
};

export interface AlbumChip { key: string; label: string; count: number }

interface AlbumPillBarProps {
  chips: AlbumChip[];
  active: string;
  onSelect: (key: string) => void;
  years: number[];
  year: number | undefined;
  onYearChange: (y: number | undefined) => void;
}

export default function AlbumPillBar({
  chips,
  active,
  onSelect,
  years,
  year,
  onYearChange,
}: AlbumPillBarProps) {
  const t = useLocalized(ui);
  const pos = useBarPos();
  const hidden = useHideOnScrollDown();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { ref: chipScrollRef, overflow } = useChipOverflow([chips]);

  const bar = (
    <div
      className={`gallery-pillbar gallery-pillbar--${pos}${hidden ? " gallery-pillbar--hidden" : ""}`}
    >
      <div
        className="gallery-pillbar-scroll"
        ref={chipScrollRef}
        data-fade-left={overflow.left || undefined}
        data-fade-right={overflow.right || undefined}
      >
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`gallery-pill${active === c.key ? " gallery-pill--on" : ""}`}
            aria-pressed={active === c.key}
            onClick={() => onSelect(c.key)}
          >
            {c.label}
            <span className="gallery-pill-count">{c.count}</span>
          </button>
        ))}
      </div>
      {years.length > 0 && (
        <YearSelect
          years={years}
          value={year}
          onChange={onYearChange}
          allowAll
          direction={pos === "bottom" ? "up" : "down"}
        />
      )}
      <button
        type="button"
        className="gallery-pillbar-toggle"
        onClick={() => setBarPos(pos === "top" ? "bottom" : "top")}
        aria-label={t.togglePosition}
        title={t.togglePosition}
      >
        <Icon name={pos === "top" ? "dockBottom" : "dockTop"} size={16} />
      </button>
    </div>
  );

  if (pos === "top") return bar;
  if (!mounted) return null;
  return createPortal(bar, document.body);
}
