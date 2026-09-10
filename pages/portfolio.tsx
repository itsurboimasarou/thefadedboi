import type { InferGetStaticPropsType } from "next";
import { portfolio as portfolioConfig } from "@/lib/configs/portfolio.config";
import { useLocalized } from "@/lib/i18n";
import { portfolioPageUi as ui } from "@/lib/ui-strings";
import AlbumGrid from "@/components/gallery/AlbumGrid";
import Icon from "@/components/ui/Icons";
import { getChangelog, listImages } from "@/lib/assets";

export async function getStaticProps() {
  return {
    props: {
      changelog: await getChangelog(),
      achievements: await listImages("achievements"),
    },
    revalidate: 300,
  };
}

export default function Portfolio({
  achievements,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const portfolio = useLocalized(portfolioConfig);
  const t = useLocalized(ui);
  return (
    <div className="stack reveal">
      <header>
        <p className="eyebrow">Portfolio</p>
        <h1>{t.heading}</h1>
      </header>

      <section className="glass">
        <h2 className="h-with-icon"><Icon name="trophy" />{t.achievements}</h2>
        {achievements.length > 0 ? (
          <AlbumGrid images={achievements} title={t.achievements} />
        ) : (
          <p className="album-empty">{t.photosToBeAdded}</p>
        )}
      </section>

      <section className="glass">
        <h2 className="h-with-icon"><Icon name="briefcase" />{t.projects}</h2>
        <div className="grid grid--2">
          {portfolio.projects.map((p) => {
            const isPrivate = p.visibility === "private";

            const body = (
              <>
                <h3 style={{ color: "var(--ink)", marginBottom: 8 }}>{p.title}</h3>
                <p style={{ marginBottom: 14 }}>{p.description}</p>
                <div>
                  <span className={`vis-tag vis-tag--${p.visibility}`}>{p.visibility}</span>
                  {p.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}
                </div>
              </>
            );

            return isPrivate ? (
              <div key={p.title} className="glass project-card project-card--private">
                {body}
              </div>
            ) : (
              <a
                key={p.title}
                href={p.href}
                className="glass glass--hover project-card"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block" }}
              >
                {body}
              </a>
            );
          })}
        </div>
      </section>

      <section className="glass">
        <h2 className="h-with-icon"><Icon name="route" />{t.workJourney}</h2>
        <ol className="timeline">
          {portfolio.journey.map((j) => (
            <li key={j.period}>
              <span className="tl-period">{j.period}</span>
              <h3>{j.role}</h3>
              <span className="tl-org">{j.org}</span>
              <p>{j.note}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
