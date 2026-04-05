import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Allow dev HMR when opening the site by LAN IP (e.g. phone on same Wi‑Fi). */
  allowedDevOrigins: ["192.168.1.6"],
};

export default nextConfig;
