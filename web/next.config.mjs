import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { externalDir: true },
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config) => {
    config.resolve.alias["@client-seo"] = path.join(__dirname, "../client/src/seo");
    config.resolve.alias["@client-locales"] = path.join(__dirname, "../client/src/locales");
    return config;
  },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  async redirects() {
    return [
      {
        source: "/location-voiture-occasion/:city",
        destination: "/voiture-occasion/:city",
        permanent: true,
      },
      {
        source: "/en/location-voiture-occasion/:city",
        destination: "/en/voiture-occasion/:city",
        permanent: true,
      },
      {
        source: "/ar/location-voiture-occasion/:city",
        destination: "/ar/voiture-occasion/:city",
        permanent: true,
      },
      { source: "/cars/:id", destination: "/acheter/:id", permanent: true },
      { source: "/en/cars/:id", destination: "/en/acheter/:id", permanent: true },
      { source: "/ar/cars/:id", destination: "/ar/acheter/:id", permanent: true },
      { source: "/rentals/:id", destination: "/louer/:id", permanent: true },
      { source: "/en/rentals/:id", destination: "/en/louer/:id", permanent: true },
      { source: "/ar/rentals/:id", destination: "/ar/louer/:id", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: "/images/:path*", destination: "/legacy/images/:path*" }],
      fallback: [{ source: "/:path*", destination: "/legacy/index.html" }],
    };
  },
};

export default nextConfig;
