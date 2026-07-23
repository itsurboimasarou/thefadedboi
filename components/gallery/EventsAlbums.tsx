import { useCallback, useEffect, useMemo, useRef,  useState } from "react";
import AlbumGrid from "./AlbumGrid";
import type { EventAlbum, ScannedSection } from "@/lib/types";
import Icon from "../ui/Icons";
import YearSelect from "./YearSelect";

interface EventAlbumsProps {
  events: EventAlbum[];
  eventImages: Record<string, string[]>;
  title: string;
  description?: string;
}

export default function EventAlbums({ events, eventImages, title, description }: EventAlbumsProps) {
  const years = useMemo(
    () => [...new Set(events.map((e) => e.year))].sort((a, b) => b - a),
    [events]
  );
  const [year, setYear] = useState<number | undefined>(years[0]);
  const shown = useMemo(() => events.filter((e) => e.year === year), [events, year]);
  const [active, setActive] = useState<EventAlbum | null>(shown[0] ?? null);

  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setActive(shown[0] ?? null); }, [year]);

  if (!events.length || !active) return null;
  const images = eventImages[active.folder] ?? [];
  const sectionIcon = (kind: ScannedSection["kind"]) => kind === "banner" ? "trophy" : "image";

  return (
    <div>
      <div className="section-head">
        <h2 className="h-with-icon"><Icon name={sectionIcon("events")} />{title}</h2>
          <YearSelect years={years} value={year!} onChange={setYear} />
      </div>

      {description && <p style={{ marginBottom: 18 }}>{description}</p>}

      <div className="selector-row">
        <div className="like-bubbles event-chips" aria-label={`${title} events`}>
          {shown.map((e) => (
            <button
              key={e.folder}
              type="button"
              className="like-bubble"
              aria-pressed={active.folder === e.folder}
              onClick={() => setActive(e)}
            >
              {e.name}
            </button>
          ))}
        </div>

        <a
          href={active.googlePhotosUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--small"
        >
          See more →
        </a>
      </div>

      {images.length === 0 ? (
        <p className="album-empty">
          To be added.
        </p>
      ) : (
        <AlbumGrid key={active.folder} images={images} title={`${title} — ${active.name}`} />
      )}
    </div>
  );
}
