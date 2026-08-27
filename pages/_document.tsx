import { Html, Head, Main, NextScript } from "next/document";

const themeInit = `(function(){try{if(localStorage.getItem("lite-mode")==="1")document.documentElement.classList.add("lite-mode");if(localStorage.getItem("snow")==="0")document.documentElement.classList.add("no-snow");if(localStorage.getItem("glass-fx")==="1")document.documentElement.classList.add("glass-fx");}catch(e){};try{var t=localStorage.getItem("theme");if(!t)t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="dark";}try{var A={anemo:["#6fd6b4","#a8ecd6","#06291f"],geo:["#e8b74a","#f5d68f","#3a2600"],electro:["#b385e0","#d9c2f5","#26123d"],dendro:["#a8d64a","#d0ec97","#1f2b06"],hydro:["#4cc3f0","#a3e4f7","#052a3a"],pyro:["#f0784a","#f7ac8c","#3a1206"],cryo:["#9be7ec","#d3f5f7","#062b2d"]};var a=A[localStorage.getItem("accent-element")];if(a){var s=document.documentElement.style;s.setProperty("--accent-custom",a[0]);s.setProperty("--accent-soft-custom",a[1]);s.setProperty("--accent-contrast-custom",a[2]);}}catch(e){};try{var l=localStorage.getItem("logo-custom");if(l)document.documentElement.style.setProperty("--logo-custom","url(/logo/"+l+")");}catch(e){}})();`;

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
