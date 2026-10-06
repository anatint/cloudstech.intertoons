import { getPayload } from '@/lib/payload'
import { field } from '@/lib/settings'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, TrendingUp, Award } from 'lucide-react'
import CaseStudyGrid from '@/components/CaseStudyGrid'

export const revalidate = 0

// Case studies page copy lives in its own dedicated collection (`CaseStudiesPage`),
// separate from the shared `SitePages` collection used by other listing pages.
async function getCaseStudiesPage() {
  try {
    const { docs } = await (await getPayload()).find({ collection: 'case-studies-page-settings', limit: 1 })
    return docs[0] ?? {}
  } catch {
    return {}
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const p = await getCaseStudiesPage()
  return {
    title: field(p, 'seoTitle') || undefined,
    description: field(p, 'seoDescription') || undefined,
  }
}

export default async function CaseStudiesPage() {
  const payload = await getPayload()
  const pg = await getCaseStudiesPage()

  const { docs: caseStudies } = await payload.find({
    collection: 'case-studies',
    where: { status: { equals: 'published' } },
    limit: 50,
    sort: 'order',
    depth: 1,
  })

  const totalCount = caseStudies.length

  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="bg-[#050B2A] relative overflow-hidden pt-28 pb-14 sm:pt-32 lg:pt-40 lg:pb-24">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-b from-brand-600/25 to-transparent" />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle,#3B73F6 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="container relative z-10 text-center max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-400 mb-4">
            {field(pg, 'heroBadge')}
          </p>
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl text-white leading-tight">
            {field(pg, 'heroTitle')}<br />
            <span className="text-brand-400">{field(pg, 'heroTitleHighlight')}</span>
          </h1>
          <p className="mt-6 text-base font-inter text-blue-200 leading-relaxed max-w-2xl mx-auto">
            {field(pg, 'heroSubtitle')}
          </p>
        </div>

        {/* Stats row */}
        <div className="container relative z-10 mt-14 hidden sm:block">
          <div className="grid grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden max-w-2xl mx-auto">
            {[
              { icon: <BookOpen className="h-5 w-5 text-brand-400" />,   value: `${totalCount || '15'}+`, labelKey: 'stat1Label' },
              { icon: <TrendingUp className="h-5 w-5 text-brand-400" />, valueKey: 'stat2Value',           labelKey: 'stat2Label' },
              { icon: <Award className="h-5 w-5 text-brand-400" />,      valueKey: 'stat3Value',           labelKey: 'stat3Label' },
            ].map((s: any, i: number) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm px-6 py-5 flex flex-col items-center gap-1.5 text-center">
                {s.icon}
                <p className="text-2xl font-black text-white">{s.value ?? field(pg, s.valueKey)}</p>
                <p className="text-xs text-slate-400">{field(pg, s.labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTERABLE GRID (client component) ─────────── */}
      <CaseStudyGrid
        projects={caseStudies as any[]}
        noCaseStudiesMessage={field(pg, 'noCaseStudiesMessage')}
        featuredBadgeLabel={field(pg, 'featuredBadgeLabel')}
        caseStudyBadgeLabel={field(pg, 'caseStudyBadgeLabel')}
        clientLabelPrefix={field(pg, 'clientLabelPrefix')}
        readCaseStudyLabel={field(pg, 'readCaseStudyLabel')}
      />

      {/* ── BOTTOM CTA ───────────────────────────────────── */}
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
            <div className="flex gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href={field(pg, 'ctaBannerPrimaryLink')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-600 font-bold text-sm hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                {field(pg, 'ctaBannerPrimaryLabel')} <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <Link
                href={field(pg, 'ctaBannerSecondaryLink')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-white/50 text-white font-semibold text-sm hover:border-white transition-colors whitespace-nowrap"
              >
                {field(pg, 'ctaBannerSecondaryLabel')}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
