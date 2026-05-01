import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "http://192.168.150.1:3001","http://localhost:3001"
  ],
};

export default nextConfig;
