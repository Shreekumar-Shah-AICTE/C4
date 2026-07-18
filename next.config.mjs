/**
 * Next.js configuration.
 *
 * `reactStrictMode` surfaces unsafe lifecycles during development. The
 * `poweredByHeader` is disabled so the server never advertises its stack, and
 * security headers are centralised in `src/middleware.ts` so every route —
 * including static assets — inherits the same hardened policy.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  eslint: {
    // Linting is enforced as a dedicated, stricter CI step (`npm run lint`),
    // not during `next build`, so the two never diverge.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
