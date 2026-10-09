import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { InferGetStaticPropsType } from "next";
import AlbumGrid, { type GridSection } from "@/components/gallery/AlbumGrid";
import AlbumPillBar from "@/components/gallery/AlbumPillBar";
import MotionSection from "@/components/gallery/MotionSection";
import type { ListBy } from "@/components/gallery/ListBySelect";
import type { SortBy } from "@/components/gallery/SortBySelect";
import GalleryModeSwitch, { type GalleryMode } from "@/components/gallery/GalleryModeSwitch";
import { getManifest, listImages, listVideos } from "@/lib/assets";
import { getChangelog } from "@/lib/changelog";
import type { GalleryImage, ScannedGalleryAlbum, ScannedVideoAlbum } from "@/lib/types";
import { useLocalized, type Localized } from "@/lib/i18n";
import { galleryPageUi as ui, listBySelectUi } from "@/lib/ui-strings";
import { albumGenres, galleryQuotes } from "@/lib/configs/gallery.config";
import { fold, folder, matcher } from "@/lib/search";

const NO_TEXT: Localized<string> = { en: "", vi: "" };

const UNKNOWN = "unknown";

const meta = (img: GalleryImage) => (typeof img === "string" ? undefined : img);

const DEFAULT_SORT: Record<ListBy, SortBy> = { genre: "time", album: "alphabet", device: "alphabet" };

function initial(label: string): string {
  const c = label.trim().normalize("NFD").charAt(0).toUpperCase();
  return c && c.toLowerCase() !== c ? c : "#";
}

let lastQuote = -1;

function pickQuote(): number {
  if (galleryQuotes.length < 2) return 0;
  let i = lastQuote;
  while (i === lastQuote) i = Math.floor(Math.random() * galleryQuotes.length);
  lastQuote = i;
  return i;
}

