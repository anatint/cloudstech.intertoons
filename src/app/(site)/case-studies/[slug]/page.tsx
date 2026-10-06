import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload'
import { generateMetadata as genMeta, buildBreadcrumbJsonLd } from '@/lib/seo'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, User, Building2, Layers, Clock, Wrench, Rocket, ChevronRight, Package, FolderOpen } from 'lucide-react'
import CaseStudyTabs from '@/components/CaseStudyTabs'

interface Props { params: Promise<{ slug: string }> }

// Always SSR — content lives in D1, not in local build DB
export const revalidate = 0

export async function generateStaticParams() {
  try {
    const { docs } = await (await getPayload()).find({ collection: 'case-studies', limit: 100 })
    return (docs as any[]).map((d) => ({ slug: d.slug })).filter((p) => p.slug)
  } catch { return [] }
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
  })
  if (!docs[0]) return { title: 'Case Study Not Found' }
  return genMeta(docs[0] as any, `/case-studies/${slug}`)
}

const CATEGORY_LABELS: Record<string, string> = {
  'ecommerce': 'E-Commerce',
  'mobile-app': 'Mobile App',
  'web-development': 'Web Development',
  'travel': 'Travel',
  'food-delivery': 'Food Delivery',
  'real-estate': 'Real Estate',
  'healthcare': 'Healthcare',
  'ai': 'AI',
  'other': 'Other',
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload()

  const { docs } = await payload.find({
    collection: 'case-studies',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 2,
  })

  const cs = docs[0] as any
  if (!cs) notFound()

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', item: '/' },
    { name: 'Case Studies', item: '/case-studies' },
    { name: cs.title, item: `/case-studies/${slug}` },
  ])

  const categoryLabel = CATEGORY_LABELS[cs.category] ?? cs.category ?? ''

  // The lightweight Portfolio entry this case study expands on (optional).
  const relatedProject = cs.project && typeof cs.project === 'object' ? cs.project : null

  // Build structured service objects (with slug for linking)
  const servicesData: Array<{ title: string; slug: string }> = (cs.services ?? [])
    .map((s: any) => typeof s === 'string' ? null : { title: s.title, slug: s.slug })
    .filter(Boolean)

  // White-label products used in this engagement
  const productsData: Array<{ name: string; slug: string }> = (cs.products ?? [])
    .map((p: any) => typeof p === 'string' ? null : { name: p.name, slug: p.slug })
    .filter(Boolean)

  const platform = relatedProject?.platform
  const duration = relatedProject?.duration
  const liveUrl = relatedProject?.liveUrl
  const industryLabel = typeof relatedProject?.industry === 'object'
    ? relatedProject?.industry?.title
    : relatedProject?.industry

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div>

        {/* ── Hero (dark theme, matches listing-page hero) ──── */}
        <section className="bg-[#050B2A] relative overflow-hidden pt-24 pb-14 sm:pt-28 lg:pt-32 lg:pb-24">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-b from-brand-600/25 to-transparent" />
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle,#3B73F6 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
          </div>

          <div className="container relative z-10 max-w-3xl">
            <nav className="flex items-center justify-center gap-1.5 text-xs text-blue-200/60 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5 text-blue-200/40" />
              <Link href="/case-studies" className="hover:text-white transition-colors">Case Studies</Link>
              <ChevronRight className="h-3.5 w-3.5 text-blue-200/40" />
              <span className="text-slate-300">{cs.title}</span>
            </nav>
          </div>

          <div className="container relative z-10 text-center max-w-3xl">
            {categoryLabel && (
              <span className="inline-block mb-4 px-3 py-1 rounded-full bg-brand-600/20 text-brand-400 text-xs font-semibold uppercase tracking-wider border border-brand-500/30">
                {categoryLabel}
              </span>
            )}
            <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl text-white leading-tight">
              {cs.title}
            </h1>
            {cs.excerpt && (
              <p className="mt-6 text-base font-inter text-blue-200 leading-relaxed max-w-2xl mx-auto">{cs.excerpt}</p>
            )}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-sm whitespace-nowrap"
                >
                  Visit Live Site
                  <ExternalLink className="h-4 w-4 shrink-0" />
                </a>
              )}
              {relatedProject?.slug && (
                <Link
                  href={`/works/${relatedProject.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
                >
                  <FolderOpen className="h-4 w-4 shrink-0" />
                  View Portfolio Entry
                </Link>
              )}
            </div>
          </div>

          {/* Results as a stats row, mirroring the listing-page hero */}
          {cs.results?.length > 0 && (
            <div className="container relative z-10 mt-16 hidden sm:block">
              <div className="grid gap-px bg-white/10 rounded-2xl overflow-hidden max-w-3xl mx-auto" style={{ gridTemplateColumns: `repeat(${Math.min(cs.results.length, 4)}, minmax(0, 1fr))` }}>
                {cs.results.slice(0, 4).map((r: any, i: number) => (
                  <div key={i} className="bg-white/5 backdrop-blur-sm px-6 py-5 flex flex-col items-center gap-1.5 text-center">
                    <p className="text-2xl font-black text-white">{r.metric}</p>
                    <p className="text-xs text-slate-400">{r.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Snapshot: mockup + key details (moved out of hero) ── */}
        <section className="bg-white pt-10 pb-2">
          <div className="container max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] items-stretch">
              {/* Mockup image */}
              <div className="relative rounded-2xl overflow-hidden bg-[#050B2A] border border-slate-100 shadow-2xl shadow-black/10 min-h-[280px] lg:min-h-[360px] flex items-center justify-center text-white">
                {cs.coverImage?.url ? (
                  <Image
                    src={cs.coverImage.url}
                    alt={`${cs.title} mockup`}
                    fill
                    className="object-contain p-4"
                    priority
                  />
                ) : (
                  /* Placeholder when no image */
                  <div className="flex flex-col items-center justify-center gap-4 p-12">
                    <div className="h-20 w-20 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Layers className="h-10 w-10 text-brand-400" />
                    </div>
                    <span className="text-sm font-medium">{cs.client}</span>
                    <div className="flex gap-2">
                      {categoryLabel && (
                        <span className="px-2 py-1 bg-white/10 rounded text-xs text-blue-200">
                          {categoryLabel}
                        </span>
                      )}
                      {platform && (
                        <span className="px-2 py-1 bg-white/10 rounded text-xs text-blue-200">
                          {platform}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Details card */}
              <div className="rounded-2xl border border-slate-200 shadow-xl shadow-black/5 p-6 space-y-4">
                {cs.client && (
                  <MetaRow icon={<User className="h-4 w-4" />} label="Client" value={cs.client} />
                )}
                {industryLabel && (
                  <MetaRow icon={<Building2 className="h-4 w-4" />} label="Industry" value={industryLabel} />
                )}
                {platform && (
                  <MetaRow icon={<Layers className="h-4 w-4" />} label="Platform" value={platform} />
                )}
                {duration && (
                  <MetaRow icon={<Clock className="h-4 w-4" />} label="Duration" value={duration} />
                )}
                {servicesData.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                      <Wrench className="h-4 w-4" />
                    </span>
                    <div className="flex gap-3 items-start pt-0.5">
                      <span className="text-sm text-slate-500 w-20 shrink-0">Services</span>
                      <div className="flex flex-wrap gap-2">
                        {servicesData.map((svc) => (
                          <Link
                            key={svc.slug}
                            href={`/${svc.slug}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-colors"
                          >
                            {svc.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {productsData.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      <Package className="h-4 w-4" />
                    </span>
                    <div className="flex gap-3 items-start pt-0.5">
                      <span className="text-sm text-slate-500 w-20 shrink-0">Products</span>
                      <div className="flex flex-wrap gap-2">
                        {productsData.map((p) => (
                          <Link
                            key={p.slug}
                            href={`/products/${p.slug}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors"
                          >
                            {p.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Tabbed content + sidebar ── */}
        <CaseStudyTabs project={cs} />

        {/* ── Bottom CTA banner ── */}
        <section className="bg-brand-600 py-12">
          <div className="container max-w-6xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-[38px] font-extrabold text-white leading-tight">
                    Let&apos;s Build Something Amazing Together!
                  </h2>
                  <p className="text-blue-100 text-base mt-0.5">
                    Share your requirements and we&apos;ll craft the perfect solution.
                  </p>
                </div>
              </div>
              <Link
                href="/request-a-quote#quote-form"
                className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-white text-white font-semibold hover:bg-white hover:text-brand-600 transition-colors whitespace-nowrap"
              >
                Request a Free Quote
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}

/* ── Helper component ── */
function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
        {icon}
      </span>
      <div className="flex gap-3 items-start">
        <span className="text-sm text-slate-500 w-20 shrink-0 pt-0.5">{label}</span>
        <span className="text-sm font-semibold text-slate-800">{value}</span>
      </div>
    </div>
  )
}
