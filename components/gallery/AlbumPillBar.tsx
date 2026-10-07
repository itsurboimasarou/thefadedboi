import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import YearSelect from "./YearSelect";
import ListBySelect, { type ListBy } from "./ListBySelect";
import GalleryFilterMenu from "./GalleryFilterMenu";
import { useCompact } from "@/lib/functions/useHuBarFit";
import useHideOnScrollDown from "@/lib/functions/useHideOnScrollDown";
import useHorizontalScroller from "@/lib/functions/useHorizontalScroller";

export interface AlbumChip { key: string; label: string; count: number }

interface AlbumPillBarProps {
  chips: AlbumChip[];
  active: string;
  onSelect: (key: string) => void;
  years: number[];
  year: number | undefined;
  onYearChange: (y: number | undefined) => void;
  listBy: ListBy;
  onListByChange: (v: ListBy) => void;
}

export default function AlbumPillBar({
  chips,
  active,
  onSelect,
  years,
  year,
  onYearChange,
  listBy,
  onListByChange,
}: AlbumPillBarProps) {
  const scrolledAway = useHideOnScrollDown();
  const compact = useCompact();
  const [panelOpen, setPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onPanel = (e: Event) => setPanelOpen((e as CustomEvent<string>).detail !== "none");
    window.addEventListener("control-panel-state", onPanel);
    return () => window.removeEventListener("control-panel-state", onPanel);
  }, []);
  const hidden = scrolledAway || (panelOpen && compact);
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
      {compact ? (
        <GalleryFilterMenu
          listBy={listBy}
          onListByChange={onListByChange}
          years={years}
          year={year}
          onYearChange={onYearChange}
        />
      ) : (
        <>
          <ListBySelect value={listBy} onChange={onListByChange} direction="up" />
          {years.length > 0 && (
            <YearSelect
              years={years}
              value={year}
              onChange={onYearChange}
              allowAll
              direction="up"
            />
          )}
        </>
      )}
    </div>
  );

  if (!mounted) return null;
  return createPortal(bar, document.body);
}
