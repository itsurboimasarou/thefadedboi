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
import { site as siteConfig, siteName, siteHandle, siteFooter, siteGithub } from "@/lib/configs/site.config";
import { useLocalized } from "@/lib/i18n";
import LiteNotice from "@/components/controls/LiteNotice";
import PageLoader from "@/components/layout/PageLoader";
import useTipFit from "@/lib/functions/useTipFit";
import ControlPanel from "@/components/layout/ControlPanel";
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
  useTipFit();
  const site = useLocalized(siteConfig);
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
        <meta name="description" content={site.tagline} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/avatar.ico" />
      </Head>
      <div id="orb-field" className="orb-field" aria-hidden="true" />
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
      <HuBar />
      <ControlPanel changelog={changelog} />
      <LiteNotice />
      <PageLoader />
    </div>
  );
}
