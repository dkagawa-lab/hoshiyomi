import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.151.88", "192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
  reactCompiler: false,
  async redirects() {
    return [
      // SNSプロフィール用の短縮リンク。utm付きでLPへ転送する。
      { source: "/ig", destination: "/lp/self?utm_source=instagram&utm_medium=bio", permanent: false },
      { source: "/fb", destination: "/lp/self?utm_source=facebook&utm_medium=bio", permanent: false },
      { source: "/x", destination: "/lp/self?utm_source=x&utm_medium=bio", permanent: false },
      { source: "/tt", destination: "/lp/self?utm_source=tiktok&utm_medium=bio", permanent: false }
    ];
  }
};

export default nextConfig;
