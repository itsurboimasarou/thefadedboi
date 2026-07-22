import type { GallerySection } from "./types";

export const gallery: { sections: GallerySection[] } = {
  sections: [
    {
      kind: "banner",
      title: "Achievements",
      description: "Certificates and things I'm quietly proud of.",
      folder: "achievements",
      bannerText: "These came from the work — the projects behind them live in my portfolio.",
      ctaLabel: "View my portfolio →",
      ctaHref: "/portfolio",
    },
    {
      kind: "events",
      title: "Cosplays",
      description: "All the cosplay photos I took, to see the full albums, click on the event name or the “See more” button.",
      events: [
        { name: "Hobby Horizon: Singularity", year: 2026, folder: "cosplays/hh26", googlePhotosUrl: "https://photos.app.goo.gl/NA" },
        { name: "Japan Wave 20 (12/07)", year: 2026, folder: "cosplays/jw20", googlePhotosUrl: "https://photos.app.goo.gl/TwAn8oUa8JCniP9t6" },
        { name: "Minna Festival (31/05)", year: 2026, folder: "cosplays/minna-2026", googlePhotosUrl: "https://photos.app.goo.gl/spvgxQV71aosCcP79" },
      ],
    },
    {
      kind: "events",
      title: "Tsuwii cosplays",
      description: "All the cosplay photos I took, to see the full albums, click on the event name or the “See more” button.",
      events: [
        { name: "Lumine (Detective)", year: 2026, folder: "cosplays/tsuwii/lumine-dtt", googlePhotosUrl: "https://photos.app.goo.gl/NA" },
        { name: "Asuka (Rock band)", year: 2026, folder: "cosplays/tsuwii/asuka-rb", googlePhotosUrl: "https://photos.app.goo.gl/NA" },
      ],
    },
    {
      kind: "simple",
      title: "Street & Foods",
      description: "Simple as it name, I took whatever it is on the street, or foods that I love to eat.",
      folder: "street",
      googlePhotosUrl: "https://photos.app.goo.gl/Street",
    },
  ],
};