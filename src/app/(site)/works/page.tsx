import { getPayload } from '@/lib/payload'
import { field } from '@/lib/settings'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, FolderOpen, Layers, Globe, Rocket } from 'lucide-react'
import PortfolioGrid from '@/components/PortfolioGrid'

export const revalidate = 0

// Portfolio page copy lives in its own dedicated collection (`PortfolioPage`),
// separate from the shared `SitePages` collection used by other listing pages.
async function getPortfolioPage() {
  try {
    const { docs } = await (await getPayload()).find({ collection: 'portfolio-page-settings', limit: 1 })
    return docs[0] ?? {}
  } catch {
    return {}
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const p = await getPortfolioPage()
  return {
    title: field(p, 'seoTitle') || undefined,
    description: field(p, 'seoDescription') || undefined,
  }
}

export default async function PortfolioPage() {
  const payload = await getPayload()
  const pg = await getPortfolioPage()

  const { docs: projects } = await payload.find({
    collection: 'projects',
    where: { status: { equals: 'published' } },
    limit: 100,
    sort: 'order',
    depth: 1,
  })

  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-28 pb-16 sm:pt-32 lg:pt-40 lg:pb-20">
        {/* Device mockup illustration + floating platform icon accents, reused
            from the home hero (code/Shopify), positioned around it. */}
        <div className="absolute inset-0 w-full pointer-events-none hidden md:block">
          <Image
            src="/images/portfolio-background.png"
            alt=""
            fill
            className="object-contain object-right"
            priority
          />
          <div className="absolute top-[14%] right-[6%] h-28 w-28 hidden lg:block">
            <div className="hero-float-icon relative h-full w-full [animation-delay:0s]">
              <Image src="/images/icon-2-hero.png" alt="" fill className="object-contain drop-shadow-lg" />
            </div>
          </div>
          <div className="absolute bottom-[18%] right-[36%] h-24 w-24 hidden lg:block">
            <div className="hero-float-icon relative h-full w-full [animation-delay:0.7s]">
              <Image src="/images/icon-1-hero.png" alt="" fill className="object-contain drop-shadow-lg" />
            </div>
          </div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600 mb-4">
              {field(pg, 'heroBadge')}
            </p>
            <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-[70px] text-slate-900 leading-tight">
              {field(pg, 'heroTitle')}<br />
              <span className="bg-clip-text text-transparent animate-gradient-text">{field(pg, 'heroTitleHighlight')}</span>
            </h1>
            <p className="mt-6 text-base font-inter text-slate-500 leading-relaxed max-w-xl">
              {field(pg, 'heroSubtitle')}
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Link
                href={field(pg, 'heroPrimaryCtaLink')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-brand-600 hover:opacity-90 text-white font-semibold text-base transition-opacity"
              >
                {field(pg, 'heroPrimaryCtaLabel')} <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <Link
                href={field(pg, 'heroSecondaryCtaLink')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 font-medium text-base transition-colors"
              >
                {field(pg, 'heroSecondaryCtaLabel')}
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-14 hidden sm:block">
            <div className="grid grid-cols-3 gap-px bg-slate-200 rounded-2xl overflow-hidden max-w-2xl border border-slate-200">
              {[
                <FolderOpen className="h-5 w-5 text-violet-600" key="folder" />,
                <Layers className="h-5 w-5 text-violet-600" key="layers" />,
                <Globe className="h-5 w-5 text-violet-600" key="globe" />,
              ].map((icon, i) => (
                <div key={i} className="bg-white px-6 py-5 flex flex-col items-center gap-1.5 text-center">
                  {icon}
                  <p className="text-2xl font-black text-slate-900">{field(pg, `stat${i + 1}Value`)}</p>
                  <p className="text-sm text-slate-500">{field(pg, `stat${i + 1}Label`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTERABLE GRID (client component) ─────────── */}
      <PortfolioGrid
        projects={projects as any[]}
        noProjectsMessage={field(pg, 'noProjectsMessage')}
        featuredBadgeLabel={field(pg, 'featuredBadgeLabel')}
        clientLabelPrefix={field(pg, 'clientLabelPrefix')}
        viewProjectLabel={field(pg, 'viewProjectLabel')}
      />

      {/* ── BOTTOM CTA ───────────────────────────────────── */}
      <section className="py-14 bg-gradient-to-r from-violet-600 via-brand-600 to-cyan-500">
        <div className="container max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Rocket className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <h2 className="text-[38px] font-extrabold text-white leading-tight">
                  {field(pg, 'ctaBannerTitle')}
                </h2>
                <p className="text-blue-100 text-base mt-1">
                  {field(pg, 'ctaBannerSubtitle')}
                </p>
              </div>
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
