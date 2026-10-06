import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload'
import { generateMetadata as genMeta, buildBreadcrumbJsonLd } from '@/lib/seo'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, User, Building2, Layers, Clock, Wrench, Rocket, ChevronRight, BookOpen } from 'lucide-react'
import CaseStudyTabs from '@/components/CaseStudyTabs'

interface Props { params: Promise<{ slug: string }> }

export const revalidate = 0

export async function generateStaticParams() {
  try {
    const { docs } = await (await getPayload()).find({ collection: 'projects', limit: 100 })
    return (docs as any[]).map((d) => ({ slug: d.slug })).filter((p) => p.slug)
  } catch { return [] }
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
  })
  if (!docs[0]) return { title: 'Project Not Found' }
  return genMeta(docs[0] as any, `/works/${slug}`)
}

const CATEGORY_LABELS: Record<string, string> = {
  'ecommerce': 'E-Commerce',
  'mobile-app': 'Mobile App',
  'web-development': 'Web Development',
  'travel': 'Travel',
  'food-delivery': 'Food Delivery',
  'real-estate': 'Real Estate',
  'healthcare': 'Healthcare',
  'other': 'Other',
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload()

  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
    depth: 2,
  })

  const project = docs[0] as any
  if (!project) notFound()

  // The deep-dive case study that expands on this portfolio entry (if any).
  const csDoc = project.caseStudies?.docs?.[0]
  const caseStudySlug = csDoc ? (typeof csDoc === 'string' ? null : csDoc.slug) : null

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', item: '/' },
    { name: 'Portfolio', item: '/works' },
    { name: project.title, item: `/works/${slug}` },
  ])

  const categoryLabel = CATEGORY_LABELS[project.category] ?? project.category ?? ''

  // Build structured service objects (with slug for linking)
  const servicesData: Array<{ title: string; slug: string }> = (project.services ?? [])
    .map((s: any) => typeof s === 'string' ? null : { title: s.title, slug: s.slug })
    .filter(Boolean)

  const industryLabel = typeof project.industry === 'object'
    ? project.industry?.title
    : project.industry

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div>

        {/* ── Hero (light theme, matches the services/blog hero redesign) ──── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50 pt-24 pb-14 sm:pt-28 lg:pt-32 lg:pb-24">
          <div className="absolute inset-0 pointer-events-none hidden md:block">
            <Image src="/images/portfolio-detail-hero.png" alt="" fill className="object-cover" priority />
          </div>

          <div className="container relative z-10 max-w-3xl">
            <nav className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-6">
              <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <Link href="/works" className="hover:text-brand-600 transition-colors">Portfolio</Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="text-slate-700">{project.title}</span>
            </nav>
          </div>

          <div className="container relative z-10 text-center max-w-3xl">
            {categoryLabel && (
              <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-sm font-semibold">
                <Layers className="h-4 w-4" />
                {categoryLabel}
              </span>
            )}
            <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl text-slate-900 leading-tight">
              {project.title}
            </h1>
            {project.excerpt && (
              <p className="mt-6 text-base font-inter text-slate-500 leading-relaxed max-w-2xl mx-auto">{project.excerpt}</p>
            )}
            {(project.liveUrl || caseStudySlug) && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 hover:opacity-90 text-white font-semibold text-sm transition-opacity shadow-sm whitespace-nowrap"
                  >
                    Visit Live Site
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </a>
                )}
                {caseStudySlug && (
                  <Link
                    href={`/case-studies/${caseStudySlug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 font-medium text-sm transition-colors whitespace-nowrap"
                  >
                    <BookOpen className="h-4 w-4 shrink-0" />
                    Read the Case Study
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Results as a stats row, mirroring the listing-page hero */}
          {project.results?.length > 0 && (
            <div className="container relative z-10 mt-16 hidden sm:block">
              <div
                className="grid gap-2 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md shadow-lg shadow-slate-200/50 px-6 py-5 max-w-3xl mx-auto"
                style={{ gridTemplateColumns: `repeat(${Math.min(project.results.length, 4)}, minmax(0, 1fr))` }}
              >
                {project.results.slice(0, 4).map((r: any, i: number) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 text-center">
                    <p className="text-2xl font-black text-slate-900">{r.metric}</p>
                    <p className="text-sm text-slate-500">{r.label}</p>
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
              <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-2xl shadow-black/10 min-h-[280px] lg:min-h-[360px] flex items-center justify-center text-slate-900">
                <Image
                  src={project.coverImage?.url || '/images/portfolio-default.png'}
                  alt={`${project.title} mockup`}
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>

              {/* Details card */}
              <div className="rounded-2xl border border-slate-200 shadow-xl shadow-black/5 p-6 space-y-4">
                {project.client && (
                  <MetaRow icon={<User className="h-4 w-4" />} label="Client" value={project.client} />
                )}
                {industryLabel && (
                  <MetaRow icon={<Building2 className="h-4 w-4" />} label="Industry" value={industryLabel} />
                )}
                {project.platform && (
                  <MetaRow icon={<Layers className="h-4 w-4" />} label="Platform" value={project.platform} />
                )}
                {project.duration && (
                  <MetaRow icon={<Clock className="h-4 w-4" />} label="Duration" value={project.duration} />
                )}
                {servicesData.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                      <Wrench className="h-4 w-4" />
                    </span>
                    <div className="flex gap-3 items-start pt-0.5">
                      <span className="text-[15px] text-slate-500 w-20 shrink-0">Services</span>
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
              </div>
            </div>
          </div>
        </section>

        {/* ── Tabbed content + sidebar ── */}
        <CaseStudyTabs project={project} basePath="/works" />

        {/* ── Bottom CTA ── */}
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
                <ChevronRight className="h-4 w-4 shrink-0" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
        {icon}
      </span>
      <div className="flex gap-3 items-start">
        <span className="text-[15px] text-slate-500 w-20 shrink-0 pt-0.5">{label}</span>
        <span className="text-[15px] font-semibold text-slate-800">{value}</span>
      </div>
    </div>
  )
}
