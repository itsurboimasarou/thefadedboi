import { portfolio as portfolioConfig } from "@/lib/configs/portfolio.config";
import { useLocalized, type Localized } from "@/lib/i18n";
import LinkBanner from "@/components/content/LinkBanner";
import Icon from "@/components/ui/Icons";
import { getChangelog } from "@/lib/assets";

export async function getStaticProps() {
  return { props: { changelog: await getChangelog() }, revalidate: 300 };
}

const ui: Localized<{ heading: string; workJourney: string }> = {
  en: { heading: "Highlights", workJourney: "Work journey" },
  vi: { heading: "Điểm nhấn", workJourney: "Work journey" },
};

export default function Portfolio() {
  const portfolio = useLocalized(portfolioConfig);
  const t = useLocalized(ui);
  return (
    <div className="stack reveal">
      <header>
        <p className="eyebrow">Portfolio</p>
        <h1>{t.heading}</h1>
      </header>

      <LinkBanner {...portfolio.banner} />

      <section className="grid grid--2">
        {portfolio.projects.map((p) => {
          const isPrivate = p.visibility === "private";

          const body = (
            <>
              <h3 style={{ color: "var(--ink)", marginBottom: 8 }}>{p.title}</h3>
              <p style={{ marginBottom: 14 }}>{p.description}</p>
              <div>
                <span className={`vis-tag vis-tag--${p.visibility}`}>{p.visibility}</span>
                {p.tags.map((t) => <span className="chip" key={t}>{t}</span>)}
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
