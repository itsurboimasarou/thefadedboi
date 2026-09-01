import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { InferGetStaticPropsType } from "next";
import Icon from "@/components/ui/Icons";
import YearSelect from "@/components/gallery/YearSelect";
import AlbumGrid from "@/components/gallery/AlbumGrid";
import { getManifest, cdnUrl, listImages, getChangelog } from "@/lib/assets";
import type { ScannedAlbum, ScannedIndexSubject } from "@/lib/types";
import { useLocalized, type Localized } from "@/lib/i18n";

const ui: Localized<{
  eyebrow: string;
  heading: string;
  photosToBeAdded: string;
  albumsToBeAdded: string;
  photoCount: (n: number) => string;
  setCount: (sets: number, photos: number) => string;
}> = {
  en: {
    eyebrow: "Gallery",
    heading: "Precious moments",
    photosToBeAdded: "Photos to be added.",
    albumsToBeAdded: "Albums to be added.",
    photoCount: (n) => `${n} photo${n === 1 ? "" : "s"}`,
    setCount: (sets, photos) => `${sets} set${sets === 1 ? "" : "s"} · ${photos} photo${photos === 1 ? "" : "s"}`,
  },
  vi: {
    eyebrow: "Thư viện",
    heading: "Những khoảnh khắc đẹp nhất",
    photosToBeAdded: "Ảnh sẽ được thêm sau.",
    albumsToBeAdded: "Album sẽ được thêm sau.",
    photoCount: (n) => `${n} ảnh`,
    setCount: (sets, photos) => `${sets} bộ · ${photos} ảnh`,
  },
};

export async function getStaticProps() {
  const { subjects } = await getManifest();

  const withData: ScannedIndexSubject[] = await Promise.all(
    subjects.map(async (s) => ({
      ...s,
      ...(s.folder ? { images: await listImages(s.folder) } : {}),
      albums: await Promise.all(
        s.albums.map(async (a): Promise<ScannedAlbum> => ({
          ...a,
          count: a.subAlbums?.length
            ? (
                await Promise.all(a.subAlbums.map((sa) => listImages(sa.folder)))
              ).reduce((n, imgs) => n + imgs.length, 0)
            : (await listImages(a.folder)).length,
        }))
      ),
    }))
  );

  return {
    props: { subjects: withData, changelog: await getChangelog() },
    revalidate: 300,
  };
}

function SubjectSection({ subject }: { subject: ScannedIndexSubject }) {
  const t = useLocalized(ui);
  const years = useMemo(
    () =>
      [...new Set(subject.albums.map((a) => a.year).filter(Boolean))].sort(
        (a, b) => (b as number) - (a as number)
      ) as number[],
    [subject.albums]
  );
  const [year, setYear] = useState<number | undefined>(years[0]);

  const shown = year
    ? subject.albums.filter((a) => !a.year || a.year === year)
    : subject.albums;

  return (
    <section className="glass" id={subject.slug}>
      <div className="section-head">
        <h2 className="h-with-icon">
          <Icon name={subject.icon ?? "image"} />
          {subject.title}
        </h2>
        {years.length > 0 && (
          <YearSelect years={years} value={year} onChange={setYear} />
        )}
      </div>

      {subject.description && (
        <p style={{ marginBottom: 18 }}>{subject.description}</p>
      )}

      {subject.folder ? (
        subject.images && subject.images.length > 0 ? (
          <AlbumGrid images={subject.images} title={subject.title} />
        ) : (
          <p className="album-empty">{t.photosToBeAdded}</p>
        )
      ) : shown.length === 0 ? (
        <p className="album-empty">{t.albumsToBeAdded}</p>
      ) : (
        <div className="album-cards">
          {shown.map((album) => <AlbumCard key={album.slug} subject={subject} album={album} />)}
        </div>
      )}
    </section>
  );
}

function AlbumCard({ subject, album }: { subject: ScannedIndexSubject; album: ScannedAlbum }) {
  const t = useLocalized(ui);
  const cover = album.cover ? cdnUrl(album.folder, album.cover) : null;
  const subCount = album.subAlbums?.length ?? 0;

  return (
    <Link href={`/gallery/${subject.slug}/${album.slug}`} className="album-card">
      <span className="album-card-media">
        {cover ? (
          <Image
            src={cover}
            alt={album.title}
            width={320}
            height={320}
            className="album-card-img"
            sizes="(max-width: 700px) 45vw, 200px"
          />
        ) : (
          <span className="album-card-placeholder" aria-hidden="true">
            <Icon name="image" size={26} />
          </span>
        )}
      </span>
      <span className="album-card-body">
        <span className="album-card-title">{album.title}</span>
        <span className="album-card-meta">
          {subCount > 0 ? t.setCount(subCount, album.count) : t.photoCount(album.count)}
        </span>
      </span>
    </Link>
  );
}

export default function GalleryIndex({
  subjects,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const t = useLocalized(ui);
  return (
    <div className="stack reveal">
      <header>
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.heading}</h1>
      </header>

      {subjects.length === 0 ? (
        <section className="glass">
          <p className="album-empty">{t.albumsToBeAdded}</p>
        </section>
      ) : (
        subjects.map((s) => <SubjectSection key={s.slug} subject={s} />)
      )}
    </div>
  );
}
