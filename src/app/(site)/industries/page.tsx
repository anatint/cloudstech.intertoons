import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, ArrowRight, Building2, FolderOpen, Award } from 'lucide-react'
import { getPayload } from '@/lib/payload'
import { getPage, field } from '@/lib/settings'
import { lucideIcon } from '@/lib/icons'

export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const p = await getPage('industries')
  return {
    title: field(p, 'seoTitle') || undefined,
    description: field(p, 'seoDescription') || undefined,
    alternates: { canonical: '/industries' },
  }
}

export default async function IndustriesPage() {
  const payload = await getPayload()
  const pg = await getPage('industries')
  const { docs: industries } = await payload.find({
    collection: 'industries',
    where: { status: { equals: 'published' } },
    sort: 'order',
    limit: 200,
  })

  return (
    <div>
      <section className="bg-[#050B2A] relative overflow-hidden pt-28 pb-14 sm:pt-32 lg:pt-40 lg:pb-24">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-b from-brand-600/25 to-transparent" />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle,#3B73F6 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="container relative z-10 text-center max-w-3xl">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-brand-600/20 text-brand-400 text-xs font-bold uppercase tracking-widest border border-brand-500/30">
            {field(pg, 'heroBadge')}
          </span>
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl text-white leading-tight">
            {field(pg, 'heroTitle')}{' '}
            <span className="text-brand-400">{field(pg, 'heroTitleHighlight')}</span>
          </h1>
          <p className="mt-6 text-base font-inter text-blue-200 leading-relaxed max-w-2xl mx-auto">
            {field(pg, 'heroSubtitle')}
          </p>
          <div className="mt-8 flex items-center gap-3 justify-center">
            <Link
              href={field(pg, 'heroPrimaryCtaLink')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base transition-colors"
            >
              {field(pg, 'heroPrimaryCtaLabel')} <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            <Link
              href={field(pg, 'heroSecondaryCtaLink')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white font-medium text-base transition-colors"
            >
              {field(pg, 'heroSecondaryCtaLabel')}
            </Link>
          </div>
        </div>

        {/* Stats row inside hero */}
        <div className="container relative z-10 mt-16 hidden sm:block">
          <div className="grid grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden max-w-2xl mx-auto">
            {[
              <Building2 className="h-5 w-5 text-brand-400" key="building" />,
              <FolderOpen className="h-5 w-5 text-brand-400" key="folder" />,
              <Award className="h-5 w-5 text-brand-400" key="award" />,
            ].map((icon, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm px-6 py-5 flex flex-col items-center gap-1.5 text-center">
                {icon}
                <p className="text-2xl font-black text-white">{field(pg, `stat${i + 1}Value`)}</p>
                <p className="text-xs text-slate-400">{field(pg, `stat${i + 1}Label`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container max-w-6xl grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(industries as any[]).map((ind) => {
            const Icon = lucideIcon(ind.icon)
            return (
              <Link key={ind.slug || ind.id} href={`/industries/${ind.slug}`}
                className="group p-6 rounded-2xl border border-slate-100 bg-white hover:border-brand-200 hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-brand-600" />
                </div>
                <h2 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{ind.name}</h2>
                {ind.description && <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">{ind.description}</p>}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">{field(pg, 'exploreLabel')} <ArrowRight className="h-4 w-4" /></span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="bg-brand-600 py-12">
        <div className="container max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-5">
          <h2 className="text-[38px] font-extrabold text-white">{field(pg, 'ctaBannerTitle')}</h2>
          <Link href={field(pg, 'ctaBannerButtonLink')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white text-white font-semibold hover:bg-white hover:text-brand-600 transition-colors">
            {field(pg, 'ctaBannerButtonLabel')} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
