import { getPayload } from '@/lib/payload'
import { getPage, field, getContactHref, withQuoteAnchor, withContactAnchor } from '@/lib/settings'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Users } from 'lucide-react'
import { ServicesGridRenderer } from '@/components/blocks/ServicesGridRenderer'
import { PortfolioGridRenderer } from '@/components/blocks/PortfolioGridRenderer'
import { TeamRenderer } from '@/components/blocks/TeamRenderer'
import { TestimonialsRenderer } from '@/components/blocks/TestimonialsRenderer'

export const revalidate = 0

// About Us lives as a row in the shared `pages` (Site Pages) collection,
// not a dedicated settings collection — same as any other generic CMS page.
export async function generateMetadata(): Promise<Metadata> {
  const p = await getPage('about-us')
  return {
    title: field(p, 'seoTitle') || undefined,
    description: field(p, 'seoDescription') || undefined,
    alternates: { canonical: '/about-us' },
  }
}

async function featured(payload: Awaited<ReturnType<typeof getPayload>>, collection: string, limit: number, sort = 'order') {
  try {
    const { docs } = await payload.find({
      collection,
      where: { status: { equals: 'published' }, featured: { equals: true } },
      limit,
      sort,
      depth: 1,
    })
    return docs as any[]
  } catch {
    return []
  }
}

export default async function AboutUsPage() {
  const payload = await getPayload()
  const [pg, contactHref, services, projects, team, testimonials] = await Promise.all([
    getPage('about-us'),
    getContactHref(),
    featured(payload, 'services', 5),
    featured(payload, 'projects', 3),
    featured(payload, 'team-members', 5),
    featured(payload, 'testimonials', 6),
  ])

  const stats = [1, 2, 3]
    .map((i) => ({ value: field(pg, `stat${i}Value`), label: field(pg, `stat${i}Label`) }))
    .filter((s) => s.value || s.label)

  return (
    <div>
      {/* ── HERO (light theme, matches the blog/services hero redesign) ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50 pt-28 pb-14 sm:pt-32 lg:pt-40 lg:pb-24">
        <div className="absolute inset-0 w-full pointer-events-none hidden md:block">
          <Image src="/images/blog-hero.png" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-white/55" />
        </div>

        <div className="container relative z-10 text-center max-w-3xl">
          <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-sm font-semibold">
            <Users className="h-4 w-4" />
            {field(pg, 'heroBadge')}
          </span>
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl text-slate-900 leading-tight">
            {field(pg, 'heroTitle')}<br />
            <span className="bg-clip-text text-transparent animate-gradient-text">{field(pg, 'heroTitleHighlight')}</span>
          </h1>
          <p className="mt-6 text-base font-inter text-slate-500 leading-relaxed max-w-2xl mx-auto">
            {field(pg, 'heroSubtitle')}
          </p>
          <div className="mt-8 flex items-center gap-3 justify-center">
            {field(pg, 'heroPrimaryCtaLink') && (
              <Link
                href={withContactAnchor(withQuoteAnchor(field(pg, 'heroPrimaryCtaLink')), contactHref)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 hover:opacity-90 text-white font-semibold text-base transition-opacity"
              >
                {field(pg, 'heroPrimaryCtaLabel')} <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            )}
            {field(pg, 'heroSecondaryCtaLink') && (
              <Link
                href={withContactAnchor(withQuoteAnchor(field(pg, 'heroSecondaryCtaLink')), contactHref)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 font-medium text-base transition-colors"
              >
                {field(pg, 'heroSecondaryCtaLabel')}
              </Link>
            )}
          </div>
        </div>

        {/* Stats row */}
        {stats.length > 0 && (
          <div className="container relative z-10 mt-14 hidden sm:block">
            <div
              className="grid gap-2 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md shadow-lg shadow-slate-200/50 px-6 py-5 max-w-2xl mx-auto"
              style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
            >
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 text-center">
                  <p className="text-2xl font-black text-slate-900">{s.value}</p>
                  <p className="text-sm text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── SOLUTIONS / SERVICES ─────────────────────────── */}
      {services.length > 0 && (
        <ServicesGridRenderer
          eyebrow={field(pg, 'solutionsEyebrow')}
          description={field(pg, 'solutionsSubtitle')}
          services={services}
          showViewAll
          viewAllLabel={field(pg, 'servicesViewAllLabel')}
        />
      )}

      {/* ── PROJECTS / PORTFOLIO ─────────────────────────── */}
      {projects.length > 0 && (
        <PortfolioGridRenderer
          eyebrow={field(pg, 'projectsEyebrow')}
          heading={field(pg, 'projectsTitle')}
          projects={projects}
          showViewAll
          viewAllLabel={field(pg, 'projectsViewAllLabel')}
        />
      )}

      {/* ── TEAM ──────────────────────────────────────────── */}
      {team.length > 0 && (
        <TeamRenderer
          eyebrow={field(pg, 'teamEyebrow')}
          heading={field(pg, 'teamSubtitle')}
          members={team}
          showViewAll
          viewAllLabel={field(pg, 'teamViewAllLabel')}
        />
      )}

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      {testimonials.length > 0 && (
        <TestimonialsRenderer
          eyebrow={field(pg, 'testimonialsEyebrow')}
          heading={field(pg, 'testimonialsTitle')}
          testimonials={testimonials}
          style="grid"
        />
      )}

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="py-14 bg-brand-600">
        <div className="container max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <h2 className="text-[38px] font-extrabold text-white leading-tight">
                {field(pg, 'ctaBannerTitle')}
              </h2>
              <p className="text-blue-100 text-base mt-1">
                {field(pg, 'ctaBannerSubtitle')}
              </p>
            </div>
            <Link
              href={withContactAnchor(withQuoteAnchor(field(pg, 'ctaBannerButtonLink', '/request-a-quote')), contactHref)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-600 font-bold text-sm hover:bg-blue-50 transition-colors whitespace-nowrap shrink-0"
            >
              {field(pg, 'ctaBannerButtonLabel', 'Request a Quote')} <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