function albumName(folder: string): string {
  const seg = folder.split("/").pop() ?? folder;
  return seg
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const ALBUM_GENRES = new Set(albumGenres.map((g) => g.toLowerCase()));

function hasAlbums(folder: string): boolean {
  return ALBUM_GENRES.has((folder.split("/").pop() ?? "").toLowerCase());
}

function yearFromFolder(folder: string): number | undefined {
  const year = Number(folder.split("/")[1]);
  return Number.isFinite(year) ? year : undefined;
}

export async function getStaticProps() {
  const { photos, videos } = await getManifest();

  const scanned: ScannedGalleryAlbum[] = await Promise.all(
    photos.map(async (a) => ({
      ...a,
      name: albumName(a.folder),
      year: yearFromFolder(a.folder),
      images: await listImages(a.folder),
    }))
  );
  const scannedVideos: ScannedVideoAlbum[] = await Promise.all(
    videos.map(async (a) => ({
      ...a,
      name: albumName(a.folder),
      year: yearFromFolder(a.folder),
      videos: await listVideos(a.folder),
    }))
  );

  return {
    props: {
      albums: scanned,
      videoAlbums: scannedVideos,
      changelog: await getChangelog(),
    },
    revalidate: 1,
  };
}

export default function GalleryIndex({
  albums,
  videoAlbums,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const t = useLocalized(ui);
  const tList = useLocalized(listBySelectUi);
  const [listBy, setListBy] = useState<ListBy>("genre");
  const [sorts, setSorts] = useState(DEFAULT_SORT);
  const sortBy = sorts[listBy];
  const [mode, setMode] = useState<GalleryMode>("still");
  const view = useDeferredValue(mode);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [active, setActive] = useState<string>("all");
  const [quote, setQuote] = useState(0);
  useEffect(() => setQuote(pickQuote()), []);
  const picked = galleryQuotes[quote];
  const quoteText = useLocalized(picked?.text ?? NO_TEXT);
  const quoteBy = useLocalized(picked?.by ?? NO_TEXT);
  const source: (ScannedGalleryAlbum | ScannedVideoAlbum)[] =
    view === "motion" ? videoAlbums : albums;

  const years = useMemo(
    () =>
      [...new Set(source.map((a) => a.year).filter((y): y is number => !!y))].sort(
        (a, b) => b - a
      ),
    [source]
  );

  const inYear = useMemo(
    () => (year ? source.filter((a) => a.year === year) : source),
    [source, year]
  );

  const [query, setQuery] = useState("");
  const asked = useDeferredValue(query);
  const match = useMemo(() => matcher(asked), [asked]);
  const textOf = useMemo(() => folder(), [t]);

  const visible = useMemo(() => {
    if (!match) return inYear;
    const monthWords = (month?: string) => {
      if (!month) return undefined;
      const [y, m] = month.split("-").map(Number);
      return t.month(m, y);
    };
    return inYear.flatMap((a): (ScannedGalleryAlbum | ScannedVideoAlbum)[] => {
      if ("videos" in a) {
        const videos = a.videos.filter((v) => match(textOf(v, () => [v.name, v.brief, a.name, a.year])));
        return videos.length ? [{ ...a, videos }] : [];
      }
      const images = a.images.filter((img) => {
        const m = meta(img);
        if (!m) return match(fold(`${img} ${a.name}`));
        return match(
          textOf(m, () => [
            m.name, m.device, m.album && albumName(m.album), a.name, a.year, m.month, monthWords(m.month),
            m.day && t.day(m.day),
          ])
        );
      });
      return images.length ? [{ ...a, images }] : [];
    });
  }, [inYear, match, textOf, t]);

  useEffect(() => {
    setActive("all");
    setYear(undefined);
    setQuery("");
  }, [view]);

  const countOf = (a: ScannedGalleryAlbum | ScannedVideoAlbum) =>
    "videos" in a ? a.videos.length : a.images.length;

  const totalCount = useMemo(
    () => visible.reduce((n, a) => n + countOf(a), 0),
    [visible, view]
  );

  const still = view === "still";

  const groups = useMemo(() => {
    const map = new Map<string, { key: string; name: string; images: GalleryImage[] }>();
    if (!still) return [];
    for (const a of visible) {
      if (!("images" in a)) continue;
      if (listBy === "genre" || (listBy === "album" && !hasAlbums(a.folder))) {
        map.set(a.folder, { key: a.folder, name: a.name, images: a.images });
        continue;
      }
      const byDevice = listBy === "device";
      for (const img of a.images) {
        const name = (byDevice ? meta(img)?.device : meta(img)?.album) || UNKNOWN;
        const key = byDevice || name === UNKNOWN ? name : `${a.folder}/${name}`;
        const group = map.get(key);
        if (group) group.images.push(img);
        else map.set(key, { key, name, images: [img] });
      }
    }
    return [...map.values()].sort(
      (a, b) =>
        Number(a.key === UNKNOWN) - Number(b.key === UNKNOWN) ||
        (listBy === "device" ? b.images.length - a.images.length || a.key.localeCompare(b.key) : 0)
    );
  }, [still, listBy, visible]);

  const groupLabel = (g: { key: string; name: string }) =>
    g.key === UNKNOWN
      ? listBy === "device" ? tList.unknownDevice : tList.noAlbum
      : listBy === "album" ? albumName(g.name) : g.name;

  const chips = useMemo(
    () => [
      { key: "all", label: t.all, count: totalCount },
      ...(still
        ? groups.map((g) => ({ key: g.key, label: groupLabel(g), count: g.images.length }))
        : visible.map((a) => ({ key: a.folder, label: a.name, count: countOf(a) }))),
    ],
    [visible, totalCount, t.all, view, still, groups, listBy, tList]
  );

  useEffect(() => {
    if (!chips.some((c) => c.key === active)) setActive("all");
  }, [chips, active]);

  const changeListBy = (v: ListBy) => {
    setListBy(v);
    setActive("all");
  };

  const activeAlbum = useMemo(
    () => (still || active === "all" ? undefined : visible.find((a) => a.folder === active)),
    [visible, active, still]
  );

  const activeGroup = useMemo(
    () => (still && active !== "all" ? groups.find((g) => g.key === active) : undefined),
    [still, active, groups]
  );

  const { images: shownImages, sections } = useMemo((): {
    images: GalleryImage[];
    sections?: GridSection[];
  } => {
    const monthLabel = (key: string) => {
      if (key === UNKNOWN) return t.unknownDate;
      const [y, m] = key.split("-").map(Number);
      return t.month(m, y === year ? undefined : y);
    };

    const byMonth = (list: GalleryImage[]) => {
      const months = new Map<string, GalleryImage[]>();
      for (const img of list) {
        const key = meta(img)?.month ?? UNKNOWN;
        const slot = months.get(key);
        if (slot) slot.push(img);
        else months.set(key, [img]);
      }
      return [...months]
        .sort(([a], [b]) => Number(a === UNKNOWN) - Number(b === UNKNOWN) || b.localeCompare(a))
        .map(([key, images]) => ({ key, images }));
    };

    const parts = (list: { label: string; images: GalleryImage[] }[]) =>
      list.length > 1 ? { sub: list.map((x) => ({ label: x.label, count: x.images.length })) } : {};

    if (!activeGroup && sortBy === "alphabet") {
      const named = groups
        .filter((g) => g.images.length > 0)
        .map((g) => ({ ...g, label: groupLabel(g), months: byMonth(g.images) }))
        .sort(
          (a, b) =>
            Number(a.key === UNKNOWN) - Number(b.key === UNKNOWN) ||
            a.label.localeCompare(b.label, undefined, { sensitivity: "base", numeric: true })
        );
      return {
        images: named.flatMap((g) => g.months.flatMap((m) => m.images)),
        sections: named.map((g) => ({
          label: g.label,
          count: g.images.length,
          ...(g.key === UNKNOWN ? {} : { mark: initial(g.label) }),
          ...parts(g.months.map((m) => ({ label: monthLabel(m.key), images: m.images }))),
        })),
      };
    }

    const images = activeGroup
      ? activeGroup.images
      : visible.flatMap((a) => ("images" in a ? a.images : []));

    const isAlbum =
      activeGroup && listBy === "album" && !visible.some((a) => a.folder === activeGroup.key);
    if (isAlbum && images.some((img) => meta(img)?.day)) {
      const days = new Map<number, { images: GalleryImage[]; date?: string }>();
      for (const img of images) {
        const m = meta(img);
        const key = m?.day ?? 0;
        const slot = days.get(key) ?? { images: [] };
        slot.images.push(img);
        if (m?.date && (!slot.date || m.date < slot.date)) slot.date = m.date;
        days.set(key, slot);
      }
      const dated = [...days].every(([key, slot]) => key === 0 || slot.date);
      const order = [...days.keys()].sort(
        (a, b) =>
          Number(a === 0) - Number(b === 0) ||
          (dated ? (days.get(a)?.date ?? "").localeCompare(days.get(b)?.date ?? "") : 0) ||
          a - b
      );
      return {
        images: order.flatMap((k) => days.get(k)?.images ?? []),
        sections: order.map((k) => {
          const slot = days.get(k);
          const count = slot?.images.length ?? 0;
          if (k === 0) return { label: t.otherDays, count };
          const [, month, day] = (slot?.date ?? "").split("-").map(Number);
          return {
            label: t.day(k, month && day ? { day, month } : undefined),
            count,
            mark: t.dayShort(k),
          };
        }),
      };
    }

    const owner = new Map<GalleryImage, number>();
    if (!activeGroup) groups.forEach((g, at) => g.images.forEach((img) => owner.set(img, at)));
    const months = byMonth(images).map((month) => {
      const within = new Map<number, GalleryImage[]>();
      for (const img of month.images) {
        const at = owner.get(img) ?? -1;
        const slot = within.get(at);
        if (slot) slot.push(img);
        else within.set(at, [img]);
      }
      const split = [...within]
        .sort(([a], [b]) => a - b)
        .map(([at, list]) => ({ label: at < 0 ? "" : groupLabel(groups[at]), images: list }));
      return { ...month, split };
    });
    return {
      images: months.flatMap((m) => m.split.flatMap((x) => x.images)),
      sections: months.map((m) => ({
        label: monthLabel(m.key),
        count: m.images.length,
        ...(year === undefined && m.key !== UNKNOWN ? { mark: m.key.slice(0, 4) } : {}),
        ...parts(m.split),
      })),
    };
  }, [activeGroup, groups, listBy, sortBy, visible, year, t, tList]);

  const shownVideos = useMemo(
    () =>
      activeAlbum && "videos" in activeAlbum
        ? activeAlbum.videos
        : visible.flatMap((a) => ("videos" in a ? a.videos : [])),
    [activeAlbum, visible]
  );

  const shown = view === "motion" ? shownVideos : shownImages;

  const gridTitle = activeGroup
    ? groupLabel(activeGroup)
    : activeAlbum
      ? activeAlbum.name
      : t.heading;

  return (
    <div
      className={`stack reveal gallery-page${
        view === "motion" ? " gallery-page--motion" : ""
      }`}
    >
      <header>
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.heading}</h1>
        {quoteText && (
          <p className="gallery-quote">
            &quot;{quoteText}&quot;
            {quoteBy && <cite className="gallery-quote-by"> - {quoteBy}</cite>}
          </p>
        )}
      </header>

      <GalleryModeSwitch mode={mode} onChange={setMode} />

      {view === "still" && (
        <AlbumPillBar
          chips={chips}
          active={active}
          onSelect={setActive}
          years={years}
          year={year}
          onYearChange={setYear}
          listBy={listBy}
          onListByChange={changeListBy}
          sortBy={sortBy}
          onSortByChange={(v) => setSorts((s) => ({ ...s, [listBy]: v }))}
          sortDisabled={!!activeGroup}
          query={query}
          onQueryChange={setQuery}
        />
      )}

      {view === "motion" ? (
        <MotionSection
          videos={shownVideos}
          chips={chips}
          active={active}
          onSelect={setActive}
          years={years}
          year={year}
          onYearChange={setYear}
          query={query}
          onQueryChange={setQuery}
          empty={match ? t.noVideoMatches : undefined}
        />
      ) : shownImages.length === 0 ? (
        <p className="album-empty">{match ? t.noPhotoMatches : t.photosToBeAdded}</p>
      ) : (
        <AlbumGrid images={shownImages} title={gridTitle} sections={sections} />
      )}
    </div>
  );
}
