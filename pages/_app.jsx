import "../styles/globals.css";
import Head from "next/head";
import { Work_Sans, IBM_Plex_Sans } from "next/font/google";
import TopBar from "../components/TopBar";
import NavRail from "../components/NavRail";
import { site } from "../lib/site.config";
import MeshBackground from "../components/MeshBackground";

const display = Work_Sans({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap", variable: "--font-display" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-body" });

const WAVE_PATH =
  "M0,192 C240,120 480,120 720,192 C960,264 1200,264 1440,192 C1680,120 1920,120 2160,192 C2400,264 2640,264 2880,192 L2880,320 L0,320 Z";

export default function App({ Component, pageProps }) {
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
        <div className="waves">
          {["wave-1", "wave-2", "wave-3"].map((cls, i) => (
            <svg key={cls} className={cls} viewBox="0 0 2880 320" preserveAspectRatio="none" style={{ bottom: i * 26 }}>
              <path fill="currentColor" d={WAVE_PATH} />
            </svg>
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
    </div>
  );
}
