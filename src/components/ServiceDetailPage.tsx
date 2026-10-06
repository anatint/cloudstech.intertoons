import type { ReactNode } from 'react'
import { getPayload } from '@/lib/payload'
import { generateMetadata as genMeta, buildBreadcrumbJsonLd, buildServiceJsonLd } from '@/lib/seo'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle2, ArrowRight, ChevronRight, Store, ShoppingBag, Smartphone, Bot, Globe,
  ChevronDown, Target, Clock, Award, Tag, Layers,
} from 'lucide-react'
import { productTheme } from '@/lib/productThemes'
import { lucideIcon } from '@/lib/icons'

/* ── Per-slug hero text overrides ─────────────────────── */
const HERO_COPY: Record<string, { headline: ReactNode; sub: string; badges: string[] }> = {}

/* ── Why Choose bullets per slug ──────────────────────── */
const WHY_CHOOSE: Record<string, string[]> = {
  'shopify-developers-kerala': [
    'Official Shopify Partners with experienced developers',
    'Deep understanding of eCommerce & user experience',
    'Custom solutions tailored to your business goals',
    'Transparent communication & on-time delivery',
    'Post-launch support to help your business grow',
  ],
  'ai-development': [
    'Full-stack AI engineers with LLM production experience',
    'Agnostic approach — we choose the right model, not the trendy one',
    'End-to-end delivery from research to deployment',
    'Security-first engineering with data privacy at every step',
    'Ongoing fine-tuning and model performance monitoring',
  ],
  'ai-automations': [
    'Certified automation engineers across n8n, Make and custom stacks',
    'Handles complex conditional logic and multi-step pipelines',
    'Integrates with 500+ tools and APIs out of the box',
    'Fully documented automations your team can maintain',
    '24/7 monitoring with instant alert on failure',
  ],
  'ecommerce-development': [
    'Certified Shopify, WooCommerce and BigCommerce partners',
    'UI/UX designed from customer journey research',
    'Conversion-rate optimisation built into every build',
    'Transparent milestones and fixed-scope pricing',
    'Growth consulting and analytics included post-launch',
  ],
  'mobile-app-development': [
    'Native iOS (Swift) and Android (Kotlin) specialists',
    'Flutter expertise for cost-efficient cross-platform apps',
    'Design system approach for a consistent, branded feel',
    'CI/CD pipelines for fast, reliable feature releases',
    'App Store Connect & Google Play management included',
  ],
}

/* ── CTA copy per slug ────────────────────────────────── */
const CTA_COPY: Record<string, { heading: string; sub: string; btnText: string }> = {
  'shopify-developers-kerala': {
    heading: 'Ready to Build Your Dream Shopify Store?',
    sub: "Let's create a powerful eCommerce store that drives sales and grows your brand.",
    btnText: 'Request a Free Quote',
  },
  'ai-development': {
    heading: 'Ready to Add AI to Your Product?',
    sub: "Tell us your challenge. We'll find the right AI solution together.",
    btnText: 'Talk to an AI Expert',
  },
  'ai-automations': {
    heading: 'Ready to Automate Your Business?',
    sub: "Share your workflow. We'll automate it — saving you hours every week.",
    btnText: 'Get a Free Automation Audit',
  },
  'ecommerce-development': {
    heading: 'Ready to Launch Your Online Store?',
    sub: "Tell us about your product. We'll design and build the store you deserve.",
    btnText: 'Request a Free Quote',
  },
  'mobile-app-development': {
    heading: 'Ready to Build Your Mobile App?',
    sub: "Share your app idea. We'll scope, design, and ship it fast.",
    btnText: 'Get a Free App Estimate',
  },
}

