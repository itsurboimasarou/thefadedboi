import { Html, Head, Main, NextScript } from "next/document";

const themeInit = `(function(){try{if(localStorage.getItem("lite-mode")==="1")document.documentElement.classList.add("lite-mode");if(localStorage.getItem("oled-mode")==="1")document.documentElement.classList.add("oled");if(localStorage.getItem("snow")==="0")document.documentElement.classList.add("no-snow");if(localStorage.getItem("snow-fancy")==="1")document.documentElement.classList.add("snow-fancy");}catch(e){};try{var t=localStorage.getItem("theme");if(!t)t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="dark";}})();`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
