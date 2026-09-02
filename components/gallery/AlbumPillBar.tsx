import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import YearSelect from "./YearSelect";
import useHideOnScrollDown from "@/lib/functions/useHideOnScrollDown";
import useHorizontalScroller from "@/lib/functions/useHorizontalScroller";

/* The bar lives at the bottom now, full stop: the top of the gallery belongs
   to the Still/Motion switch, so there is nothing left to move it to and the
   position toggle went with it. The hide-on-scroll behaviour it had is
   unchanged, and the switch shares it. */

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
  const hidden = useHideOnScrollDown();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { ref: chipScrollRef, overflow } = useHorizontalScroller([chips]);

  const bar = (
    <div className={`gallery-pillbar${hidden ? " gallery-pillbar--hidden" : ""}`}>
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
          direction="up"
        />
      )}
    </div>
  );

  if (!mounted) return null;
  return createPortal(bar, document.body);
}
