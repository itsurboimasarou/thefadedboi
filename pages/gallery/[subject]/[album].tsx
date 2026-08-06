import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import type { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import Icon from "@/components/ui/Icons";
import AlbumGrid from "@/components/gallery/AlbumGrid";
import { getManifest, listImages, findAlbum } from "@/lib/photos";
import YearSelect from "@/components/gallery/YearSelect";
import type { ScannedSubAlbum } from "@/lib/types";

export async function getStaticPaths() {
  const { subjects } = await getManifest();
  const paths = subjects.flatMap((s) =>
    s.albums.map((a) => ({ params: { subject: s.slug, album: a.slug } }))
  );
  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const { subjects } = await getManifest();
  const found = findAlbum(
    subjects,
    String(params?.subject),
    String(params?.album)
  );
  if (!found) return { notFound: true, revalidate: 60 };

  const { subject, album } = found;

  const subAlbums: ScannedSubAlbum[] | null = album.subAlbums?.length
    ? await Promise.all(
        album.subAlbums.map(async (sa) => ({
          ...sa,
          images: await listImages(sa.folder),
        }))
      )
    : null;

  return {
    props: {
      subjectSlug: subject.slug,
      subjectTitle: subject.title,
      album,
      subAlbums,
      images: subAlbums ? [] : await listImages(album.folder),
    },
    revalidate: 300,
  };
}

export default function AlbumPage({
  subjectSlug,
  subjectTitle,
  album,
  subAlbums,
  images,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [active, setActive] = useState<ScannedSubAlbum | null>(
    subAlbums?.[0] ?? null
  );

  const driveUrl = active ? active.driveUrl : album.driveUrl;
  const shown = active ? active.images : images;
  const gridTitle = active ? `${album.title} — ${active.title}` : album.title;

  const years = useMemo(
    () => [...new Set((subAlbums ?? []).map((s) => s.year).filter(Boolean))]
            .sort((a, b) => (b as number) - (a as number)) as number[],
    [subAlbums]
  );
  const [year, setYear] = useState<number | undefined>(years[0]);
  const shownSets = year ? subAlbums!.filter((s) => s.year === year) : subAlbums ?? [];

  useEffect(() => { setActive(shownSets[0] ?? null); }, [year]);

  return (
    <div className="stack reveal">
      <header>
        <p className="eyebrow">
          <Link href="/gallery" className="crumb">
            Gallery
          </Link>
          {" / "}
          <Link href={`/gallery#${subjectSlug}`} className="crumb">
            {subjectTitle}
          </Link>
        </p>
        <h1>{album.title}</h1>
      </header>

      <section className="glass">
        <div className="section-head">
          <h2 className="h-with-icon">
            <Icon name="image" />
            {active ? active.title : album.title}
          </h2>
          <div className="head-actions">
            {years.length > 0 && <YearSelect years={years} value={year} onChange={setYear} />}
            {driveUrl && <a href={driveUrl} target="_blank" rel="noopener noreferrer" className="btn btn--small"><Icon name="download" size={15} />Download</a>}
          </div>
        </div>

        {subAlbums && (
          <div className="selector-row">
            <div className="chip-scroller">
              <div className="like-bubbles event-chips">
                {subAlbums.map((sa) => (
                  <button
                    key={sa.slug}
                    type="button"
                    className="like-bubble"
                    aria-pressed={active?.slug === sa.slug}
                    onClick={() => setActive(sa)}
                  >
                    {sa.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {shown.length === 0 ? (
          <p className="album-empty">
            {driveUrl
              ? "Photos to be added — the full set is on the Download link above."
              : "Photos to be added."}
          </p>
        ) : (
          <AlbumGrid
            key={active?.slug ?? album.slug}
            images={shown}
            title={gridTitle}
          />
        )}
      </section>
    </div>
  );
}
