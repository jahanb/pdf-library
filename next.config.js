/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/pdf', // Add your desired base path here
  // Remove assetPrefix temporarily to test
  // assetPrefix: '/your-app-name',
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
};

module.exports = nextConfig;
