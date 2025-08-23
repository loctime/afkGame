/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Configuración para PIXI.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
}

module.exports = nextConfig
