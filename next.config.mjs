/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,

    remotePatterns: [
      { protocol: "https", hostname: "cdn.jsdelivr.net", pathname: "/gh/itsurboimasarou/**" },
    ],  
  },
};
export default nextConfig;