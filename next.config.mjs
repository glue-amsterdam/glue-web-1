/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["favored-selenitic-vincenzo.ngrok-free.dev"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
          : "localhost",
        pathname: "/**",
      },
      /* {
        protocol: "https",
        hostname: "bumddsksnesgvbkgmjxa.supabase.co",
        pathname: "/storage/v1/object/public/**",
      } */
    ],
    minimumCacheTTL: 2678400,
    formats: ["image/avif", "image/webp"],
  },
};
export default nextConfig;
