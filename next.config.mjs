/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-icons",
    ],
  },
  async headers() {
    return [
      {
        source: "/lausanne.woff2",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/dashboard/:userId/create-events",
        destination: "/dashboard/:userId/events/new",
        permanent: true,
      },
      {
        source: "/dashboard/:userId/your-events",
        destination: "/dashboard/:userId/events",
        permanent: true,
      },
      {
        source: "/dashboard/:userId/hub-create",
        destination: "/dashboard/:userId/hubs/new",
        permanent: true,
      },
      {
        source: "/dashboard/:userId/hub-edit",
        destination: "/dashboard/:userId/hubs",
        permanent: true,
      },
      {
        source: "/dashboard/:userId/create-route",
        destination: "/dashboard/:userId/routes/new",
        permanent: true,
      },
      {
        source: "/dashboard/:userId/edit-routes",
        destination: "/dashboard/:userId/routes",
        permanent: true,
      },
      {
        source: "/events",
        destination: "/program",
        permanent: true,
      },
      {
        source: "/admin/sticky-groups",
        destination: "/admin/yearly-content?section=sticky",
        permanent: true,
      },
      {
        source: "/admin/year-numbers",
        destination: "/admin/yearly-content?section=year-numbers",
        permanent: true,
      },
      {
        source: "/admin/citizens-of-honour",
        destination: "/admin/yearly-content?section=citizens",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
          : "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_MEDIA_BASE_URL
          ? new URL(process.env.NEXT_PUBLIC_MEDIA_BASE_URL).hostname
          : "localhost",
        pathname: "/**",
      }
    ],
    minimumCacheTTL: 2678400,
    formats: ["image/avif", "image/webp"],
  },
};
export default nextConfig;
