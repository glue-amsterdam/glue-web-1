/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
          : "localhost",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 2678400,
    formats: ["image/webp"],
  },
};
export default nextConfig;
