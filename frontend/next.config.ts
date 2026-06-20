import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  allowedDevOrigins: [
    "http://192.168.150.1:3001",
    "http://localhost:3001",
  ],
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true', // Solo se activa si la variable de entorno es 'true'
})


module.exports = withBundleAnalyzer(nextConfig)

