import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/latest-chat-list",
        permanent: false
      }
    ];
  }
};

export default nextConfig;
