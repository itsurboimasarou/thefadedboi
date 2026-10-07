import type { Like } from "../types";
import type { Localized } from "../i18n";

export interface DetailsContent {
  aboutMe: string[];
  facts: {
    currently: string;
    location: string;
  };
  likes: Like[];
}

export const detailsAvatar = "/profile.jpg";
export const detailsSkills = [
  "React / Next.js", "TypeScript", "Python", "Figma",
  "Video editing", "Affinity", "Node.js",
];

export const detailsFacts = {
  birthday: "2004-07-07",
  alias: "masarou, thefadedboi",
};

const en: DetailsContent = {
  aboutMe: [
    "I'm Lê Nhật Lâm a.k.a masarou. I'm currently a freelance photophone, cosplayer, (a bit) designer & also a developer. Living in Vietnam & on the road to study abroad.",
    "I'm not a kind of extroverted person & tend to be a bit faded in the crowd. But I love sharing my thoughts and ideas, especially through my photos and cosplays. My journey started as an all-time love with artistic expression- yes, it is photography, which has been a passion of mine for years and leads to designing and web development.",
    "I do many things, by random, but I do them with a purpose - keep everything simple, but still bring out its own unique soul. I do believe that the small details can make a big difference, and I strive to create experiences that are not only functional but also look delightful.",
    "This place is everything you could find about me - my photo works, cosplays, and my development projects. Hope you enjoy exploring them.",
  ],
  facts: {
    currently: "Looking for a job",
    location: "Ho Chi Minh City, Vietnam",
  },
  likes: [
    {
      label: "Photography",
      text: "Mostly cosplay, or sometimes, street photography — I do love much of the artistry in capturing moments, especially how portraits can tell a story of its precious. ",
    },
    {
      label: "Play games",
      text: "Not much these days but I usually like gacha games; Genshin Impact, Zenless Zone Zero, Wuthering Waves & Arknights: Endfield.",
    },
    {
      label: "Play the piano",
      text: "I do kinda know how to play the piano, but till now I haven't played much. I do love to play some anime OSTs, or some random songs that I like.",
    },
  ],
};

const vi: DetailsContent = {
  aboutMe: [
    "Mình là Lê Nhật Lâm (nickname thường được biết là masarou). Mình đang là 1 photophone tự do, cosplayer, (một chút) designer & cũng như là developer. Sống ở Việt Nam & đang trên con đường chuẩn bị du học.",
    "Bản thân mình không phải là người thật sự hướng ngoại & thường để bản thân mờ nhạt một chút giữa đám đông. Nhưng mình lại khá thích chia sẻ những cảm nghĩ và ý tưởng của mình, đặc biệt là qua những bức ảnh mình chụp và cosplay. Hành trình của mình bắt đầu với một cái tình yêu với cảm xúc nghệ thuật toàn thời gian - đúng rồi đó, nhiếp ảnh, một cái động lực lớn kéo mình theo con đường phát triển web lẫn design.",
    "Mình làm nhiều thứ, theo hứng, nhưng với tiêu chí - giữ cho mọi thứ được đơn giản, nhưng vẫn phải có cái hồn của nó. Mình tin rằng một chi tiết nhỏ cũng có thể làm nên một thay đổi lớn, và cũng như cố gắng một trải nghiệm không chỉ dừng lại ở việc nó chạy mà nó cũng phải nhìn có sự thú vị.",
    "Đây là nơi bạn có thể tìm thấy tất tần tật mọi thứ về mình - những bức ảnh mình chụp, cosplays & những dự ánh đang phát triển của mình. Mình hy vọng bạn sẽ tận hưởng khám phá chúng.",
  ],
  facts: {
    currently: "Đang tìm việc",
    location: "Hồ Chí Minh, Việt Nam",
  },
  likes: [
    {
      label: "Chụp ảnh",
      text: "Mình chủ yếu thích chụp cosplay, hoặc thỉnh thoảng chụp street. Mình thích cái nghệ thuật những khoảnh khắc chụp, nhất là khi một tấm chân dung có thể kể 1 câu chuyện đẹp đẽ nhất mà nó có",
    },
    {
      label: "Chơi game",
      text: "Lúc này thì không nhiều nhưng mình thường thích chơi mấy game gacha kiểu như: Genshin Impact, Zenless Zone Zero, Wuthering Waves & Arknights: Endfield.",
    },
    {
      label: "Chơi piano",
      text: "Mình là người rất thích chơi piano nhưng đến hiện tại thì mình cũng không chơi nhiều, thường mình chơi 1 số bài ngẫu nhiên mình thích hoặc vài OST trong anime.",
    },
  ],
};

export const details: Localized<DetailsContent> = { en, vi };
