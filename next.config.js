/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The 8 sample PDFs + form-maps are read from disk at runtime by the
  // extraction + forms engines; make sure they are traced into the serverless
  // bundle (Next 14.2 keeps this under `experimental`).
  experimental: {
    outputFileTracingIncludes: {
      "/api/**": ["./samples/**", "./forms/**"],
    },
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
