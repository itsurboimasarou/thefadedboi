// CSS
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/background.css";
import "@/styles/layout.css";
import "@/styles/components.css";
import "@/styles/pages.css";
import "@/styles/modes.css";

import Head from "next/head";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Work_Sans, IBM_Plex_Sans, Momo_Signature, Space_Grotesk } from "next/font/google";
import HuBar from "@/components/layout/HuBar";
import TopBar from "@/components/layout/TopBar";
import NavPill from "@/components/layout/NavPill";
import { useBarMode } from "@/components/controls/BarMode";
import { siteName, siteHandle, siteFooter, siteGithub, siteUrl, siteBanner, siteDescription } from "@/lib/configs/site.config";
import ImportantNotice from "@/components/controls/ImportantNotice";
import PageLoader from "@/components/layout/PageLoader";
import useTips from "@/lib/functions/useTips";
import ControlPanel from "@/components/layout/ControlPanel";
import ShootingStars from "@/components/layout/ShootingStars";
import { LangProvider } from "@/components/controls/LangSwitch";
import PageStackTransition from "@/components/layout/PageStackTransition";

const display = Work_Sans({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap", variable: "--font-display" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-body" });
const script = Momo_Signature({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-script" });
const mono = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], display: "swap", variable: "--font-lang" });

export default function App(props: AppProps) {
  return (
    <LangProvider>
      <PageStackTransition>
        <AppShell {...props} />
      </PageStackTransition>
    </LangProvider>
  );
}

function AppShell({ Component, pageProps }: AppProps) {
  useTips();
  const barMode = useBarMode();
  const changelog: string = (pageProps as { changelog?: string }).changelog ?? "";
  const [footerPre, footerPost] = siteFooter.split(siteHandle);

  useEffect(() => {
    document.body.classList.add(display.variable, body.variable, script.variable, mono.variable);
    return () => document.body.classList.remove(display.variable, body.variable, script.variable, mono.variable);
  }, []);

  return (
    <div className={`app-root ${display.variable} ${body.variable} ${script.variable} ${mono.variable}`}>
      <Head>
        <title>{`${siteName}`}</title>
        <meta name="description" content={siteDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/avatar.ico" />

        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:site_name" property="og:site_name" content={siteName} />
        <meta key="og:title" property="og:title" content={siteName} />
        <meta key="og:description" property="og:description" content={siteDescription} />
        <meta key="og:url" property="og:url" content={siteUrl} />
        <meta key="og:locale" property="og:locale" content="en_US" />
        <meta key="og:image" property="og:image" content={siteBanner.url} />
        <meta key="og:image:width" property="og:image:width" content={String(siteBanner.width)} />
        <meta key="og:image:height" property="og:image:height" content={String(siteBanner.height)} />
        <meta key="og:image:alt" property="og:image:alt" content={siteName} />
        <meta key="twitter:card" name="twitter:card" content="summary_large_image" />

        <meta name="theme-color" content="#6fd6b4" />
      </Head>
      <div id="orb-field" className="orb-field" aria-hidden="true">
        <div className="wash" />
        <ShootingStars />
      </div>
      <div className="shell">
        <main className="main">
          <Component {...pageProps} />
          <footer className="footer">
            {footerPre}
            <a href={siteGithub} target="_blank" rel="noopener noreferrer">{siteHandle}</a>
            {footerPost}
          </footer>
        </main>
      </div>
      {barMode === "split" ? (
        <>
          <TopBar />
          <NavPill />
        </>
      ) : (
        <HuBar />
      )}
      <ControlPanel changelog={changelog} />
      <ImportantNotice />
      <PageLoader />
    </div>
  );
}
