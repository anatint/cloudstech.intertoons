import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getSiteSettings, getContactHref } from '@/lib/settings'

export const revalidate = 3600

/* Slugs that are listing-page config entries in Site Pages, not standalone /[slug] pages. */
const LISTING_SLUGS = new Set(['home', 'services', 'products', 'portfolio', 'case-studies', 'blog'])

export async function GET() {
  const payload = await getPayload()
  const settings = await getSiteSettings()
  const contactHref = await getContactHref()
  const base = (settings.baseUrl || 'https://intertoons.com').replace(/\/$/, '')

  const opts = { where: { status: { equals: 'published' } }, limit: 500 } as const
  const [services, products, projects, caseStudies, blogs, industries, pages] = await Promise.all([
    payload.find({ collection: 'services', ...opts }).then((r) => r.docs as any[]),
    payload.find({ collection: 'products', ...opts }).then((r) => r.docs as any[]),
    payload.find({ collection: 'projects', ...opts }).then((r) => r.docs as any[]),
    payload.find({ collection: 'case-studies', ...opts }).then((r) => r.docs as any[]),
    payload.find({ collection: 'blogs', ...opts }).then((r) => r.docs as any[]),
    payload.find({ collection: 'industries', ...opts }).then((r) => r.docs as any[]),
    payload.find({ collection: 'pages', ...opts }).then((r) => r.docs as any[]),
  ])

  const entries: { path: string; lastmod?: string; priority: number }[] = [
    { path: '/', priority: 1.0 },
    { path: '/services', priority: 0.9 },
    { path: '/products', priority: 0.9 },
    { path: '/works', priority: 0.9 },
    { path: '/case-studies', priority: 0.9 },
    { path: '/blog', priority: 0.8 },
    { path: '/about-us', priority: 0.6 },
    { path: '/team', priority: 0.5 },
    { path: contactHref, priority: 0.6 },
    { path: '/request-a-quote', priority: 0.7 },
  ]

  const iso = (v: any): string | undefined => {
    if (!v) return undefined
    const dt = new Date(v)
    return isNaN(dt.getTime()) ? undefined : dt.toISOString().slice(0, 10)
  }
  const add = (list: any[], prefix: string, priority: number) => {
    for (const d of list) if (d.slug) entries.push({ path: `${prefix}/${d.slug}`, lastmod: iso(d._updatedDate), priority })
  }
  add(services, '/services', 0.8)
  add(products, '/products', 0.8)
  add(projects, '/works', 0.7)
  add(caseStudies, '/case-studies', 0.7)
  add(blogs, '/blog', 0.6)
  add(industries, '/industries', 0.5)
  // Standalone CMS pages (Site Pages) that aren't listing-config entries
  for (const d of pages) {
    if (d.slug && !LISTING_SLUGS.has(d.slug)) {
      entries.push({ path: `/${d.slug}`, lastmod: iso(d._updatedDate), priority: 0.6 })
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${base}${e.path}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
