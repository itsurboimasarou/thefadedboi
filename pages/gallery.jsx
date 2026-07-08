import { gallery } from "@/lib/gallery.config";
import Icon from "@/components/ui/Icons";
import AlbumGrid from "@/components/gallery/AlbumGrid";
import fs from "fs";
import path from "path";

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg|heif|heic)$/i;

export async function getStaticProps() {
  const albums = gallery.albums.map((album) => {
    const dir = path.join(process.cwd(), "public", "albums", album.folder);
    const images = fs.existsSync(dir)
      ? fs.readdirSync(dir)
          .filter((f) => IMAGE_EXT.test(f))
          .sort()
          .map((f) => `/albums/${album.folder}/${f}`)
      : [];
    return { ...album, images };
  });

  return { props: { albums } };
}

export default function Gallery({ albums }) {
  return (
    <div className="stack reveal">

      <header>
        <p className="eyebrow">Gallery</p>
        <h1>Photos</h1>
        <p style={{ marginTop: 12, maxWidth: "100ch" }}>
          Selected shots from each album — the full sets live on Google Photos.
        </p>
      </header>

      {albums.map((album) => (
        <section key={album.title} className="glass">
          <div className="section-head">
            <h2 className="h-with-icon"><Icon name="image" />{album.title}</h2>
            <a href={album.googlePhotosUrl} target="_blank" rel="noopener noreferrer" className="btn btn--small">
              See more →
            </a>
          </div>
          <p style={{ marginBottom: 18 }}>{album.description}</p>
          <AlbumGrid images={album.images} title={album.title} />
        </section>
      ))}
    </div>
  );
}
