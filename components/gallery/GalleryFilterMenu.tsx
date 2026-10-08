import { useEffect, useRef, useState } from "react";
import Icon from "../ui/Icons";
import { LIST_BY, type ListBy } from "./ListBySelect";
import { SORT_BY, type SortBy } from "./SortBySelect";
import { useLocalized } from "@/lib/i18n";
import { galleryFilterUi as ui, listBySelectUi, sortBySelectUi, yearSelectUi } from "@/lib/ui-strings";

interface GalleryFilterMenuProps {
  listBy: ListBy;
  onListByChange: (v: ListBy) => void;
  sortBy: SortBy;
  onSortByChange: (v: SortBy) => void;
  sortDisabled: boolean;
  years: number[];
  year: number | undefined;
  onYearChange: (y: number | undefined) => void;
}

export default function GalleryFilterMenu({
  listBy,
  onListByChange,
  sortBy,
  onSortByChange,
  sortDisabled,
  years,
  year,
  onYearChange,
}: GalleryFilterMenuProps) {
  const t = useLocalized(ui);
  const tList = useLocalized(listBySelectUi);
  const tSort = useLocalized(sortBySelectUi);
  const tYear = useLocalized(yearSelectUi);
  const [open, setOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) setYearOpen(false);
  }, [open]);

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

  const filtered = listBy !== "genre" || year !== undefined;

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
          {!sortDisabled && (
            <>
              <li className="year-menu-head" role="presentation">
                <Icon name="sort" size={12} />
                {tSort.sortBy}
              </li>
              {SORT_BY.map((o) => option(`sort-${o}`, tSort[o], o === sortBy, () => onSortByChange(o)))}
            </>
          )}
          {years.length > 0 && (
            <>
              <li className="year-menu-head" role="presentation">
                <Icon name="calendar" size={12} />
                {t.year}
              </li>
              <li>
                <button
                  type="button"
                  role="menuitem"
                  className="year-option gallery-filter-year"
                  onClick={() => setYearOpen(!yearOpen)}
                  aria-haspopup="menu"
                  aria-expanded={yearOpen}
                >
                  <Icon name="chevronLeft" size="1em" />
                  {year ?? tYear.all}
                </button>
                {yearOpen && (
                  <ul className="year-menu gallery-filter-submenu" role="menu" aria-label={t.year}>
                    {option("all", tYear.all, year === undefined, () => onYearChange(undefined))}
                    {years.map((y) => option(String(y), y, y === year, () => onYearChange(y)))}
                  </ul>
                )}
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
}
