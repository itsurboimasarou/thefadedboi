import { useEffect, useRef, useState } from "react";
import Icon from "../ui/Icons";
import type { ListBy } from "./ListBySelect";
import { useLocalized } from "@/lib/i18n";
import { galleryFilterUi as ui, listBySelectUi, yearSelectUi } from "@/lib/ui-strings";

const LIST_BY: ListBy[] = ["album", "device"];

interface GalleryFilterMenuProps {
  listBy: ListBy;
  onListByChange: (v: ListBy) => void;
  years: number[];
  year: number | undefined;
  onYearChange: (y: number | undefined) => void;
}

export default function GalleryFilterMenu({
  listBy,
  onListByChange,
  years,
  year,
  onYearChange,
}: GalleryFilterMenuProps) {
  const t = useLocalized(ui);
  const tList = useLocalized(listBySelectUi);
  const tYear = useLocalized(yearSelectUi);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = listBy !== "album" || year !== undefined;

  const option = (key: string, label: string | number, on: boolean, pick: () => void) => (
    <li key={key}>
      <button
        type="button"
        role="menuitemradio"
        aria-checked={on}
        className={`year-option${on ? " year-option--on" : ""}`}
        onClick={() => {
          pick();
          setOpen(false);
        }}
      >
        {label}
      </button>
    </li>
  );

  return (
    <div className="year-select-wrap" ref={ref}>
      <button
        type="button"
        className={`gallery-filter-btn${filtered ? " gallery-filter-btn--on" : ""}`}
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.filters}
      >
        <Icon name="filter" size={16} />
      </button>
      {open && (
        <ul className="year-menu year-menu--up gallery-filter-menu" role="menu" aria-label={t.filters}>
          <li className="year-menu-head" role="presentation">
            <Icon name="list" size={12} />
            {tList.listBy}
          </li>
          {LIST_BY.map((o) => option(o, tList[o], o === listBy, () => onListByChange(o)))}
          {years.length > 0 && (
            <>
              <li className="year-menu-head" role="presentation">
                <Icon name="calendar" size={12} />
                {t.year}
              </li>
              {option("all", tYear.all, year === undefined, () => onYearChange(undefined))}
              {years.map((y) => option(String(y), y, y === year, () => onYearChange(y)))}
            </>
          )}
        </ul>
      )}
    </div>
  );
}
