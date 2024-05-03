/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/watch",
        destination: "/",
        has: [
          { type: "query", key: "v" },
          { type: "query", key: "list" },
        ],
      },
    ];
  },
};

export default nextConfig;
