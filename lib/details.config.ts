import type { Like } from "./types";

export const details = {
  avatar: "/profile.png",
  aboutMe: [
    "I'm Lê Nhật Lâm a.k.a thefadedboi (or masarou for mostly in gaming). I'm currently a freestyle photophoner, and a part-time designer-developer hybrid. Living in Vietnam & on the road to study abroad.",
    "Not a kind of extrovert person, as my nicknamed already shows, I tend to be a bit faded in the crowd. But what I do love is to share my thoughts and ideas with the world, especially through my photoworks and cosplays. My journey started as the all-time love with artistic expression, yes, is photophone, which has been a passion of mine for years and leads to design and web development.",
    "I do random things, but I do them with a purpose. Keep everything simple, calm, but able to bring out its own soul of uniqueness. I do believe that the small details can make a big difference, and I strive to create experiences that are not only functional but also look delightful.",
    "This place is everything you could find about me - my photoworks, cosplays, to my development projects. Hope you enjoy exploring it as much as I enjoyed creating it.",
  ],
  facts: {
    birthday: "2004-07-07",
    alias: "masarou, thefadedboi",
    currently: "Looking for a job",
    location: "Ho Chi Minh City, Vietnam",
  },
  skills: [
    "React / Next.js", "TypeScript", "Python", "Figma",
    "Video editing", "Affinity", "Node.js",
  ],
  likes: [
    {
      label: "Photography",
      text: "Mostly cosplay, or sometimes, street photography — I do love much of the artistry in capturing moments, especially how portraits can tell a story of a cosplay. ",
    },
    {
      label: "Play games",
      text: "Not much these days but I'm kinda low-key guy who like gacha games; Genshin, HSR, ZZZ, WuWa.",
    },
    {
      label: "Play the piano",
      text: "I do kinda know how to play the piano, but till now I haven't played much. I do love to play some anime OSTs, or some random songs that I like.",
    },
  ] as Like[],
};
