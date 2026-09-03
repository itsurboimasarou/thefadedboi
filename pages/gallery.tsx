import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { InferGetStaticPropsType } from "next";
import AlbumGrid from "@/components/gallery/AlbumGrid";
import AlbumPillBar from "@/components/gallery/AlbumPillBar";
import MotionSection from "@/components/gallery/MotionSection";
import GalleryModeSwitch, { type GalleryMode } from "@/components/gallery/GalleryModeSwitch";
import { getManifest, listImages, listVideos, getChangelog } from "@/lib/assets";
import type { ScannedGalleryAlbum, ScannedVideoAlbum } from "@/lib/types";
import { useLocalized, type Localized } from "@/lib/i18n";
import { galleryQuotes } from "@/lib/configs/gallery.config";

const ui: Localized<{
  eyebrow: string;
  heading: string;
  all: string;
  photosToBeAdded: string;
  videosToBeAdded: string;
}> = {
  en: {
    eyebrow: "Gallery",
    heading: "Precious moments",
    all: "All",
    photosToBeAdded: "Photos to be added.",
    videosToBeAdded: "Videos to be added.",
  },
  vi: {
    eyebrow: "Thư viện",
    heading: "Những khoảnh khắc đẹp nhất",
    all: "Tất cả",
    photosToBeAdded: "Ảnh sẽ được thêm sau.",
    videosToBeAdded: "Video sẽ được thêm sau.",
  },
};

const NO_TEXT: Localized<string> = { en: "", vi: "" };

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

  const visible = useMemo(
    () => (year ? source.filter((a) => a.year === year) : source),
    [source, year]
  );

  useEffect(() => {
    if (active !== "all" && !visible.some((a) => a.folder === active)) setActive("all");
  }, [visible, active]);

  useEffect(() => {
    setActive("all");
    setYear(undefined);
  }, [view]);

  const countOf = (a: ScannedGalleryAlbum | ScannedVideoAlbum) =>
    "videos" in a ? a.videos.length : a.images.length;

  const totalCount = useMemo(
    () => visible.reduce((n, a) => n + countOf(a), 0),
    [visible, view]
  );

  const chips = useMemo(
    () => [
      { key: "all", label: t.all, count: totalCount },
      ...visible.map((a) => ({ key: a.folder, label: a.name, count: countOf(a) })),
    ],
    [visible, totalCount, t.all, view]
  );

  const activeAlbum = useMemo(
    () => (active === "all" ? undefined : visible.find((a) => a.folder === active)),
    [visible, active]
  );

  const shownImages = useMemo(
    () =>
      activeAlbum && "images" in activeAlbum
        ? activeAlbum.images
        : visible.flatMap((a) => ("images" in a ? a.images : [])),
    [activeAlbum, visible]
  );

  const shownVideos = useMemo(
    () =>
      activeAlbum && "videos" in activeAlbum
        ? activeAlbum.videos
        : visible.flatMap((a) => ("videos" in a ? a.videos : [])),
    [activeAlbum, visible]
  );

  const shown = view === "motion" ? shownVideos : shownImages;

  const gridTitle = activeAlbum ? activeAlbum.name : t.heading;

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
        />
      ) : shownImages.length === 0 ? (
        <p className="album-empty">{t.photosToBeAdded}</p>
      ) : (
        <AlbumGrid images={shownImages} title={gridTitle} />
      )}
    </div>
  );
}
