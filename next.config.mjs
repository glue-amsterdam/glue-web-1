/** @type {import('next').NextConfig} */
const nextConfig = {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "picsum.photos",
    },
  ],
};

export default nextConfig;
