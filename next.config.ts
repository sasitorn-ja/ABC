import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // อนุญาตให้เปิด dev server ผ่าน LAN IP (มือถือในวง Wi-Fi เดียวกัน)
  allowedDevOrigins: ["192.168.1.43"],
};

export default nextConfig;
