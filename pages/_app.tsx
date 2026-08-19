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
import { Work_Sans, IBM_Plex_Sans, Momo_Signature } from "next/font/google";
import TopBar from "@/components/layout/TopBar";
import NavRail from "@/components/layout/NavRail";
import { site } from "@/lib/site.config";
import LiteNotice from "@/components/controls/LiteNotice";
import PageLoader from "@/components/layout/PageLoader";
import Snowfall from "@/components/layout/Snowfall";
import ControlPanel from "@/components/layout/ControlPanel";
import { snowPaths } from "@/components/ui/Icons";

const display = Work_Sans({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap", variable: "--font-display" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-body" });
const script = Momo_Signature({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-script" });

export default function App({ Component, pageProps }: AppProps) {
  const changelog: string = (pageProps as { changelog?: string }).changelog ?? "";

  useEffect(() => {
    document.body.classList.add(display.variable, body.variable, script.variable);
    return () => document.body.classList.remove(display.variable, body.variable, script.variable);
  }, []);

  return (
    <div className={`app-root ${display.variable} ${body.variable} ${script.variable}`}>
      <Head>
        <title>{`${site.name}`}</title>
        <meta name="description" content={site.tagline} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </Head>
      <div className="orb-field" aria-hidden="true">
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <symbol id="flake-glyph" viewBox="0 0 24 24">
            <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none">
              {snowPaths}
            </g>
          </symbol>
        </svg>
        <Snowfall />
      </div>
      <TopBar />
      <div className="shell">
        <main className="main">
          <Component {...pageProps} />
          <footer className="footer">{site.footer}</footer>
        </main>
      </div>
      <NavRail />
      <ControlPanel changelog={changelog} />
      <LiteNotice />
      <PageLoader />
    </div>
  );
}
