/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365,

    remotePatterns: [
      { protocol: "https", hostname: "cdn.thefadedboi.me", pathname: "/**" },
    ],  
  },
  devIndicators: false
};
export default nextConfig;