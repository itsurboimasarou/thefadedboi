import { useEffect, useRef, useState } from "react";
import StackLink from "@/components/layout/StackLink";
import { site as siteConfig, siteName } from "@/lib/configs/site.config";
import { homeEyebrow } from "@/lib/configs/home.config";
import { useLocalized } from "@/lib/i18n";
import { homePageUi as ui } from "@/lib/ui-strings";
import { getChangelog } from "@/lib/changelog";
import VideoBackground from "@/components/layout/VideoBackground";
import Icon from "@/components/ui/Icons";

export async function getStaticProps() {
  return { props: { changelog: await getChangelog() }, revalidate: 300 };
}

export default function Home() {
  const site = useLocalized(siteConfig);
  const t = useLocalized(ui);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [titleW, setTitleW] = useState<number | null>(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const measure = () => setTitleW(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("no-scroll");
    return () => document.documentElement.classList.remove("no-scroll");
  }, []);

  return (
    <>
      <VideoBackground />
      <section className="hero hero--bottom reveal">
        <p className="eyebrow">{homeEyebrow}</p>
        <h1 ref={titleRef} className="hero-title">
          {t.greeting} <span className="gradient-text">{siteName}</span>
        </h1>
        <p
          className="hero-copy"
          style={titleW ? { maxWidth: titleW } : undefined}
        >
          {site.tagline}
        </p>
        <div className="hero-actions">
          <StackLink href="/gallery" className="btn">
            <Icon name="image" size={18} />
            {t.viewGallery}
          </StackLink>
          <StackLink href="/about" className="btn btn--ghost">
            <Icon name="user" size={18} />
            {t.aboutMe}
          </StackLink>
        </div>
      </section>
    </>
  );
}
