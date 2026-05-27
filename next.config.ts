import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.151.88", "192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
  reactCompiler: false
};

export default nextConfig;
