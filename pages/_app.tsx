// CSS
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/background.css";
import "@/styles/layout.css";
import "@/styles/components.css";
import "@/styles/pages.css";
import "@/styles/modes.css";

// Layout Components
import Head from "next/head";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Work_Sans, IBM_Plex_Sans } from "next/font/google";
import TopBar from "@/components/layout/TopBar";
import NavRail from "@/components/layout/NavRail";
import { site } from "@/lib/site.config";
import MeshBackground from "@/components/layout/MeshBackground";
import LiteNotice from "@/components/controls/LiteNotice";
import PageLoader from "@/components/layout/PageLoader";

const display = Work_Sans({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap", variable: "--font-display" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-body" });

/* Star lanes are computed ONCE at module scope, not on every render.
   Deterministic (prime-stepped, not Math.random) so SSR and the client
   produce identical markup — no hydration mismatch. */
const STARS = Array.from({ length: 24 }, (_, i) => ({
  top: `${Math.round((i * 37) % 60)}%`,
  left: `${Math.round(30 + ((i * 53) % 70))}%`,
  animationDuration: `${5 + (i % 5) * 0.7}s`,
  animationDelay: `${(i * 1.7) % 20}s`,
}));

export default function App({ Component, pageProps }: AppProps) {
  
  useEffect(() => {
    document.body.classList.add(display.variable, body.variable);
    return () => document.body.classList.remove(display.variable, body.variable);
  }, []);

  return (
    <div className={`app-root ${display.variable} ${body.variable}`}>
      <Head>
        <title>{`${site.name}`}</title>
        <meta name="description" content={site.tagline} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </Head>
      <div className="orb-field" aria-hidden="true">
        <MeshBackground />
        <div className="sky" aria-hidden="true">
          <span className="moon" />
          {STARS.map((s, i) => (
            <span key={i} className="star" style={s} />
          ))}
        </div>
      </div>
      <TopBar />
      <div className="shell">
        <main className="main">
          <Component {...pageProps} />
          <footer className="footer">{site.footer}</footer>
        </main>
      </div>
      <NavRail />
      <LiteNotice />
      <PageLoader />
    </div>
  );
}
