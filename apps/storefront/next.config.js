/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      // Add real CDN/storage hosts here when product images move off placeholder.
    ],
  },
  // Medusa runs on :9000; storefront on :8000.
  // Public envs (NEXT_PUBLIC_*) are exposed to client-side bundles.
  env: {
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000",
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
    NEXT_PUBLIC_DEFAULT_REGION_CODE: process.env.NEXT_PUBLIC_DEFAULT_REGION_CODE ?? "pl",
  },
}

module.exports = nextConfig
