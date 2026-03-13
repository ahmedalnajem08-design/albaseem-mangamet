import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/whatsapp/railway/:path*',
        destination: 'https://albaseem-whatsapp-production.up.railway.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;
