/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    qualities: [60, 75, 80],

    remotePatterns: [
      { protocol: "https", hostname: "cdn.thefadedboi.me", pathname: "/**" },
    ],

    localPatterns: [
      { pathname: "/**", search: "" },
      { pathname: "/api/thumb" },
    ],
  },
  devIndicators: false
};
export default nextConfig;