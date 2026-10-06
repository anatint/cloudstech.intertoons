import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import CallbackWidget from '@/components/CallbackWidget'
import { getPayload } from '@/lib/payload'
import { getSiteSettings, getContactHref } from '@/lib/settings'
import { buildOrganizationJsonLd } from '@/lib/seo'
import '../../globals.css'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-sans', display: 'swap' })
// Hero/banner subheadings use Inter specifically (distinct from the site's
// primary Space Grotesk), exposed as the `font-inter` Tailwind utility.
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-inter', display: 'swap' })

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return {
    metadataBase: new URL(s.baseUrl || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
    // A plain string, not a `{ template }` object — every page's own seoTitle is
    // treated as final (matching the WordPress site's <title> tags byte-for-byte),
    // not appended with the site name. This value only applies when a page sets
    // no title of its own at all (Next.js metadata merging keeps the parent's
    // title unless a child page overrides it).
    title: s.defaultSeoTitle || s.siteName,
    description: s.defaultSeoDescription,
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload()

  const settings = await getSiteSettings()
  const contactHref = await getContactHref()

  let navData: any = null
  let footerData: any = null
  let services: any[] = []
  let products: any[] = []
  let projects: any[] = []
  let caseStudies: any[] = []
  let industries: any[] = []
  let technologies: any[] = []

  try {
    navData = await payload.findGlobal({ slug: 'navigation' })
  } catch {
    /* fallback to static nav */
  }
  try {
    footerData = await payload.findGlobal({ slug: 'footer' })
  } catch {
    /* fallback to static footer */
  }
  try {
    // Drives the header mega-menus from the CMS (new entries appear automatically).
    const opts = { where: { status: { equals: 'published' } }, sort: 'order', limit: 12, depth: 0 } as const
    ;[services, products, projects, caseStudies, industries, technologies] = await Promise.all([
      // Services menu is grouped by category (not a fixed two-column split), so it
      // needs a much higher limit — otherwise services beyond the cutoff silently
      // disappear from the menu as more get added. `showInMenu: false` marks
      // services that must stay reachable by direct URL (and in sitemap.xml)
      // without appearing in browsing UI — used for the bulk WordPress-import
      // migration, so those pages behave the same as they did on the old site.
      payload.find({ collection: 'services', ...opts, where: { ...opts.where, showInMenu: { equals: true } }, limit: 100 }).then((r) => r.docs),
      payload.find({ collection: 'products', ...opts }).then((r) => r.docs),
      payload.find({ collection: 'projects', ...opts }).then((r) => r.docs),
      payload.find({ collection: 'case-studies', ...opts }).then((r) => r.docs),
      payload.find({ collection: 'industries', where: { status: { equals: 'published' } }, sort: 'order', limit: 24, depth: 0 }).then((r) => r.docs),
      payload.find({ collection: 'technologies', where: { status: { equals: 'published' } }, sort: 'order', limit: 40, depth: 0 }).then((r) => r.docs),
    ])
  } catch {
    /* header falls back to its static lists */
  }

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        {/* Header custom code (analytics, GTM, verification, etc.) — editable in Site Settings. */}
        {settings.headCode ? <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: settings.headCode }} /> : null}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd(settings)) }} />
        <Header navData={navData} services={services} products={products} projects={projects} caseStudies={caseStudies} settings={settings} contactHref={contactHref} />
        <main className="flex-1">{children}</main>
        <Footer footerData={footerData} services={services} products={products} industries={industries} technologies={technologies} settings={settings} contactHref={contactHref} />
        <CallbackWidget settings={settings} />
        {/* Footer custom code (analytics, chat widgets, pixels) — editable in Site Settings. */}
        {settings.bodyEndCode ? <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: settings.bodyEndCode }} /> : null}
      </body>
    </html>
  )
}
