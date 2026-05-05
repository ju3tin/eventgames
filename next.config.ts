import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent Solana packages from being bundled server-side
      config.externals.push(
        '@solana/web3.js',
        '@coral-xyz/anchor',
        '@solana/wallet-adapter-react',
        '@solana/wallet-adapter-react-ui',
        '@solana/wallet-adapter-phantom',
        '@solana/wallet-adapter-solflare',
        '@solana/wallet-adapter-base',
      );
    }

    // Stub out Node built-ins for browser bundle
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs:     false,
      os:     false,
      path:   false,
      crypto: false,
    };

    return config;
  },
};

export default nextConfig;
