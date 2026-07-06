import Link from "next/link";
import { site } from "../lib/site.config";
import { home } from "../lib/home.config";
import BerlinClock from "../components/BerlinClock";
import Icon from "../components/Icons";
import pkg from "../package.json";

export default function Home() {
  return (
    <div className="stack reveal">
      <section className="hero">
        <p className="eyebrow">{home.eyebrow}</p>
        <h1>
          Hi, I&apos;m <span className="gradient-text">{site.name}</span>.
        </h1>
        <p style={{ fontSize: "1.15rem", marginTop: 16, maxWidth: "100ch" }}>
          {site.role}. {site.tagline}
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
          <Link href="/portfolio" className="btn">View my work</Link>
          <Link href="/contacts" className="btn btn--ghost">Get in touch</Link>
        </div>
      </section>

      <section className="grid grid--2">
        <div className="glass glass--hover">
          <h2 className="h-with-icon"><Icon name="user" />Quick shorts</h2>
          <p>{home.quickShorts}</p>
          <p style={{ marginTop: 12 }}>
            <Link href="/about">More details →</Link>
          </p>
        </div>
        <div className="glass glass--hover">
          <h2 className="h-with-icon"><Icon name="spark" />At a glance</h2>
          <dl className="fact-grid glance-grid">
            <div>
              <dt>Status</dt>
              <dd>
                <span className="status">
                  <span className={`status-dot status-dot--${home.status.state}`} aria-hidden="true" />
                  {home.status.label}
                </span>
              </dd>
            </div>
            <div>
              <dt>Time (Berlin, GMT +1:00)</dt>
              <dd><BerlinClock /></dd>
            </div>
            <div>
              <dt>Site version</dt>
              <dd>v{pkg.version}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="glass glass--hover blog-card">
        <div>
          <h2 className="h-with-icon"><Icon name="blog" />{home.blog.title}</h2>
          <p style={{ maxWidth: "70ch" }}>{home.blog.description}</p>
        </div>
        <a href={home.blog.url} target="_blank" rel="noopener noreferrer" className="btn">
          Visit the blog →
        </a>
      </section>
    </div>
  );
}
