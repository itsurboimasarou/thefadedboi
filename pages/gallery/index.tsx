import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { InferGetStaticPropsType } from "next";
import Icon from "@/components/ui/Icons";
import LinkBanner from "@/components/content/LinkBanner";
import YearSelect from "@/components/gallery/YearSelect";
import AlbumGrid from "@/components/gallery/AlbumGrid";
import { getManifest, cdnUrl, listImages } from "@/lib/assets";
import type { ScannedAlbum, ScannedIndexSubject } from "@/lib/types";

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

  return { props: { subjects: withData }, revalidate: 300 };
}

function SubjectSection({ subject }: { subject: ScannedIndexSubject }) {
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

      {subject.banner && (
        <LinkBanner
          text={subject.banner.text}
          ctaLabel={subject.banner.ctaLabel}
          ctaHref={subject.banner.ctaHref}
          icon="briefcase"
        />
      )}

      {subject.folder ? (
        subject.images && subject.images.length > 0 ? (
          <AlbumGrid images={subject.images} title={subject.title} />
        ) : (
          <p className="album-empty">Photos to be added.</p>
        )
      ) : shown.length === 0 ? (
        <p className="album-empty">Albums to be added.</p>
      ) : (
        <div className="album-cards">
          {shown.map((album) => <AlbumCard key={album.slug} subject={subject} album={album} />)}
        </div>
      )}
    </section>
  );
}

function AlbumCard({ subject, album }: { subject: ScannedIndexSubject; album: ScannedAlbum }) {
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
          {subCount > 0 ? `${subCount} set${subCount > 1 ? "s" : ""} · ${album.count} photos` : `${album.count} photos`}
        </span>
      </span>
    </Link>
  );
}

export default function GalleryIndex({
  subjects,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="stack reveal">
      <header>
        <p className="eyebrow">Gallery</p>
        <h1>Photos</h1>
      </header>

      {subjects.length === 0 ? (
        <section className="glass">
          <p className="album-empty">Albums to be added.</p>
        </section>
      ) : (
        subjects.map((s) => <SubjectSection key={s.slug} subject={s} />)
      )}
    </div>
  );
}
