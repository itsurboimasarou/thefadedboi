import { useEffect, useMemo, useState } from "react";
import type { InferGetStaticPropsType } from "next";
import AlbumGrid from "@/components/gallery/AlbumGrid";
import AlbumPillBar, { useBarPos } from "@/components/gallery/AlbumPillBar";
import { getManifest, listImages, getChangelog } from "@/lib/assets";
import type { ScannedGalleryAlbum } from "@/lib/types";
import { useLocalized, type Localized } from "@/lib/i18n";
import { galleryQuotes } from "@/lib/configs/gallery.config";

const ui: Localized<{
  eyebrow: string;
  heading: string;
  all: string;
  photosToBeAdded: string;
}> = {
  en: {
    eyebrow: "Gallery",
    heading: "Precious moments",
    all: "All",
    photosToBeAdded: "Photos to be added.",
  },
  vi: {
    eyebrow: "Thư viện",
    heading: "Những khoảnh khắc đẹp nhất",
    all: "Tất cả",
    photosToBeAdded: "Ảnh sẽ được thêm sau.",
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
  const { albums } = await getManifest();
  const scanned: ScannedGalleryAlbum[] = await Promise.all(
    albums.map(async (a) => ({
      ...a,
      name: albumName(a.folder),
      year: yearFromFolder(a.folder),
      images: await listImages(a.folder),
    }))
  );
  return {
    props: { albums: scanned, changelog: await getChangelog() },
    revalidate: 300,
  };
}

export default function GalleryIndex({
  albums,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const t = useLocalized(ui);
  const barPos = useBarPos();
  const [year, setYear] = useState<number | undefined>(undefined);
  const [active, setActive] = useState<string>("all");
  const [quote, setQuote] = useState(0);
  useEffect(() => setQuote(pickQuote()), []);
  const picked = galleryQuotes[quote];
  const quoteText = useLocalized(picked?.text ?? NO_TEXT);
  const quoteBy = useLocalized(picked?.by ?? NO_TEXT);

  const years = useMemo(
    () =>
      [...new Set(albums.map((a) => a.year).filter((y): y is number => !!y))].sort(
        (a, b) => b - a
      ),
    [albums]
  );

  const visible = useMemo(
    () => (year ? albums.filter((a) => a.year === year) : albums),
    [albums, year]
  );

  useEffect(() => {
    if (active !== "all" && !visible.some((a) => a.folder === active)) setActive("all");
  }, [visible, active]);

  const totalCount = useMemo(
    () => visible.reduce((n, a) => n + a.images.length, 0),
    [visible]
  );

  const chips = useMemo(
    () => [
      { key: "all", label: t.all, count: totalCount },
      ...visible.map((a) => ({ key: a.folder, label: a.name, count: a.images.length })),
    ],
    [visible, totalCount, t.all]
  );

  const activeAlbum = useMemo(
    () => (active === "all" ? undefined : visible.find((a) => a.folder === active)),
    [visible, active]
  );

  const shownImages = useMemo(
    () => (activeAlbum ? activeAlbum.images : visible.flatMap((a) => a.images)),
    [activeAlbum, visible]
  );

  const gridTitle = activeAlbum ? activeAlbum.name : t.heading;

  return (
    <div className={`stack reveal gallery-page gallery-page--bar-${barPos}`}>
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

      <AlbumPillBar
        chips={chips}
        active={active}
        onSelect={setActive}
        years={years}
        year={year}
        onYearChange={setYear}
      />

      {shownImages.length === 0 ? (
        <p className="album-empty">{t.photosToBeAdded}</p>
      ) : (
        <AlbumGrid images={shownImages} title={gridTitle} />
      )}
    </div>
  );
}
