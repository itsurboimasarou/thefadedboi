// CSS
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/background.css";
import "@/styles/layout.css";
import "@/styles/components.css";
import "@/styles/pages.css";
import "@/styles/modes.css";

// Layout Components
import Head from "next/head"
import { useEffect } from "react";
import { Work_Sans, IBM_Plex_Sans } from "next/font/google";
import TopBar from "@/components/layout/TopBar";
import NavRail from "@/components/layout/NavRail";
import { site } from "@/lib/site.config";
import MeshBackground from "@/components/layout/MeshBackground";
import LiteNotice from "@/components/controls/LiteNotice";

const display = Work_Sans({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap", variable: "--font-display" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-body" });

const WAVE_PATH =
  "M0,192 C240,120 480,120 720,192 C960,264 1200,264 1440,192 C1680,120 1920,120 2160,192 C2400,264 2640,264 2880,192 L2880,320 L0,320 Z";

export default function App({ Component, pageProps }) {
  
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
        <div className="fluid" aria-hidden="true">
          <span className="fluid-blob fluid-blob--a" />
          <span className="fluid-blob fluid-blob--b" />
          <span className="fluid-blob fluid-blob--c" />
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
    </div>
  );
}
