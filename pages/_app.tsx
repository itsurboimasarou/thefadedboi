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
import Snowfall from "@/components/layout/Snowfall";

const display = Work_Sans({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap", variable: "--font-display" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-body" });

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
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <symbol id="flake-glyph" viewBox="0 0 24 24">
            <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none">
              <path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7" />
              <path d="M12 5.5 9.6 7.8M12 5.5l2.4 2.3M12 18.5l-2.4-2.3M12 18.5l2.4-2.3" />
              <path d="m6.6 9 .3 3.2M6.6 9 3.6 9.9M17.4 15l-.3-3.2M17.4 15l3-.9" />
              <path d="m6.6 15-.3-3.2M6.6 15l-3-.9M17.4 9l.3 3.2M17.4 9l3 .9" />
            </g>
          </symbol>
        </svg>
        <Snowfall />
        <div className="snow-ground" aria-hidden="true" />
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
