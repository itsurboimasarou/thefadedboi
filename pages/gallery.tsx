import LinkBanner from "@/components/content/LinkBanner";
import { gallery } from "@/lib/gallery.config";
import Icon from "@/components/ui/Icons";
import AlbumGrid from "@/components/gallery/AlbumGrid";
import EventAlbums from "@/components/gallery/EventsAlbums";
import type { ScannedSection } from "@/lib/types";
import type { InferGetStaticPropsType } from "next";
import fs from "fs";
import path from "path";

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg)$/i;

const scanDir = (folder: string): string[] => {
  const dir = path.join(process.cwd(), "public", "albums", folder);
  return fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => IMAGE_EXT.test(f)).sort()
        .map((f) => `/albums/${folder}/${f}`)
    : [];
};

export async function getStaticProps() {
  const sections: ScannedSection[] = gallery.sections.map((s) => {
    if (s.kind === "events") {
      return {
        ...s,
        images: [],
        eventImages: Object.fromEntries(
          s.events.map((e) => [e.folder, scanDir(e.folder)])
        ),
      };
    }
    return { ...s, images: scanDir(s.folder) };
  });
  return { props: { sections } };
}

export default function Gallery({ sections }: InferGetStaticPropsType<typeof getStaticProps>) {
  const sectionIcon = (kind: ScannedSection["kind"]) => kind === "banner" ? "trophy" : "image";

  return (
    <div className="stack reveal">
      <header>
        <p className="eyebrow">Gallery</p>
        <h1>Photos</h1>
      </header>

      {sections.map((s) => (
        <section key={s.title} className="glass">

          {s.kind !== "events" && (
            <>
              <div className="section-head">
                <h2 className="h-with-icon"><Icon name={sectionIcon(s.kind)} />{s.title}</h2>
                {s.kind === "simple" && (
                  <a href={s.googlePhotosUrl} target="_blank" rel="noopener noreferrer" className="btn btn--small">
                    See more →
                  </a>
                )}
              </div>
              {s.description && <p style={{ marginBottom: 18 }}>{s.description}</p>}
            </>
          )}

          {s.kind === "banner" && (
            <>
              <LinkBanner text={s.bannerText} ctaLabel={s.ctaLabel} ctaHref={s.ctaHref} icon="trophy" />
              {s.images.length === 0
                ? <p className="album-empty">Certificates to be added.</p>
                : <AlbumGrid images={s.images} title={s.title} />}
            </>
          )}

          {s.kind === "events" && (
            <EventAlbums events={s.events} eventImages={s.eventImages} title={s.title} description={s.description} />
          )}

          {s.kind === "simple" && <AlbumGrid images={s.images} title={s.title} />}
        </section>
      ))}
    </div>
  );
}