/* ── Shopify-specific "Section Icon" for CTA ─────────── */
const CTA_ICONS: Record<string, ReactNode> = {
  'shopify-developers-kerala': (
    <svg viewBox="0 0 109 124" className="h-16 w-16 text-white/80" fill="currentColor">
      <path d="M74.7 14.8c-.1-.5-.5-.8-1-.8s-9.5-.7-9.5-.7l-6.3-6.3c-.6-.6-1.8-.4-2.2-.3L52 8.3C50.1 2.9 46.5 0 42.2 0c-.1 0-.2 0-.3 0-1.2-1.7-2.8-2.4-4.2-2.4-10.4 0-15.4 13-17 19.6l-7.3 2.3c-2.3.7-2.3.7-2.6 2.9L4 93.2l53.5 9.3 29-6.3L74.7 14.8zM56.6 8.7l-4.3 1.3c0-.3 0-.6 0-.9 0-2.7-.4-4.9-1-6.6 2.4.3 4.1 3.1 5.3 6.2zM42.2 3.6c.7 1.7 1.1 4.1 1.1 7.4 0 .2 0 .3 0 .5l-8.4 2.6C37 8.3 39.4 4.5 42.2 3.6zM38.8 1.7c.3 0 .7.1 1 .3-3.8 1.8-7.8 6.4-9.5 15.6l-7.1 2.2C25.3 13 29.8 1.7 38.8 1.7z"/>
    </svg>
  ),
}

/* ── helpers ──────────────────────────────────────────── */
function extractFaqText(answer: unknown): string {
  if (typeof answer === 'string') {
    try {
      const parsed = JSON.parse(answer)
      const walk = (node: any): string => {
        if (!node) return ''
        if (node.text) return node.text
        if (node.children) return node.children.map(walk).join(' ')
        return ''
      }
      return walk(parsed.root)
    } catch {
      return answer
    }
  }
  return ''
}

/**
 * Looks up a service by slug. Returns null if none found (caller decides
 * whether that's a 404). `depth: 2` is required to resolve MULTI_REFERENCE
 * fields (faqs, processFlow, technologies) — without it those silently come
 * back empty even though the underlying data is fine.
 */
export async function findServiceBySlug(slug: string, depth = 0) {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'services',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
    depth,
  })
  return (docs[0] as any) ?? null
}

/* ── metadata ─────────────────────────────────────────── */
export async function generateServiceMetadata(slug: string): Promise<Metadata> {
  const service = await findServiceBySlug(slug)
  if (!service) return { title: 'Service Not Found' }
  // `exactTitle` matches the WordPress site's <title> tag byte-for-byte — no
  // " | Intertoons" suffix, unlike every other page type on this site.
  return genMeta(service, `/${slug}`, undefined, { exactTitle: true })
}

