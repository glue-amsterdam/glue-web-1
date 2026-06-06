/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["favored-selenitic-vincenzo.ngrok-free.dev"],
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
