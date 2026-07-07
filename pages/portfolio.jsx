import { portfolio } from "../lib/portfolio.config";
import Icon from "../components/Icons";

export default function Portfolio() {
  return (
    <div className="stack reveal">
      <header>
        <p className="eyebrow">Portfolio</p>
        <h1>Highlights</h1>
      </header>

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
        <h2 className="h-with-icon"><Icon name="route" />Work journey</h2>
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
