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
  },
  images: {
    domains: ["meemong-job-storage.s3.ap-northeast-2.amazonaws.com"]
  }
};

export default nextConfig;
