import { useEffect, useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site.config";
import { home } from "@/lib/home.config";
import BerlinClock from "@/components/widgets/BerlinClock";
import Icon from "@/components/ui/Icons";
import LiteModeToggle from "@/components/controls/LiteMode";
import { useLiveStatus, StatusDot, StatusPill } from "@/components/widgets/LiveStatus";
import ChangelogDialog from "@/components/content/ChangelogDialog";
import pkg from "../package.json";

import type { InferGetStaticPropsType } from "next";
import fs from "fs";
import path from "path";

export async function getStaticProps() {
  let changelog = "";
  try {
    changelog = fs.readFileSync(path.join(process.cwd(), "public", "changelog.md"), "utf8");
  } catch { }
  return { props: { changelog } };
}

export default function Home({ changelog }: InferGetStaticPropsType<typeof getStaticProps>) {
  const status = useLiveStatus(home.status);
  const [logOpen, setLogOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("changelog-seen")) return;
      const openIt = () => {
        setLogOpen(true);
        localStorage.setItem("changelog-seen", pkg.version);
      };
      if (localStorage.getItem("lite-notice-seen")) {
        openIt();
      } else {
        window.addEventListener("lite-mode-changed", openIt, { once: true });
        return () => window.removeEventListener("lite-mode-changed", openIt);
      }
    } catch { }
  }, []);

  return (
    <>
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
                <dt>
                  <StatusDot state={status} />
                  Status
                </dt>
                <dd>
                  <StatusPill state={status} labels={home.status.labels} />
                </dd>
              </div>
              <div>
                <dt><Icon name="clock" size={15} />Time (Berlin)</dt>
                <dd>
                  <span className="status-pill time-pill">
                    <BerlinClock />
                  </span>
                </dd>
              </div>
              <div>
                <dt><Icon name="tag" size={15} />Site version</dt>
                <dd>
                  <button type="button" className="status-pill version-pill" onClick={() => setLogOpen(true)}>
                    v{pkg.version}
                  </button>
                  <ChangelogDialog open={logOpen} onClose={() => setLogOpen(false)} changelog={changelog} />
                </dd>
                <ChangelogDialog open={logOpen} onClose={() => setLogOpen(false)} changelog={changelog} />
              </div>
              <div>
                <dt>
                  <Icon name="gear" size={15} />
                  Lite mode
                </dt>
                <dd className="dd-row">
                  <LiteModeToggle />
                  <span className="info-tip" tabIndex={0} aria-label="About Lite mode">
                    <Icon name="info" size={17} />
                    <span className="info-tip-bubble" role="tooltip">
                      Turns off animations and transparency effects — recommended for older devices or weak hardware.
                    </span>
                  </span>
                </dd>
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
      <a
        href="https://github.com/itsurboimasarou/thefadedboi"
        target="_blank"
        rel="noopener noreferrer"
        className="footer-art"
        aria-label="Source code"
      >
        <img src="/Sanbina.webp" alt="" />
      </a>
    </>
  );
}