/* ── Page content ─────────────────────────────────────── */
export async function ServiceDetailContent({ slug }: { slug: string }) {
  const payload = await getPayload()
  const service = await findServiceBySlug(slug, 2)
  if (!service) return null

  /**
   * For each related section, prefer the editor-curated list set on the Service
   * (relatedProjects / relatedProducts). When a service
   * hasn't been curated yet, fall back to the reverse query (items whose own
   * `services` field points here) so nothing disappears.
   */
  const curatedIds = (rel: any): (number | string)[] =>
    Array.isArray(rel) ? rel.map((r: any) => (r && typeof r === 'object' ? r.id : r)).filter(Boolean) : []

  const byCuratedOrder = (ids: (number | string)[]) => (a: any, b: any) =>
    ids.indexOf(a.id) - ids.indexOf(b.id)

  /* The two related sections are independent — fetch them in parallel to
     avoid serial Wix round-trips (was the main source of slow service pages). */
  const curatedProjectIds = curatedIds(service.relatedProjects)
  const curatedProductIds = curatedIds(service.relatedProducts)

  const [projects, relatedProducts] = await Promise.all([
    (async () => {
      if (curatedProjectIds.length) {
        const docs = (await payload.find({ collection: 'projects', where: { id: { in: curatedProjectIds }, status: { equals: 'published' } }, limit: 12, depth: 1 })).docs
        return docs.sort(byCuratedOrder(curatedProjectIds))
      }
      return (await payload.find({ collection: 'projects', where: { status: { equals: 'published' }, services: { contains: service.id } }, sort: '-createdAt', limit: 6, depth: 1 })).docs
    })(),
    (async () => {
      if (curatedProductIds.length) {
        const docs = (await payload.find({ collection: 'products', where: { id: { in: curatedProductIds }, status: { equals: 'published' } }, limit: 12, depth: 1 })).docs
        return docs.sort(byCuratedOrder(curatedProductIds))
      }
      return (await payload.find({ collection: 'products', where: { status: { equals: 'published' }, services: { contains: service.id } }, sort: 'order', limit: 4, depth: 1 })).docs
    })(),
  ])

  /* Prefer the migrated JSON-LD graph pulled from the old WordPress site
     (service.schemaMarkup) over the hand-built schema — it's a fuller graph
     (WebPage, BreadcrumbList, ImageObject, WebSite). Falls back to a minimal
     generated schema for services that haven't been backfilled yet. */
  const migratedSchema = (() => {
    if (typeof service.schemaMarkup !== 'string' || !service.schemaMarkup.trim()) return null
    try {
      return JSON.parse(service.schemaMarkup)
    } catch {
      return null
    }
  })()
  const jsonLd = migratedSchema
    ? [migratedSchema]
    : [
        buildBreadcrumbJsonLd([
          { name: 'Home', item: '/' },
          { name: 'Services', item: '/services' },
          { name: service.title, item: `/${slug}` },
        ]),
        buildServiceJsonLd(service, slug),
      ]

  /**
   * Data-driven: prefer structured fields from the Wix CMS record,
   * fall back to hardcoded defaults only if the DB field is missing.
   * Run `admin-migrate.ts` to seed these fields into Wix.
   */
  const subServices: Array<{ icon: any; title: string; desc: string }> = Array.isArray(service.subServices) ? service.subServices : []
  const whyChoose: string[] =
    (Array.isArray(service.whyChoose) && service.whyChoose.length ? service.whyChoose : null) ?? WHY_CHOOSE[slug] ?? WHY_CHOOSE['shopify-developers-kerala']
  const stats: Array<{ value: string; label: string }> = Array.isArray(service.stats) ? service.stats : []
  const heroLabels: Array<{ value: string; label: string }> = Array.isArray(service.heroLabels)
    ? (service.heroLabels as Array<{ value: string; label: string }>).filter((h) => !!h?.value)
    : []
  // "Your {Service} Partner" value-prop cards — real Wix data only, no fallback.
  const partnerCards: Array<{ title: string; description: string }> = Array.isArray(service.partnerCards)
    ? (service.partnerCards as Array<{ title: string; description: string }>).filter((c) => !!c?.title)
    : []
  const cta = {
    heading: service.ctaHeading || (CTA_COPY[slug] ?? CTA_COPY['shopify-developers-kerala']).heading,
    sub: service.ctaSub || (CTA_COPY[slug] ?? CTA_COPY['shopify-developers-kerala']).sub,
    btnText: service.ctaBtnText || (CTA_COPY[slug] ?? CTA_COPY['shopify-developers-kerala']).btnText,
  }

  const processSteps: any[] = service.processSteps ?? []
  const faqs: any[] = service.faqs ?? []
  /* Tech chips — prefer the `technologies` field, fall back to `defaultTechnologies`. */
  const serviceTech: any[] = (Array.isArray(service.technologies) && service.technologies.length
    ? service.technologies
    : Array.isArray(service.defaultTechnologies) ? service.defaultTechnologies : []) ?? []

  /* Hero heading — editable from the Services record via three flat text fields:
     `heroHeadline` (dark part), `heroHeadlineHighlight` (blue part),
     `heroHeadlineSuffix`. Falls back to per-slug defaults, then the title. */
  const HARD_HL = ({
    'shopify-developers-kerala': { black: 'Build. Scale. Succeed with', blue: 'Shopify Experts', suffix: 'in Kerala' },
    'ai-development': { black: 'Build Smarter Products with', blue: 'Custom AI Development' },
    'ai-automations': { black: 'Save Hours Every Week with', blue: 'AI-Powered Automations' },
    'ecommerce-development': { black: 'Launch & Grow with', blue: 'Expert eCommerce Development' },
    'mobile-app-development': { black: 'Ship Faster with', blue: 'Mobile App Experts' },
  } as Record<string, { black: string; blue: string; suffix?: string }>)[slug] ?? { black: service.title, blue: '' }
  const txt = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : '')
  const hl = {
    black: txt(service.heroHeadline) || HARD_HL.black,
    blue: txt(service.heroHeadlineHighlight) || HARD_HL.blue,
    suffix: txt(service.heroHeadlineSuffix) || HARD_HL.suffix,
  }

  /* Hero image URL */
  const heroImageUrl: string | null = service.heroImage?.url ?? null

  /* Category label — derive from DB title, not hardcoded */
  const categoryLabel = service.title?.toUpperCase() ?? slug.replace(/-/g, ' ').toUpperCase()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>

        {/* ── 1. HERO (light theme, matches services-listing hero) ──── */}
        {/* The gradient wash (not just `bg-white`) spans the whole section so it
            still fully backs the stat bar/CTA buttons even when a long headline
            makes the hero taller than the illustration — otherwise those pieces
            visually spilled onto plain white below where the (fixed-height,
            object-contain) picture ended. */}
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50 pt-28 pb-16 sm:pt-32 lg:pt-40 lg:pb-20">
          {/* Laptop + plant illustration, anchored to the top-right corner so it
              stays put near the heading instead of drifting to the vertical
              center of the section when a long headline/heroLabels row makes
              the hero taller — that drift used to push the picture down into
              the stat bar / CTA buttons for longer service titles. */}
          <div className="absolute inset-0 w-full pointer-events-none hidden md:block">
            <Image
              src="/images/service-detail-hero.png"
              alt=""
              fill
              className="object-contain object-right-top"
              priority
            />
          </div>

          <div className="container relative z-10">
            <div className="max-w-2xl">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
                <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href="/services" className="hover:text-brand-600 transition-colors">Services</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-slate-700">{service.title}</span>
              </nav>

              <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-sm font-semibold">
                <Layers className="h-4 w-4" />
                {categoryLabel}
              </span>

              <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-[70px] text-slate-900 leading-tight">
                {hl.black}{' '}
                <span className="bg-clip-text text-transparent animate-gradient-text">{hl.blue}</span>
                {hl.suffix && <> {hl.suffix}</>}
              </h1>
              {service.shortDescription && (
                <p className="mt-6 text-base font-inter text-slate-500 leading-relaxed max-w-xl">
                  {service.shortDescription}
                </p>
              )}

              {/* Hero labels row — sourced entirely from the service's `heroLabels`
                  Wix field (array of {value,label} objects), no hardcoded fallback.
                  Hidden if the field is empty. Column count matches the actual
                  number of items (max 4) — a fixed 4-column grid left visible
                  empty gaps whenever a service had fewer than 4 real stats. */}
              {heroLabels.length > 0 && (
                <div className="mt-8 hidden sm:block">
                  <div
                    className="grid gap-2 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md shadow-lg shadow-slate-200/50 px-4 py-4 max-w-2xl"
                    style={{ gridTemplateColumns: `repeat(${Math.min(heroLabels.length, 4)}, minmax(0, 1fr))` }}
                  >
                    {/* Long capability names (e.g. "Maintenance & Updates") need a
                        smaller size to stay on one line within a narrow column —
                        a single fixed size either wrapped long values to two
                        lines or, once forced to `whitespace-nowrap`, overflowed
                        into the neighboring column. */}
                    {heroLabels.map((h, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 text-center">
                        <p className={`font-black text-slate-900 whitespace-nowrap ${h.value.length > 16 ? 'text-xs' : h.value.length > 11 ? 'text-sm' : 'text-lg'}`}>{h.value}</p>
                        <p className="text-[11px] text-slate-500 leading-tight whitespace-nowrap">{h.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center gap-3">
                <Link
                  href="/request-a-quote#quote-form"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 hover:opacity-90 text-white font-semibold text-base transition-opacity"
                >
                  Talk to an Expert <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
                <Link
                  href="/works"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 font-medium text-base transition-colors"
                >
                  View Our Work
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Preview image (moved out of hero to keep hero centered) ── */}
        {heroImageUrl && (
          <section className="bg-white pt-10 pb-2">
            <div className="container max-w-4xl -mt-16 sm:-mt-20 relative z-20">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border border-slate-100">
                <Image
                  src={heroImageUrl}
                  alt={`${service.title} preview`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 1b. YOUR {SERVICE} PARTNER ──────────────────────── */}
        {/* Sourced entirely from this service's `partnerCards` Wix field —
            no hardcoded fallback. Section is hidden if that field is empty. */}
        {partnerCards.length > 0 && (
          <section className="py-16 bg-slate-50 border-t border-slate-100">
            <div className="container max-w-6xl">
              <div className="text-center mb-10">
                <h2 className="text-[38px] font-extrabold text-slate-900">
                  Your {service.title} Partner
                </h2>
                <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-brand-600" />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {partnerCards.map((c, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-100 bg-white">
                    <div className="mb-4 p-3 rounded-xl bg-blue-50">
                      <PartnerCardIcon index={i} />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2 text-base">{c.title}</h3>
                    <p className="text-[15px] text-slate-500 leading-relaxed">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 2. SERVICES WE OFFER ────────────────────────────── */}
        {/* Sourced entirely from this service's `offeringsList` Wix field —
            no hardcoded fallback. Section is hidden if that field is empty. */}
        {subServices.length > 0 && (
        <section className="py-16 bg-white border-t border-slate-100">
          <div className="container max-w-6xl">
            <div className="text-center mb-10">
              <h2 className="text-[38px] font-extrabold text-slate-900">
                {service.title} Services We Offer
              </h2>
              <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-brand-600" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {subServices.map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all bg-white"
                >
                  <div className="mb-4 p-3 rounded-xl bg-blue-50">
                    {typeof s.icon === 'string'
                      ? (() => { const I = lucideIcon(s.icon); return <I className="h-8 w-8 text-brand-600" /> })()
                      : s.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 text-base">{s.title}</h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ── 3. WHY CHOOSE + PROCESS ─────────────────────────── */}
        <section className="py-16 bg-white border-t border-slate-100">
          <div className="container max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-start">

              {/* Left: Why Choose */}
              <div>
                <h2 className="text-[38px] font-extrabold text-slate-900 leading-tight">
                  Why Choose Intertoons for{' '}
                  <span className="text-brand-600">
                    {service.title}?
                  </span>
                </h2>

                <ul className="mt-6 space-y-3">
                  {whyChoose.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                      <span className="text-[15px] text-slate-700">{point}</span>
                    </li>
                  ))}
                </ul>

                {/* Partner badge */}
                {slug === 'shopify-developers-kerala' && (
                  <div className="mt-8 inline-flex items-center gap-3 border border-slate-200 rounded-xl px-5 py-4 bg-white shadow-sm">
                    <svg viewBox="0 0 109 124" className="h-10 w-10" fill="#96BF48">
                      <path d="M74.7 14.8c-.1-.5-.5-.8-1-.8s-9.5-.7-9.5-.7l-6.3-6.3c-.6-.6-1.8-.4-2.2-.3l-3.7 1.1C50.1 2.9 46.5 0 42.2 0c-.1 0-.2 0-.3 0-1.2-1.7-2.8-2.4-4.2-2.4C27.3-2.4 22.3 10.6 20.7 17.2l-7.3 2.3c-2.3.7-2.3.7-2.6 2.9L4 93.2l53.5 9.3 29-6.3L74.7 14.8z"/>
                    </svg>
                    <div>
                      <p className="text-base font-bold text-slate-800">Official Shopify Partner</p>
                      <p className="text-[15px] text-slate-400">Building successful eCommerce businesses together.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Process */}
              <div>
                <h2 className="text-[38px] font-extrabold text-slate-900 mb-8">
                  Our {service.title} Process
                </h2>

                {/* Horizontal timeline */}
                <div className="relative">
                  {/* Connecting line */}
                  <div className="absolute top-7 left-7 right-7 h-px bg-slate-200 hidden sm:block" />

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-y-8 gap-x-4 relative z-10">
                    {processSteps.slice(0, 6).map((step: any, i: number) => (
                      <div key={step.id ?? i} className="flex flex-col items-center text-center">
                        {/* Circle with number */}
                        <div className="h-14 w-14 rounded-full border-2 border-slate-200 bg-white flex flex-col items-center justify-center shadow-sm mb-3">
                          <span className="text-[10px] font-bold text-brand-600">
                            {String(step.stepNumber ?? i + 1).padStart(2, '0')}
                          </span>
                          <ProcessIcon index={i} />
                        </div>
                        <p className="text-base font-bold text-slate-800">{step.title}</p>
                        <p className="text-[15px] text-slate-500 mt-1 leading-snug">{step.description?.substring(0, 60)}...</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 4. STATS BAR ────────────────────────────────────── */}
        {/* Sourced entirely from this service's `stats` Wix field — no
            hardcoded fallback. Section is hidden if that field is empty. */}
        {stats.length > 0 && (
        <section className="py-10 bg-brand-600">
          <div className="container max-w-6xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-white text-center">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <StatIcon index={i} />
                  <p className="text-3xl font-extrabold">{s.value}</p>
                  <p className="text-sm text-blue-100 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ── 5. RELATED PROJECTS ─────────────────────────────── */}
        {projects.length > 0 && (
          <section className="py-16 bg-white border-t border-slate-100">
            <div className="container max-w-6xl">
              <div className="text-center mb-10">
                <p className="text-[15px] font-bold uppercase tracking-[0.18em] text-brand-600 mb-2">Our Work</p>
                <h2 className="text-[38px] font-extrabold text-slate-900">
                  {service.title} Projects
                </h2>
                <p className="mt-2 text-slate-500 text-base max-w-md mx-auto">
                  Explore our completed work in {service.title?.toLowerCase()}.
                </p>
                <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-brand-600" />
              </div>

              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide [&>*]:shrink-0 [&>*]:w-[280px] sm:[&>*]:w-[320px]">
                {(projects as any[]).map((p: any) => {
                  const imgUrl = p.coverImage?.url ?? '/images/portfolio-default.png'
                  const CATEGORY_LABELS_MAP: Record<string, string> = {
                    ecommerce: 'E-Commerce',
                    'mobile-app': 'Mobile App',
                    'web-development': 'Web Development',
                    travel: 'Travel & Hospitality',
                    'food-delivery': 'Food & Beverages',
                    'real-estate': 'Real Estate',
                    healthcare: 'Healthcare',
                    other: 'Other',
                  }
                  const csDoc = p.caseStudies?.docs?.[0]
                  const csSlug = csDoc ? (typeof csDoc === 'string' ? null : csDoc.slug) : null
                  const href = csSlug ? `/case-studies/${csSlug}` : `/works/${p.slug}`
                  return (
                    <Link
                      key={p.id}
                      href={href}
                      className="group rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:border-brand-200 transition-all bg-white flex flex-col"
                    >
                      <div className="relative h-48 bg-slate-100 shrink-0">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={p.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-slate-300" />
                          </div>
                        )}
                        {/* Browser chrome overlay */}
                        <div className="absolute inset-x-0 top-0 h-6 bg-white/90 flex items-center gap-1 px-2">
                          <div className="h-2 w-2 rounded-full bg-red-400" />
                          <div className="h-2 w-2 rounded-full bg-yellow-400" />
                          <div className="h-2 w-2 rounded-full bg-green-400" />
                        </div>
                        {/* Case study badge */}
                        {csSlug && (
                          <span className="absolute top-7 right-2 px-2 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wide">
                            Case Study
                          </span>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500 mb-1">
                          {CATEGORY_LABELS_MAP[p.category] ?? p.category}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
                          {p.title}
                        </h3>
                        {p.excerpt && (
                          <p className="mt-2 text-[15px] text-slate-500 line-clamp-2 leading-relaxed flex-1">
                            {p.excerpt}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:gap-2 transition-all">
                          {csSlug ? 'Read Case Study' : 'View Project'}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              <div className="text-center mt-10">
                <Link
                  href="/works"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-slate-200 text-slate-700 text-sm font-semibold hover:border-brand-400 hover:text-brand-600 transition-colors"
                >
                  View All Projects
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── 5b. RELATED PRODUCTS ────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="py-16 bg-slate-50 border-t border-slate-100">
            <div className="container max-w-6xl">
              <div className="text-center mb-10">
                <p className="text-[15px] font-bold uppercase tracking-[0.18em] text-brand-600 mb-2">Powered By</p>
                <h2 className="text-[38px] font-extrabold text-slate-900">
                  Products Built with {service.title}
                </h2>
                <p className="mt-2 text-slate-500 text-base max-w-md mx-auto">
                  Ready-to-launch white-label platforms that use this service.
                </p>
                <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-brand-600" />
              </div>

              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide [&>*]:shrink-0 [&>*]:w-[260px]">
                {(relatedProducts as any[]).map((p: any) => {
                  const theme = productTheme(p.colorTheme)
                  const Icon = lucideIcon(p.icon)
                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-6 hover:shadow-xl hover:border-brand-200 transition-all"
                    >
                      <div className={`h-12 w-12 rounded-xl ${theme.iconBg} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition-colors">
                        {p.name}
                      </h3>
                      {p.tagline && (
                        <p className="mt-1 text-xs font-medium text-slate-400">{p.tagline}</p>
                      )}
                      {(p.shortDescription || p.description) && (
                        <p className="mt-3 text-[15px] text-slate-500 line-clamp-3 leading-relaxed flex-1">
                          {p.shortDescription || p.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:gap-2 transition-all">
                        Explore Product <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}


        {/* ── 5d. TECHNOLOGIES ───────────────────────────────── */}
        {serviceTech.length > 0 && (
          <section className="py-16 bg-white border-t border-slate-100">
            <div className="container max-w-6xl">
              <div className="text-center mb-10">
                <p className="text-[15px] font-bold uppercase tracking-[0.18em] text-brand-600 mb-2">Technologies</p>
                <h2 className="text-[38px] font-extrabold text-slate-900">
                  Technology Stack for {service.title}
                </h2>
                <p className="mt-2 text-slate-500 text-base max-w-md mx-auto">
                  Battle-tested technologies we use to build high-performance solutions.
                </p>
                <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-brand-600" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 max-w-3xl mx-auto">
                {serviceTech.map((tech: any) => {
                  const name = tech.name || ''
                  const category = tech.category ? tech.category.toUpperCase() : 'TECH'
                  if (!name) return null
                  return (
                    <div key={tech.id || tech._id} className="flex flex-col items-center gap-1 px-4 py-3.5 rounded-xl border border-slate-100 bg-white hover:border-brand-200 hover:shadow-md transition-all text-center">
                      <span className="text-sm font-bold text-slate-800">{name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold tracking-wider">{category}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── 6. FAQ ──────────────────────────────────────────── */}
        {faqs.length > 0 && (
          <section className="py-16 bg-slate-50 border-t border-slate-100">
            <div className="container max-w-3xl">
              <div className="text-center mb-10">
                <h2 className="text-[38px] font-extrabold text-slate-900">Frequently Asked Questions</h2>
                <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-brand-600" />
              </div>
              <div className="space-y-3">
                {faqs.map((faq: any, i: number) => (
                  <details key={i} className="group rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <summary className="flex justify-between items-center cursor-pointer px-6 py-4 font-semibold text-base text-slate-800 hover:text-brand-600 transition-colors list-none">
                      {faq.question}
                      <ChevronDown className="h-4 w-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-3" />
                    </summary>
                    <div className="px-6 pb-4 text-[15px] text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {extractFaqText(faq.answer)}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 7. BOTTOM CTA BANNER ────────────────────────────── */}
        <section className="py-10 bg-brand-600">
          <div className="container max-w-6xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex-1 min-w-0">
                <h2 className="text-[38px] font-extrabold text-white leading-tight">{cta.heading}</h2>
                <p className="text-blue-100 text-base mt-1">{cta.sub}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto">
                <Link
                  href="/request-a-quote#quote-form"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-brand-600 font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap"
                >
                  {cta.btnText}
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
                {/* Shopify bag icon for shopify page, generic icon for others */}
                <div className="hidden sm:flex h-16 w-16 items-center justify-center opacity-80">
                  {slug === 'shopify-developers-kerala' ? (
                    <ShoppingBag className="h-14 w-14 text-white/50" strokeWidth={1} />
                  ) : slug === 'mobile-app-development' ? (
                    <Smartphone className="h-14 w-14 text-white/50" strokeWidth={1} />
                  ) : slug === 'ai-development' || slug === 'ai-automations' ? (
                    <Bot className="h-14 w-14 text-white/50" strokeWidth={1} />
                  ) : (
                    <Globe className="h-14 w-14 text-white/50" strokeWidth={1} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}

/* ── Icon helpers for process timeline ───────────────── */
function ProcessIcon({ index }: { index: number }) {
  const icons = [
    <svg key="discover" className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" strokeWidth={2} /><path strokeWidth={2} d="M21 21l-4.35-4.35" /></svg>,
    <svg key="plan" className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    <svg key="build" className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    <svg key="test" className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    <svg key="launch" className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" /></svg>,
    <svg key="grow" className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  ]
  return icons[index] ?? icons[0]
}

/* ── Icon helpers for stats bar ──────────────────────── */
function StatIcon({ index }: { index: number }) {
  const icons = [
    <svg key="stores" className="h-8 w-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    <svg key="satisfaction" className="h-8 w-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    <svg key="years" className="h-8 w-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
    <svg key="support" className="h-8 w-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>,
  ]
  return icons[index] ?? icons[0]
}

/* ── Icon helper for the "Your {Service} Partner" value-prop cards ──── */
const PARTNER_CARD_ICONS = [Target, Clock, Award, Tag]
function PartnerCardIcon({ index }: { index: number }) {
  const Icon = PARTNER_CARD_ICONS[index % PARTNER_CARD_ICONS.length]
  return <Icon className="h-6 w-6 text-brand-600" />
}
