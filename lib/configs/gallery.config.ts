import type { Localized } from "../i18n";
import { siteName } from "./site.config";

export interface GalleryQuote {
  text: Localized<string>;
  by?: Localized<string>;
}

export const galleryQuotes: GalleryQuote[] = [
  {
    text: {
      en: "Every frame here is a moment that refused to be forgotten.",
      vi: "Mỗi khung hình ở đây là một khoảnh khắc không chịu bị lãng quên.",
    },
    by: {
      en: ".",
      vi: "."
    }
  },
  {
    text: {
      en: "A photo is just light, stubborn enough to stay.",
      vi: "Một tấm ảnh chỉ là ánh sáng, đủ bướng bỉnh để ở lại.",
    },
    by: {
      en: ".",
      vi: "."
    }
  },
  {
    text: {
      en: "I don't keep these to remember what happened, but how it felt.",
      vi: "Mình giữ những tấm này không phải để nhớ chuyện gì đã xảy ra, mà để nhớ cảm giác lúc đó.",
    },
    by: {
      en: ".",
      vi: "."
    }
  },
  {
    text: {
      en: "The best shots are the ones I almost didn't take.",
      vi: "Những tấm đẹp nhất thường là những tấm mình suýt không bấm máy.",
    },
    by: {
      en: ".",
      vi: "."
    }
  }
];
