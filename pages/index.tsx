import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site.config";
import { home } from "@/lib/home.config";
import { getChangelog } from "@/lib/assets";
import VideoBackground from "@/components/layout/VideoBackground";

export async function getStaticProps() {
  return { props: { changelog: await getChangelog() }, revalidate: 300 };
}

export default function Home() {
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
        <p className="eyebrow">{home.eyebrow}</p>
        <h1 ref={titleRef} className="hero-title">
          Hi, I&apos;m <span className="gradient-text">{site.name}</span>
        </h1>
        <p
          className="hero-copy"
          style={titleW ? { maxWidth: titleW } : undefined}
        >
          {site.role}. {site.tagline}
        </p>
        <div className="hero-actions">
          <Link href="/gallery" className="btn">View my gallery →</Link>
          <Link href="/about" className="btn btn--ghost">About me</Link>
        </div>
      </section>
    </>
  );
}
