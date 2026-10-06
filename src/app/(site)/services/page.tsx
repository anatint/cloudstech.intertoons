import { getPayload } from '@/lib/payload'
import { field, getContactHref, withQuoteAnchor, withContactAnchor } from '@/lib/settings'
import { BlockRenderer } from '@/components/BlockRenderer'
import ServicesGrid from '@/components/ServicesGrid'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight, CheckCircle2, TrendingUp,
  Award, Users, Clock
} from 'lucide-react'

export const revalidate = 0

// Services page copy lives in its own dedicated collection (`ServicesPage`),
// separate from the shared `SitePages` collection used by other listing pages.
// A few fields survived a CSV re-import with an all-lowercase key
// (e.g. `heroTitle` -> `herotitle`) — patch those back to the expected casing.
const CASING_FIXUPS = ['heroTitle', 'heroBadge', 'heroTitleHighlight']
async function getServicesPage() {
  try {
    const { docs } = await (await getPayload()).find({ collection: 'services-page-settings', limit: 1 })
    const page: any = docs[0] ?? {}
    for (const key of CASING_FIXUPS) {
      if (page[key] === undefined && page[key.toLowerCase()] !== undefined) {
        page[key] = page[key.toLowerCase()]
      }
    }
    return page
  } catch {
    return {}
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const p = await getServicesPage()
  const title = field(p, 'seoTitle') || 'Software Development Services | ECommerce | Delivery Apps | Mobile Apps'
  const description = field(p, 'seoDescription') || 'See our portfolio of ECommerce Stores, Apps, & Custom applications'
  return {
    // `{ absolute }` matches the WordPress site's <title> tag exactly — the
    // CMS field's own text is the final title, not run through the site-wide
    // " | Intertoons" template (which was double-appending it before).
    title: { absolute: title },
    description,
    alternates: { canonical: '/services' },
    openGraph: { title, description },
  }
}

/* ── Stats ────────────────────────────────────────── */
const STATS = [
  { icon: <TrendingUp className="h-5 w-5 text-brand-600" />, value: '170+', label: 'Projects Delivered' },
  { icon: <Users className="h-5 w-5 text-brand-600" />,      value: '48+',  label: 'Industries Served' },
  { icon: <Award className="h-5 w-5 text-brand-600" />,      value: '98%',  label: 'Client Satisfaction' },
  { icon: <Clock className="h-5 w-5 text-brand-600" />,      value: '8+',   label: 'Years of Experience' },
]

/* ── Fallback cards shown only if the CMS query returns zero services ── */
const FALLBACK_SERVICES = [
  { slug: 'ai-development',            category: 'ai-development',  title: 'AI Development',              shortDescription: 'Custom AI solutions & LLM integrations tailored to your business processes and goals.' },
  { slug: 'ai-automations',            category: 'ai-automations',  title: 'AI Automations',              shortDescription: 'Automate workflows, reduce manual tasks, and ship faster with intelligent automation.' },
  { slug: 'shopify-developers-kerala', category: 'shopify',          title: 'Shopify Development',         shortDescription: 'High-converting Shopify stores designed for your brand and built by certified experts.' },
  { slug: 'ecommerce-development',     category: 'ecommerce',        title: 'E-commerce Development',      shortDescription: 'Scalable, feature-rich online stores on any platform — from WooCommerce to custom builds.' },
  { slug: 'mobile-app-development',    category: 'mobile',           title: 'Mobile App Development',      shortDescription: 'Native iOS and Android apps plus cross-platform Flutter solutions built to perform.' },
]

export default async function ServicesPage() {
  const payload = await getPayload()

  // Page-record-driven layout (if set) takes over the whole page; otherwise
  // the same record supplies the hero/section copy via `field()` below.
  const [page, contactHref]: [any, string] = await Promise.all([getServicesPage(), getContactHref()])

  if (page?.layout?.length) {
    return <BlockRenderer blocks={page.layout} />
  }

  // Auto-render: fetch all published services shown in browsing UI. Migrated
  // WordPress pages are marked showInMenu: false — reachable by direct URL
  // (and listed in sitemap.xml) but excluded from this listing, matching how
  // they behaved on the old site.
  const { docs: services } = await payload.find({
    collection: 'services',
    where: { status: { equals: 'published' }, showInMenu: { equals: true } },
    limit: 50,
    sort: 'order',
    depth: 1,
  })

  return (
    <div>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-violet-50 pt-28 pb-16 sm:pt-32 lg:pt-40 lg:pb-20">
        {/* Laptop + plant illustration, full width, anchored right — with the
            3 supplied floating cards around it. */}
        <div className="absolute inset-0 w-full pointer-events-none hidden md:block">
          {/* `object-cover` filled the section completely but zoomed the
              laptop graphic in far enough to overlap the heading text.
              `object-contain` + anchoring top (not the vertical-center
              default) keeps the illustration at its real size with no
              overlap, and moves the leftover empty space to the bottom of
              the section instead of right under the header where it was
              most visible; the gradient wash on the section itself (matching
              the image's own light-blue tone) means that bottom gap is never
              plain white either. */}
          <Image
            src="/images/service-listing-hero.png"
            alt=""
            fill
            className="object-contain object-right-top"
            priority
          />
          <div className="absolute top-[22%] left-[52%] h-20 w-20 sm:h-28 sm:w-28 hidden lg:block">
            <div className="hero-float-icon relative h-full w-full [animation-delay:0s]">
              <Image src="/images/shopify-card.png" alt="" fill className="object-contain drop-shadow-lg" />
            </div>
          </div>
          <div className="absolute top-[14%] right-[5%] h-20 w-20 sm:h-28 sm:w-28 hidden lg:block">
            <div className="hero-float-icon relative h-full w-full [animation-delay:0.7s]">
              <Image src="/images/better-performance-card.png" alt="" fill className="object-contain drop-shadow-lg" />
            </div>
          </div>
          <div className="absolute bottom-[16%] right-[1%] h-20 w-20 sm:h-28 sm:w-28 hidden lg:block">
            <div className="hero-float-icon relative h-full w-full [animation-delay:1.4s]">
              <Image src="/images/reliable-support-card.png" alt="" fill className="object-contain drop-shadow-lg" />
            </div>
          </div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600 mb-4">
              {field(page, 'heroBadge')}
            </p>
            <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-[70px] text-slate-900 leading-tight">
              {field(page, 'heroTitle')}<br />
              <span className="text-brand-600">{field(page, 'heroTitleHighlight')}</span>
            </h1>
            <p className="mt-6 text-base font-inter text-slate-500 leading-relaxed max-w-xl">
              {field(page, 'heroSubtitle')}
            </p>

            {/* Stats card */}
            <div className="mt-8 hidden sm:block">
              <div className="grid grid-cols-4 gap-4 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md shadow-lg shadow-slate-200/50 px-6 py-5 max-w-2xl">
                {STATS.map((s, i) => (
                  <div key={s.label} className="flex flex-col items-center gap-1.5 text-center">
                    {s.icon}
                    <p className="text-xl font-black text-slate-900">{field(page, `stat${i + 1}Value`)}</p>
                    <p className="text-[11px] text-slate-500 leading-tight">{field(page, `stat${i + 1}Label`)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <Link
                href={withContactAnchor(withQuoteAnchor(field(page, 'heroPrimaryCtaLink')), contactHref)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base transition-colors"
              >
                {field(page, 'heroPrimaryCtaLabel')} <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <Link
                href={withContactAnchor(withQuoteAnchor(field(page, 'heroSecondaryCtaLink')), contactHref)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 font-medium text-base transition-colors"
              >
                {field(page, 'heroSecondaryCtaLabel')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ─────────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-white">
        {/* max-w-7xl — matches the header/logo (and the Technologies strip on
            the home page), so these cards' left/right edges line up with it. */}
        <div className="container max-w-7xl">

          <div className="text-center mb-14">
            <p className="text-[15px] font-bold uppercase tracking-[0.18em] text-brand-600 mb-3">{field(page, 'expertiseEyebrow')}</p>
            <h2 className="text-[38px] font-extrabold text-slate-900">
              {field(page, 'expertiseTitle')}
            </h2>
            <p className="mt-4 text-slate-500 text-base max-w-xl mx-auto">
              {field(page, 'expertiseSubtitle')}
            </p>
          </div>

          <ServicesGrid
            services={services.length === 0 ? FALLBACK_SERVICES : services}
            learnMoreLabel={field(page, 'servicesLearnMoreLabel')}
          />
        </div>
      </section>

      {/* ── WHY INTERTOONS ────────────────────────────────── */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div>
              <p className="text-[15px] font-bold uppercase tracking-[0.18em] text-brand-600 mb-3">{field(page, 'whyEyebrow')}</p>
              <h2 className="text-[38px] font-extrabold text-slate-900 leading-tight">
                {field(page, 'whyTitle')} <span className="text-brand-600">{field(page, 'whyTitleHighlight')}</span>
              </h2>
              <p className="mt-4 text-slate-500 text-base leading-relaxed">
                {field(page, 'whyParagraph')}
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  { titleKey: 'whyPoint1Title', descKey: 'whyPoint1Desc' },
                  { titleKey: 'whyPoint2Title', descKey: 'whyPoint2Desc' },
                  { titleKey: 'whyPoint3Title', descKey: 'whyPoint3Desc' },
                  { titleKey: 'whyPoint4Title', descKey: 'whyPoint4Desc' },
                ].map((pt) => (
                  <li key={pt.titleKey} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-base font-semibold text-slate-800">{field(page, pt.titleKey)}</p>
                      <p className="text-[15px] text-slate-500 mt-0.5">{field(page, pt.descKey)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
                  <p className="text-3xl font-black text-brand-600">{field(page, `whyStat${n}Value`)}</p>
                  <p className="text-base font-bold text-slate-800 mt-1">{field(page, `whyStat${n}Label`)}</p>
                  <p className="text-[15px] text-slate-400 mt-0.5">{field(page, `whyStat${n}Sub`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESS STRIP ─────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="container max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-[38px] font-extrabold text-slate-900">{field(page, 'processTitle')}</h2>
            <p className="mt-2 text-slate-500 text-base">{field(page, 'processSubtitle')}</p>
          </div>
          <div className="relative">
            <div className="absolute top-7 left-[10%] right-[10%] h-px bg-slate-200 hidden lg:block" />
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-y-8 gap-x-4 relative z-10">
              {['01', '02', '03', '04', '05'].map((n, i) => (
                <div key={n} className="flex flex-col items-center text-center">
                  <div className="h-14 w-14 rounded-full border-2 border-brand-200 bg-white flex flex-col items-center justify-center shadow-sm mb-3 relative z-10">
                    <span className="text-[11px] font-black text-brand-600">{n}</span>
                  </div>
                  <p className="text-base font-bold text-slate-800">{field(page, `process${i + 1}Title`)}</p>
                  <p className="text-[15px] text-slate-500 mt-1 leading-snug max-w-[140px]">{field(page, `process${i + 1}Desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="py-14 bg-brand-600">
        <div className="container max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-[38px] font-extrabold text-white leading-tight">
                {field(page, 'ctaBannerTitle')}
              </h2>
              <p className="text-blue-100 text-base mt-1">
                {field(page, 'ctaBannerSubtitle')}
              </p>
            </div>
            <div className="flex gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href={withContactAnchor(withQuoteAnchor(field(page, 'ctaBannerPrimaryLink')), contactHref)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-600 font-bold text-sm hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                {field(page, 'ctaBannerPrimaryLabel')} <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <Link
                href={withContactAnchor(withQuoteAnchor(field(page, 'ctaBannerSecondaryLink')), contactHref)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-white/50 text-white font-semibold text-sm hover:border-white transition-colors whitespace-nowrap"
              >
                {field(page, 'ctaBannerSecondaryLabel')}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
