import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 本番環境のみ standalone モード有効化
  ...(process.env.NODE_ENV === 'production' ? { output: "standalone" } : {}),
  // pino をバンドル対象から除外し、Node.js 側で直接読み込ませる
  serverExternalPackages: ['pino', 'thread-stream'],
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,         // 1秒ごとにファイルをチェック
        aggregateTimeout: 300, // 変更後に再構築を開始するまでの遅延
      };
    }
    return config;
  },
  turbopack: {}
};

export default nextConfig;
