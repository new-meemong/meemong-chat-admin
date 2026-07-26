import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/latest-model-matching-chat-list",
        permanent: false
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "meemong-job-storage.s3.ap-northeast-2.amazonaws.com"
      },
      {
        hostname: "job-storage.meemong.com"
      }
    ]
  }
};

export default nextConfig;
