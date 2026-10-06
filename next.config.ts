import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  // Pin the workspace root (multiple lockfiles exist higher up the tree).
  outputFileTracingRoot: projectRoot,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'static.wixstatic.com' },
      { protocol: 'https', hostname: '*.wixstatic.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.unsplash.com' },
      // Team member photos migrated from the old WordPress site.
      { protocol: 'https', hostname: 'intertoons.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    reactCompiler: false,
  },
  // Service detail pages moved from /services/:slug to root-level /:slug to
  // match the old WordPress URL structure exactly (e.g. /shopify-development).
  async redirects() {
    return [
      { source: '/services/:slug', destination: '/:slug', permanent: true },
      // Portfolio listing moved to /works to match the individual project
      // detail pages (already at /works/:slug).
      { source: '/portfolio', destination: '/works', permanent: true },
      { source: '/portfolio/:slug', destination: '/works/:slug', permanent: true },
      // Slug corrected to match WordPress exactly (custom-shopify-theme-services).
      { source: '/custom-shopify-themes', destination: '/custom-shopify-theme-services', permanent: true },
      // Matches WordPress's own URL + redirect: WP serves the page at
      // /privacypolicy (no hyphen) and 301s /privacy-policy there.
      { source: '/privacy-policy', destination: '/privacypolicy', permanent: true },
    ]
  },
}

export default nextConfig

// Enable Cloudflare bindings (env vars, etc.) during `next dev`.
// Lazily imported so a plain `next build` without OpenNext still works.
if (process.env.NODE_ENV === 'development') {
  void import('@opennextjs/cloudflare')
    .then(({ initOpenNextCloudflareForDev }) => initOpenNextCloudflareForDev?.())
    .catch(() => {})
}
